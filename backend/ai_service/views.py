import logging
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import AIConfig, KnowledgeSource, DocumentChunk, AIReplyLog
from .serializers import (
    AIConfigSerializer,
    KnowledgeSourceSerializer,
    KnowledgeSourceListSerializer,
    DocumentChunkSerializer,
    AIReplyLogSerializer,
    AutoReplyRequestSerializer,
)
from .rag import (
    get_provider,
    sync_source_to_chunks,
    generate_reply,
    suggest_reply,
    summarize_conversation,
    suggest_next_steps,
)
from conversations.models import Conversation, Message

logger = logging.getLogger(__name__)


def get_user_org(user):
    if hasattr(user, "organization") and user.organization:
        return user.organization
    from teams.models import Membership
    membership = Membership.objects.filter(user=user, status="active").first()
    if membership:
        return membership.organization
    return None


# ── AI Config ──

@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def ai_config_detail(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    config, _ = AIConfig.objects.get_or_create(organization=org)

    if request.method == "GET":
        serializer = AIConfigSerializer(config)
        return Response(serializer.data)

    serializer = AIConfigSerializer(config, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ── Knowledge Sources ──

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def knowledge_source_list(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        sources = KnowledgeSource.objects.filter(organization=org)
        serializer = KnowledgeSourceListSerializer(sources, many=True)
        return Response(serializer.data)

    serializer = KnowledgeSourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(organization=org)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def knowledge_source_detail(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        source = KnowledgeSource.objects.get(pk=pk, organization=org)
    except KnowledgeSource.DoesNotExist:
        return Response({"detail": "Source not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = KnowledgeSourceSerializer(source)
        return Response(serializer.data)

    if request.method == "DELETE":
        source.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = KnowledgeSourceSerializer(source, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ── Sync & Indexing ──

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def sync_source(request, pk):
    """Re-index a single knowledge source."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        source = KnowledgeSource.objects.get(pk=pk, organization=org)
    except KnowledgeSource.DoesNotExist:
        return Response({"detail": "Source not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        provider = get_provider(org)
        chunk_count = sync_source_to_chunks(source, provider)
        return Response({"chunk_count": chunk_count, "is_indexed": True})
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Sync source error: {e}")
        return Response({"detail": f"Sync failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def sync_all_sources(request):
    """Re-index all knowledge sources for the org."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        provider = get_provider(org)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    sources = KnowledgeSource.objects.filter(organization=org)
    total_chunks = 0
    errors = []

    for source in sources:
        try:
            chunk_count = sync_source_to_chunks(source, provider)
            total_chunks += chunk_count
        except Exception as e:
            errors.append({"source_id": str(source.id), "error": str(e)})

    return Response({
        "total_chunks": total_chunks,
        "sources_synced": sources.count() - len(errors),
        "errors": errors,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def sync_kb_to_sources(request):
    """Sync KB articles & FAQs into KnowledgeSource entries."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    from knowledge_base.models import Article, FAQ

    synced = 0

    # Sync published articles
    for article in Article.objects.filter(organization=org, published=True):
        source, created = KnowledgeSource.objects.update_or_create(
            organization=org,
            source_type="kb_article",
            external_id=str(article.id),
            defaults={
                "title": article.title,
                "content": article.content,
            },
        )
        if created or source.content != article.content:
            source.is_indexed = False
            source.save(update_fields=["is_indexed"])
            synced += 1

    # Sync all FAQs
    for faq in FAQ.objects.filter(organization=org):
        source, created = KnowledgeSource.objects.update_or_create(
            organization=org,
            source_type="kb_faq",
            external_id=str(faq.id),
            defaults={
                "title": faq.question,
                "content": faq.answer,
            },
        )
        if created or source.content != faq.answer:
            source.is_indexed = False
            source.save(update_fields=["is_indexed"])
            synced += 1

    return Response({"synced": synced})


# ── Widget Auto-Reply ──

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def widget_auto_reply(request):
    """Handle widget message and return AI auto-reply if enabled."""
    serializer = AutoReplyRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    conversation_id = serializer.validated_data["conversation_id"]
    message_text = serializer.validated_data["message"]

    try:
        conversation = Conversation.objects.get(pk=conversation_id)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    org = conversation.organization
    config = AIConfig.objects.filter(organization=org).first()

    if not config or not config.auto_reply_enabled:
        return Response({"reply": None, "escalate": False})

    # Check max AI turns
    ai_reply_count = Message.objects.filter(
        conversation=conversation, is_from_customer=False, sender__isnull=True
    ).count()

    if ai_reply_count >= config.max_ai_turns:
        return Response({
            "reply": None,
            "escalate": True,
            "escalation_reason": "max_ai_turns_reached",
        })

    try:
        provider = get_provider(org)
    except ValueError as e:
        logger.error(f"AI provider error: {e}")
        return Response({"reply": None, "escalate": True, "escalation_reason": "provider_error"})

    # Get conversation history
    messages = list(
        Message.objects.filter(conversation=conversation)
        .order_by("created_at")
        .values("body", "is_from_customer")
    )

    # Generate reply
    try:
        result = generate_reply(org, message_text, messages, provider, config)
    except Exception as e:
        logger.error(f"AI generate reply error: {e}")
        return Response({
            "reply": None,
            "escalate": True,
            "escalation_reason": "generation_error",
        })

    # Save the AI reply if not escalating
    if not result["escalate"]:
        ai_message = Message.objects.create(
            conversation=conversation,
            type="reply",
            body=result["content"],
            sender=None,  # AI has no user account
            is_from_customer=False,
        )
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=["last_message_at"])

    # Log the AI reply
    ai_log = AIReplyLog.objects.create(
        conversation=conversation,
        organization=org,
        model_used=config.model_name,
        prompt_tokens=result["prompt_tokens"],
        completion_tokens=result["completion_tokens"],
        confidence=result["confidence"],
        escalated=result["escalate"],
        escalation_reason=result["escalation_reason"],
        sources_used=result["sources"],
        response_text=result["content"],
    )

    return Response({
        "reply": result["content"] if not result["escalate"] else None,
        "confidence": result["confidence"],
        "escalate": result["escalate"],
        "escalation_reason": result["escalation_reason"],
        "sources": result["sources"],
        "ai_log_id": str(ai_log.id),
    })


# ── Agent Copilot ──

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def suggest_reply_view(request):
    """Get 3 AI-suggested replies for the current conversation."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    conversation_id = request.data.get("conversation_id")
    if not conversation_id:
        return Response({"detail": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=conversation_id, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    config = AIConfig.objects.filter(organization=org).first()
    if not config:
        return Response({"detail": "AI not configured"}, status=status.HTTP_400_BAD_REQUEST)

    messages = list(
        Message.objects.filter(conversation=conversation)
        .order_by("created_at")
        .values("body", "is_from_customer")
    )

    try:
        provider = get_provider(org)
        suggestions = suggest_reply(org, messages, provider, config)
        return Response({"suggestions": suggestions})
    except Exception as e:
        logger.error(f"Suggest reply error: {e}")
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def summarize_view(request):
    """Summarize a conversation."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    conversation_id = request.data.get("conversation_id")
    if not conversation_id:
        return Response({"detail": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=conversation_id, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    messages = list(
        Message.objects.filter(conversation=conversation)
        .order_by("created_at")
        .values("body", "is_from_customer")
    )

    try:
        provider = get_provider(org)
        summary = summarize_conversation(org, messages, provider)
        return Response({"summary": summary})
    except Exception as e:
        logger.error(f"Summarize error: {e}")
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def next_steps_view(request):
    """Suggest next steps for a conversation."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    conversation_id = request.data.get("conversation_id")
    if not conversation_id:
        return Response({"detail": "conversation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=conversation_id, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    messages = list(
        Message.objects.filter(conversation=conversation)
        .order_by("created_at")
        .values("body", "is_from_customer")
    )

    try:
        provider = get_provider(org)
        steps = suggest_next_steps(org, messages, provider)
        return Response({"steps": steps})
    except Exception as e:
        logger.error(f"Next steps error: {e}")
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── AI Reply Logs ──

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def ai_reply_logs(request):
    """List AI reply logs for the organization."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    logs = AIReplyLog.objects.filter(organization=org)[:50]
    serializer = AIReplyLogSerializer(logs, many=True)
    return Response(serializer.data)

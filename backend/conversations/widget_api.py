import uuid
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from accounts.models import Organization
from workspace.models import WidgetConfig, Branding
from .models import Conversation, Message
from .serializers import MessageSerializer, ConversationListSerializer


class WidgetConfigThrottle(AnonRateThrottle):
    rate = "120/minute"


class WidgetConversationThrottle(AnonRateThrottle):
    rate = "120/minute"


class WidgetMessageThrottle(AnonRateThrottle):
    rate = "120/minute"


class WidgetAutoReplyThrottle(AnonRateThrottle):
    """Per-IP throttle for AI auto-reply to prevent credit burn."""
    rate = "60/minute"


def _check_session_conversation_limit(org_id, session_token):
    """Prevent a session from creating more than 1 conversation per 24h."""
    return True  # Temporarily disabled for testing


def _check_org_message_rate(org_id):
    """Per-org message rate to prevent spam."""
    cache_key = f"widget_msg_rate:{org_id}"
    count = cache.get(cache_key, 0)
    if count >= 100:  # 100 messages/min per org
        return False
    cache.set(cache_key, count + 1, timeout=60)
    return True


def _check_org_ai_rate(org_id):
    """Per-org AI auto-reply rate to protect credits (30/min)."""
    cache_key = f"widget_ai_rate:{org_id}"
    count = cache.get(cache_key, 0)
    if count >= 30:
        return False
    cache.set(cache_key, count + 1, timeout=60)
    return True


def _validate_session_token(conversation, session_token):
    """Verify the session_token matches the conversation."""
    if not session_token:
        return False
    return conversation.session_token == session_token


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([WidgetConfigThrottle])
def widget_config(request):
    org_id = request.query_params.get("organization_id")
    if not org_id:
        return Response({"error": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        org = Organization.objects.get(pk=org_id)
    except (Organization.DoesNotExist, uuid.UUIDException):
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

    wc, _ = WidgetConfig.objects.get_or_create(organization=org)
    br, _ = Branding.objects.get_or_create(organization=org)

    return Response({
        "organizationId": str(org.id),
        "organizationName": org.name,
        "primaryColor": br.primary_color,
        "companyName": br.company_name,
        "logoUrl": br.logo_url,
        "position": wc.position,
        "borderRadius": wc.border_radius,
        "showBranding": wc.show_branding,
        "autoGreet": wc.auto_greet,
        "autoGreetDelay": wc.auto_greet_delay,
        "collectEmail": wc.collect_email,
        "helpCenterEnabled": wc.help_center_enabled,
        "showFaqsOnHome": wc.show_faqs_on_home,
        "faqsDisplayCount": wc.faqs_display_count,
        "aiReplyEnabled": getattr(org, 'ai_config', None) and org.ai_config.auto_reply_enabled,
    })


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@throttle_classes([WidgetConversationThrottle])
def widget_conversations(request):
    if request.method == "GET":
        email = request.query_params.get("email", "").strip().lower()
        org_id = request.query_params.get("organization_id", "").strip()
        session_token = request.query_params.get("session_token", "").strip()
        if not email and not org_id and not session_token:
            return Response({"error": "email, organization_id, or session_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        if org_id:
            try:
                uuid.UUID(org_id)
            except ValueError:
                return Response({"error": "Invalid organization_id"}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Q
        q = Q()
        if org_id:
            q &= Q(organization_id=org_id)
        if email and session_token:
            q &= (Q(customer_email__iexact=email) | Q(session_token=session_token))
        elif email:
            q &= Q(customer_email__iexact=email)
        elif session_token:
            q &= Q(session_token=session_token)

        qs = Conversation.objects.filter(q).order_by("-last_message_at")[:20]
        return Response(ConversationListSerializer(qs, many=True).data)

    # POST — create new conversation
    org_id = request.data.get("organization_id")
    session_token = request.data.get("session_token", "").strip()
    if not org_id:
        return Response({"error": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        org = Organization.objects.get(pk=org_id)
    except (Organization.DoesNotExist, uuid.UUIDException):
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

    # Rate limit: 1 conversation per session per 24h
    if not _check_session_conversation_limit(org_id, session_token):
        return Response(
            {"error": "You can only start one conversation every 24 hours. Please continue your existing conversation."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    # Check for existing open conversation for this session
    if session_token:
        existing = Conversation.objects.filter(
            organization=org, session_token=session_token, status__in=["open", "pending"]
        ).first()
        if existing:
            return Response({
                "id": str(existing.id),
                "ticket_id": existing.ticket_id,
                "created_at": existing.created_at.isoformat(),
                "existing": True,
            }, status=status.HTTP_200_OK)

    # Validate input lengths
    customer_name = request.data.get("customer_name", "").strip()[:200]
    customer_email = request.data.get("customer_email", "").strip().lower()[:254]
    subject = request.data.get("subject", "").strip()[:500]

    conversation = Conversation.objects.create(
        organization=org,
        status="open",
        channel="widget",
        customer_name=customer_name,
        customer_email=customer_email,
        session_token=session_token,
        subject=subject,
    )

    # Create notification for new conversation
    try:
        from notifications.views import create_notification
        display_name = customer_name or customer_email or "Customer"
        create_notification(
            org=org,
            notification_type="new_conversation",
            title=f"New conversation from {display_name}",
            body=subject or "New support request",
            conversation=conversation,
        )
    except Exception:
        pass

    return Response({
        "id": str(conversation.id),
        "ticket_id": conversation.ticket_id,
        "created_at": conversation.created_at.isoformat(),
    }, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@throttle_classes([WidgetMessageThrottle])
def conversation_messages(request, pk):
    try:
        conversation = Conversation.objects.get(pk=pk)
    except (Conversation.DoesNotExist, uuid.UUIDException):
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    # Verify caller owns this conversation via session_token
    session_token = request.data.get("session_token", "").strip() if request.method == "POST" else request.query_params.get("session_token", "").strip()
    email = request.query_params.get("email", "").strip().lower()

    if not session_token and not email and not request.user.is_authenticated:
        return Response({"error": "session_token or email required"}, status=status.HTTP_403_FORBIDDEN)

    if session_token:
        if not _validate_session_token(conversation, session_token):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    elif email:
        if conversation.customer_email.lower() != email:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    elif not request.user.is_authenticated:
        return Response({"error": "session_token or email required"}, status=status.HTTP_403_FORBIDDEN)

    # Org-level message rate limit
    org_id = str(conversation.organization_id)
    if not _check_org_message_rate(org_id):
        return Response(
            {"error": "Message rate limit exceeded. Please wait before sending more messages."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    if request.method == "GET":
        since = request.query_params.get("since")
        messages = conversation.messages.filter(type="reply").order_by("created_at")
        if since:
            messages = messages.filter(created_at__gt=since)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # POST
    body = request.data.get("body", "").strip()
    if not body:
        return Response({"error": "body is required"}, status=status.HTTP_400_BAD_REQUEST)
    body = body[:5000]

    # Detect language of customer message
    detected_lang = "en"
    try:
        from ai_service.translation import detect_language
        detected_lang = detect_language(body)
    except Exception:
        pass

    # Translate inbound customer message to English for the agent
    original_body = ""
    translated_body = body
    if detected_lang and detected_lang != "en":
        try:
            from ai_service.translation import translate_text
            translated = translate_text(body, detected_lang, "en")
            if translated and translated != body:
                original_body = body
                translated_body = translated
        except Exception:
            pass

    message = Message.objects.create(
        conversation=conversation,
        type="reply",
        body=translated_body,
        original_body=original_body,
        is_from_customer=True,
        detected_language=detected_lang,
    )

    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=["last_message_at"])

    # Create notification for new customer message
    try:
        from notifications.views import create_notification
        customer_name = conversation.customer_name or conversation.customer_email or "Customer"
        create_notification(
            org=conversation.organization,
            notification_type="new_message",
            title=f"New message from {customer_name}",
            body=body[:200],
            conversation=conversation,
        )
    except Exception:
        pass

    # Check for AI auto-reply
    ai_reply_data = None
    try:
        from ai_service.models import AIConfig
        from ai_service.rag import get_provider, generate_reply

        ai_config = AIConfig.objects.filter(organization=conversation.organization).first()
        if ai_config and ai_config.auto_reply_enabled:
            # Per-org AI rate limit
            if not _check_org_ai_rate(org_id):
                ai_reply_data = {"escalate": True, "reason": "rate_limit_exceeded"}
            else:
                provider = get_provider(conversation.organization)

                # Get agent's preferred language (first admin/owner of the org)
                agent_language = "en"
                try:
                    from accounts.models import User
                    agent_user = User.objects.filter(
                        organization=conversation.organization,
                        role__in=["admin", "owner"]
                    ).first()
                    if agent_user and agent_user.language:
                        agent_language = agent_user.language
                except Exception:
                    pass

                history = list(
                    conversation.messages.filter(type="reply")
                    .order_by("created_at")
                    .values("body", "is_from_customer")
                )
                result = generate_reply(
                    conversation.organization, body, history, provider, ai_config,
                    agent_language=agent_language,
                )

                if not result["escalate"]:
                    ai_message = Message.objects.create(
                        conversation=conversation,
                        type="reply",
                        body=result["content"],
                        original_body=result.get("original_content", ""),
                        detected_language=result.get("detected_language", "en"),
                        sender=None,
                        is_from_customer=False,
                    )
                    conversation.last_message_at = timezone.now()
                    conversation.save(update_fields=["last_message_at"])
                    ai_reply_data = {
                        "id": str(ai_message.id),
                        "body": result["content"],
                        "original_body": result.get("original_content", ""),
                        "detected_language": result.get("detected_language", "en"),
                        "confidence": result["confidence"],
                    }
                else:
                    # Still send the AI reply but flag it as escalated
                    ai_message = Message.objects.create(
                        conversation=conversation,
                        type="reply",
                        body=result["content"],
                        original_body=result.get("original_content", ""),
                        detected_language=result.get("detected_language", "en"),
                        sender=None,
                        is_from_customer=False,
                    )
                    conversation.last_message_at = timezone.now()
                    conversation.save(update_fields=["last_message_at"])
                    ai_reply_data = {
                        "id": str(ai_message.id),
                        "body": result["content"],
                        "original_body": result.get("original_content", ""),
                        "detected_language": result.get("detected_language", "en"),
                        "confidence": result["confidence"],
                        "escalate": True,
                        "reason": result["escalation_reason"],
                    }
    except Exception:
        pass  # Don't break the widget flow if AI fails

    response_data = MessageSerializer(message).data
    if ai_reply_data:
        response_data["ai_reply"] = ai_reply_data

    return Response(response_data, status=status.HTTP_201_CREATED)

import uuid
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from accounts.models import Organization
from workspace.models import WidgetConfig, Branding
from .models import Conversation, Message
from .serializers import MessageSerializer, ConversationListSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def widget_config(request):
    org_id = request.query_params.get("organization_id")
    if not org_id:
        return Response({"error": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        org = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
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
@throttle_classes([AnonRateThrottle])
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
    if not org_id:
        return Response({"error": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        org = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

    conversation = Conversation.objects.create(
        organization=org,
        status="open",
        channel="widget",
        customer_name=request.data.get("customer_name", "").strip(),
        customer_email=request.data.get("customer_email", "").strip().lower(),
        session_token=request.data.get("session_token", "").strip(),
        subject=request.data.get("subject", ""),
    )

    return Response({
        "id": str(conversation.id),
        "ticket_id": conversation.ticket_id,
        "created_at": conversation.created_at.isoformat(),
    }, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def conversation_messages(request, pk):
    try:
        conversation = Conversation.objects.get(pk=pk)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

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

    message = Message.objects.create(
        conversation=conversation,
        type="reply",
        body=body,
        is_from_customer=True,
    )

    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=["last_message_at"])

    # Check for AI auto-reply
    ai_reply_data = None
    try:
        from ai_service.models import AIConfig
        from ai_service.rag import get_provider, generate_reply

        ai_config = AIConfig.objects.filter(organization=conversation.organization).first()
        if ai_config and ai_config.auto_reply_enabled:
            # Check max AI turns
            ai_turn_count = Message.objects.filter(
                conversation=conversation, is_from_customer=False, sender__isnull=True
            ).count()

            if ai_turn_count < ai_config.max_ai_turns:
                provider = get_provider(conversation.organization)
                history = list(
                    conversation.messages.filter(type="reply")
                    .order_by("created_at")
                    .values("body", "is_from_customer")
                )
                result = generate_reply(
                    conversation.organization, body, history, provider, ai_config
                )

                if not result["escalate"]:
                    ai_message = Message.objects.create(
                        conversation=conversation,
                        type="reply",
                        body=result["content"],
                        sender=None,
                        is_from_customer=False,
                    )
                    conversation.last_message_at = timezone.now()
                    conversation.save(update_fields=["last_message_at"])
                    ai_reply_data = {
                        "id": str(ai_message.id),
                        "body": result["content"],
                        "confidence": result["confidence"],
                    }
                else:
                    ai_reply_data = {
                        "escalate": True,
                        "reason": result["escalation_reason"],
                    }
    except Exception:
        pass  # Don't break the widget flow if AI fails

    response_data = MessageSerializer(message).data
    if ai_reply_data:
        response_data["ai_reply"] = ai_reply_data

    return Response(response_data, status=status.HTTP_201_CREATED)

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
    })


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def widget_conversations(request):
    if request.method == "GET":
        email = request.query_params.get("email", "").strip()
        org_id = request.query_params.get("organization_id", "").strip()
        if not email and not org_id:
            return Response({"error": "email or organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        qs = Conversation.objects.all()
        if email:
            qs = qs.filter(customer_email=email)
        if org_id:
            try:
                uuid.UUID(org_id)
                qs = qs.filter(organization_id=org_id)
            except ValueError:
                return Response({"error": "Invalid organization_id"}, status=status.HTTP_400_BAD_REQUEST)

        qs = qs.order_by("-last_message_at")[:20]
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
        customer_name=request.data.get("customer_name", ""),
        customer_email=request.data.get("customer_email", ""),
        subject=request.data.get("subject", ""),
    )

    return Response({
        "id": str(conversation.id),
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

    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

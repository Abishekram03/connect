import uuid
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationUpdateSerializer,
    MessageCreateSerializer,
    MessageSerializer,
)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_conversations(request):
    conversations = Conversation.objects.filter(
        organization=request.user.organization
    ).select_related("assignee")

    status_filter = request.query_params.get("status")
    if status_filter and status_filter in ("open", "pending", "closed"):
        conversations = conversations.filter(status=status_filter)

    assignee_filter = request.query_params.get("assignee")
    if assignee_filter == "me":
        conversations = conversations.filter(assignee=request.user)
    elif assignee_filter == "unassigned":
        conversations = conversations.filter(assignee__isnull=True)

    customer_email = request.query_params.get("customer_email")
    if customer_email:
        conversations = conversations.filter(customer_email=customer_email)

    page = int(request.query_params.get("page", 1))
    page_size = 20
    start = (page - 1) * page_size
    end = start + page_size
    total = conversations.count()
    conversations = conversations[start:end]

    serializer = ConversationListSerializer(conversations, many=True)
    return Response({
        "results": serializer.data,
        "total": total,
        "page": page,
        "page_size": page_size,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_conversation(request, pk):
    try:
        conversation = Conversation.objects.get(
            pk=pk, organization=request.user.organization
        )
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConversationDetailSerializer(conversation)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_message(request, pk):
    try:
        conversation = Conversation.objects.get(
            pk=pk, organization=request.user.organization
        )
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = MessageCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    message = Message.objects.create(
        conversation=conversation,
        type=serializer.validated_data["type"],
        body=serializer.validated_data["body"],
        sender=request.user,
        is_from_customer=False,
    )

    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=["last_message_at"])

    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def update_conversation(request, pk):
    try:
        conversation = Conversation.objects.get(
            pk=pk, organization=request.user.organization
        )
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConversationUpdateSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    for key, value in serializer.validated_data.items():
        setattr(conversation, key, value)
    conversation.save(update_fields=list(serializer.validated_data.keys()))

    return Response(ConversationDetailSerializer(conversation).data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def assign_conversation(request, pk):
    try:
        conversation = Conversation.objects.get(
            pk=pk, organization=request.user.organization
        )
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    assignee_id = request.data.get("assignee_id")
    if assignee_id:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            assignee = User.objects.get(pk=assignee_id, organization=request.user.organization)
            conversation.assignee = assignee
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        conversation.assignee = request.user

    conversation.save(update_fields=["assignee"])
    return Response(ConversationDetailSerializer(conversation).data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_agents(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    agents = User.objects.filter(
        organization=request.user.organization,
        status="active",
        role__in=["admin", "agent"],
    )
    from accounts.serializers import UserSerializer
    return Response(UserSerializer(agents, many=True).data)

import uuid
from django.utils import timezone
from django.contrib.auth import get_user_model
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

User = get_user_model()


def get_user_org(user):
    if hasattr(user, "organization") and user.organization:
        return user.organization
    from teams.models import Membership
    membership = Membership.objects.filter(user=user, status="active").first()
    if membership:
        return membership.organization
    return None


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_conversations(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    conversations = Conversation.objects.filter(organization=org).select_related("assignee")

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
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=pk, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ConversationDetailSerializer(conversation)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def create_message(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=pk, organization=org)
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
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=pk, organization=org)
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
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=pk, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    assignee_id = request.data.get("assignee_id")
    if assignee_id:
        try:
            assignee = User.objects.get(pk=assignee_id, memberships__organization=org, memberships__status="active")
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
    from teams.models import Membership

    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    agent_user_ids = Membership.objects.filter(
        organization=org, status="active", role__in=["owner", "admin", "agent"]
    ).values_list("user_id", flat=True)

    agents = User.objects.filter(id__in=agent_user_ids)
    from accounts.serializers import UserSerializer

    return Response(UserSerializer(agents, many=True).data)

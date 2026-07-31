import uuid
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count
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

    conversations = Conversation.objects.filter(organization=org).select_related("assignee", "team")

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


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def conversation_detail(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(pk=pk, organization=org)
    except Conversation.DoesNotExist:
        return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ConversationDetailSerializer(conversation)
        return Response(serializer.data)

    if request.method == "DELETE":
        conversation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    serializer = ConversationUpdateSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    for key, value in serializer.validated_data.items():
        setattr(conversation, key, value)
    conversation.save(update_fields=list(serializer.validated_data.keys()))

    return Response(ConversationDetailSerializer(conversation).data)


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

    from teams.models import Team, TeamMembership

    assignee_id = request.data.get("assignee_id")
    team_id = request.data.get("team_id")

    # Assign team
    if team_id is not None:
        if team_id == "":
            conversation.team = None
            conversation.save(update_fields=["team"])
        else:
            try:
                team = Team.objects.get(pk=team_id, organization=org)
                conversation.team = team

                # Auto-assign: if no assignee_id provided, pick least busy team member
                if not assignee_id:
                    team_member_ids = TeamMembership.objects.filter(
                        team=team, role="member"
                    ).values_list("user_id", flat=True)

                    # Also include team admins
                    team_admin_ids = TeamMembership.objects.filter(
                        team=team, role="admin"
                    ).values_list("user_id", flat=True)

                    all_member_ids = list(set(list(team_member_ids) + list(team_admin_ids)))

                    if all_member_ids:
                        # Find member with fewest active conversations
                        member_conversation_counts = (
                            Conversation.objects.filter(
                                assignee_id__in=all_member_ids,
                                status__in=["open", "pending"],
                            )
                            .values("assignee_id")
                            .annotate(count=Count("id"))
                            .order_by("count")
                        )
                        assigned_ids = {c["assignee_id"] for c in member_conversation_counts}
                        for mid in all_member_ids:
                            if mid not in assigned_ids:
                                conversation.assignee_id = mid
                                break
                        else:
                            # All members have conversations, pick the one with fewest
                            if member_conversation_counts:
                                conversation.assignee_id = member_conversation_counts[0]["assignee_id"]

                conversation.save(update_fields=["team", "assignee"])
            except Team.DoesNotExist:
                return Response({"detail": "Team not found"}, status=status.HTTP_404_NOT_FOUND)

    # Assign individual member (overrides auto-assign)
    if assignee_id:
        try:
            assignee = User.objects.get(pk=assignee_id, memberships__organization=org, memberships__status="active")
            conversation.assignee = assignee

            # Auto-detect team from agent's membership if no team was explicitly set
            if not team_id and not conversation.team_id:
                agent_team = TeamMembership.objects.filter(
                    user=assignee, team__organization=org
                ).select_related("team").first()
                if agent_team:
                    conversation.team = agent_team.team

        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    elif assignee_id == "" and not team_id:
        # Explicitly unassign
        conversation.assignee = None

    if assignee_id or assignee_id == "":
        conversation.save(update_fields=["assignee", "team"])

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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_teams(request):
    from teams.models import Team

    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    teams = Team.objects.filter(organization=org).order_by("name")
    data = [{"id": str(t.id), "name": t.name, "description": t.description} for t in teams]
    return Response(data)

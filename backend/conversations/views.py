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

    # Check for SLA breaches on open conversations
    now = timezone.now()
    breached = conversations.filter(
        status__in=["open", "pending"],
        sla_deadline__isnull=False,
        sla_deadline__lt=now,
        sla_breached=False,
    )
    if breached.exists():
        breached.update(sla_breached=True)

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

    # Track resolved time when status changes to closed
    if "status" in serializer.validated_data and serializer.validated_data["status"] == "closed":
        if not conversation.resolved_at:
            conversation.resolved_at = timezone.now()

    # Recompute SLA deadline when priority changes
    if "priority" in serializer.validated_data:
        conversation.sla_deadline = conversation.compute_sla_deadline()

    update_fields = list(serializer.validated_data.keys())
    if "resolved_at" not in update_fields and "status" in update_fields:
        update_fields.append("resolved_at")
    if "sla_deadline" not in update_fields and "priority" in update_fields:
        update_fields.append("sla_deadline")
    conversation.save(update_fields=update_fields)

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

    body = serializer.validated_data["body"]
    msg_type = serializer.validated_data["type"]

    message = Message.objects.create(
        conversation=conversation,
        type=msg_type,
        body=body,
        sender=request.user,
        is_from_customer=False,
    )

    # ALWAYS translate outbound reply to customer's detected language
    # The customer always receives messages in their language
    if msg_type == "reply":
        last_customer_msg = Message.objects.filter(
            conversation=conversation, is_from_customer=True, detected_language__isnull=False
        ).exclude(detected_language="").order_by("-created_at").first()

        if last_customer_msg and last_customer_msg.detected_language and last_customer_msg.detected_language != "en":
            try:
                from ai_service.translation import translate_text
                agent_lang = getattr(request.user, "language", "en") or "en"

                if agent_lang != last_customer_msg.detected_language:
                    translated = translate_text(body, agent_lang, last_customer_msg.detected_language)
                    if translated != body:
                        message.original_body = body
                        message.body = translated
                        message.detected_language = last_customer_msg.detected_language
                        message.save(update_fields=["body", "original_body", "detected_language"])
            except Exception:
                pass

        # Track first agent response time for SLA
        if not conversation.first_response_at:
            conversation.first_response_at = timezone.now()

    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=["last_message_at", "first_response_at"])

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
                conversation.assigned_at = timezone.now()

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

                conversation.save(update_fields=["team", "assignee", "assigned_at"])
            except Team.DoesNotExist:
                return Response({"detail": "Team not found"}, status=status.HTTP_404_NOT_FOUND)

    # Assign individual member (overrides auto-assign)
    if assignee_id:
        try:
            assignee = User.objects.get(pk=assignee_id, memberships__organization=org, memberships__status="active")
            conversation.assignee = assignee
            conversation.assigned_at = timezone.now()

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
        conversation.save(update_fields=["assignee", "team", "assigned_at"])

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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def member_analytics(request, user_id):
    """Get analytics for a specific team member."""
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import get_user_model
    from django.db.models import Avg, Count, Q
    from datetime import timedelta

    User = get_user_model()

    try:
        member = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    period = request.query_params.get("period", "7d")
    now = timezone.now()
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "30d":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=7)

    # Conversations handled by this member
    conversations = Conversation.objects.filter(
        assignee=member,
        organization=org,
        created_at__gte=start,
    )

    total = conversations.count()
    resolved = conversations.filter(status="closed").count()
    open_count = conversations.filter(status="open").count()
    pending_count = conversations.filter(status="pending").count()

    # Messages sent by this member
    messages_sent = Message.objects.filter(
        sender=member,
        conversation__organization=org,
        created_at__gte=start,
        is_from_customer=False,
    ).count()

    # AI replies in conversations assigned to this member
    ai_replies = Message.objects.filter(
        conversation__assignee=member,
        conversation__organization=org,
        created_at__gte=start,
        is_from_customer=False,
        sender__isnull=True,
    ).count()

    # Human replies
    human_replies = messages_sent

    # Avg first response time for conversations assigned to this member
    conversations_with_first_response = conversations.filter(
        first_response_at__isnull=False,
        assigned_at__isnull=False,
    )
    avg_first_response = None
    if conversations_with_first_response.exists():
        from django.db.models import F
        avg_seconds = conversations_with_first_response.annotate(
            response_time_seconds=(F("first_response_at") - F("assigned_at"))
        ).aggregate(
            avg=Avg("response_time_seconds")
        )["avg"]
        if avg_seconds:
            avg_first_response = round(avg_seconds.total_seconds() / 60, 1)  # minutes

    # Avg resolution time
    conversations_resolved = conversations.filter(
        resolved_at__isnull=False,
        created_at__isnull=False,
    )
    avg_resolution = None
    if conversations_resolved.exists():
        from django.db.models import F
        avg_seconds = conversations_resolved.annotate(
            resolution_time_seconds=(F("resolved_at") - F("created_at"))
        ).aggregate(
            avg=Avg("resolution_time_seconds")
        )["avg"]
        if avg_seconds:
            avg_resolution = round(avg_seconds.total_seconds() / 60, 1)  # minutes

    # SLA compliance
    sla_total = conversations.filter(sla_deadline__isnull=False).count()
    sla_breached = conversations.filter(sla_breached=True).count()
    sla_compliance = None
    if sla_total > 0:
        sla_compliance = round(((sla_total - sla_breached) / sla_total) * 100, 1)

    # Escalation rate
    escalation_count = Message.objects.filter(
        conversation__assignee=member,
        conversation__organization=org,
        created_at__gte=start,
        is_from_customer=False,
        sender__isnull=True,
    ).values("conversation").distinct().count()

    escalation_rate = None
    if total > 0:
        escalation_rate = round((escalation_count / total) * 100, 1)

    return Response({
        "member": {
            "id": str(member.id),
            "name": member.first_name or member.email,
            "email": member.email,
        },
        "period": period,
        "conversations": {
            "total": total,
            "resolved": resolved,
            "open": open_count,
            "pending": pending_count,
        },
        "messages": {
            "sent": messages_sent,
            "ai_replies": ai_replies,
            "human_replies": human_replies,
        },
        "response_times": {
            "avg_first_response_minutes": avg_first_response,
            "avg_resolution_minutes": avg_resolution,
        },
        "sla": {
            "total": sla_total,
            "breached": sla_breached,
            "compliance_rate": sla_compliance,
        },
        "escalation_rate": escalation_rate,
    })

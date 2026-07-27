from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q, F
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Conversation, Message


def get_date_range(period, org_created):
    now = timezone.now()
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "7d":
        start = now - timedelta(days=7)
    elif period == "30d":
        start = now - timedelta(days=30)
    else:
        start = org_created
    return start, now


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def summary(request):
    org = request.user.organization
    period = request.query_params.get("period", "7d")
    start, end = get_date_range(period, org.created_at)

    convos = Conversation.objects.filter(organization=org, created_at__gte=start)
    total = convos.count()
    resolved = convos.filter(status="closed").count()
    open_count = convos.filter(status="open").count()
    pending = convos.filter(status="pending").count()

    # Active agents
    from django.contrib.auth import get_user_model
    User = get_user_model()
    active_agents = User.objects.filter(
        organization=org, status="active", role__in=["admin", "agent"]
    ).count()

    # Avg response time: time between customer msg and next agent msg
    convos_with_msgs = convos.filter(messages__isnull=False).distinct()
    total_response = 0
    response_count = 0
    for c in convos_with_msgs:
        msgs = list(c.messages.filter(type="reply").order_by("created_at"))
        for i in range(len(msgs) - 1):
            if msgs[i].is_from_customer and not msgs[i + 1].is_from_customer:
                delta = (msgs[i + 1].created_at - msgs[i].created_at).total_seconds()
                if delta > 0:
                    total_response += delta
                    response_count += 1

    avg_response_secs = total_response / response_count if response_count else 0
    avg_response_min = round(avg_response_secs / 60, 1)

    # Avg conversation duration (first to last message)
    total_duration = 0
    duration_count = 0
    for c in convos_with_msgs:
        msgs = list(c.messages.filter(type="reply").order_by("created_at"))
        if len(msgs) >= 2:
            delta = (msgs[-1].created_at - msgs[0].created_at).total_seconds()
            if delta > 0:
                total_duration += delta
                duration_count += 1
    avg_duration_secs = total_duration / duration_count if duration_count else 0
    avg_duration_min = round(avg_duration_secs / 60, 1)

    # Weekly/daily trend (last 7 days)
    trend_days = []
    for i in range(6, -1, -1):
        day = (timezone.now() - timedelta(days=i)).date()
        day_start = timezone.make_aware(
            timezone.datetime.combine(day, timezone.datetime.min.time())
        )
        day_end = day_start + timedelta(days=1)
        day_convos = Conversation.objects.filter(
            organization=org, created_at__gte=day_start, created_at__lt=day_end
        )
        day_msgs = Message.objects.filter(
            conversation__organization=org,
            created_at__gte=day_start,
            created_at__lt=day_end,
            type="reply",
        )
        day_agent_msgs = day_msgs.filter(is_from_customer=False)
        day_customer_msgs = day_msgs.filter(is_from_customer=True)
        trend_days.append({
            "day": day.strftime("%a"),
            "conversations": day_convos.count(),
            "resolved": day_convos.filter(status="closed").count(),
            "avgTime": round(compute_avg_response_for_range(day_start, day_end, org), 1),
        })

    # Per-agent stats
    agents_list = User.objects.filter(
        organization=org, status="active", role__in=["admin", "agent"]
    )
    agent_stats = []
    for agent in agents_list:
        agent_convos = convos.filter(assignee=agent)
        handled = agent_convos.count()
        agent_resolved = agent_convos.filter(status="closed").count()
        agent_msgs = Message.objects.filter(
            conversation__organization=org,
            sender=agent,
            created_at__gte=start,
            type="reply",
        )
        # Average response time for this agent
        resp_total = 0
        resp_count = 0
        for c in agent_convos.filter(messages__isnull=False).distinct():
            msgs = list(c.messages.filter(type="reply").order_by("created_at"))
            for i in range(len(msgs) - 1):
                if msgs[i].is_from_customer and msgs[i + 1].sender_id == str(agent.id):
                    delta = (msgs[i + 1].created_at - msgs[i].created_at).total_seconds()
                    if delta > 0:
                        resp_total += delta
                        resp_count += 1
        agent_avg = round(resp_total / resp_count / 60, 1) if resp_count else 0
        agent_stats.append({
            "name": agent.get_full_name() or agent.email,
            "conversations": handled,
            "resolved": agent_resolved,
            "avgTime": agent_avg,
            "satisfaction": None,
        })

    agent_stats.sort(key=lambda x: x["conversations"], reverse=True)

    return Response({
        "kpis": {
            "totalConversations": total,
            "resolved": resolved,
            "open": open_count,
            "pending": pending,
            "avgResponseTime": avg_response_min,
            "avgConversationDuration": avg_duration_min,
            "activeAgents": active_agents,
            "satisfactionScore": None,
        },
        "trend": trend_days,
        "agents": agent_stats,
    })


def compute_avg_response_for_range(start, end, org):
    convos = Conversation.objects.filter(
        organization=org, created_at__lt=end
    )
    total = 0
    count = 0
    for c in convos:
        msgs = list(c.messages.filter(
            type="reply", created_at__gte=start, created_at__lt=end
        ).order_by("created_at"))
        for i in range(len(msgs) - 1):
            if msgs[i].is_from_customer and not msgs[i + 1].is_from_customer:
                delta = (msgs[i + 1].created_at - msgs[i].created_at).total_seconds()
                if delta > 0:
                    total += delta
                    count += 1
    return total / count / 60 if count else 0

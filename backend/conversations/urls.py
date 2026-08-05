from django.urls import path
from . import views
from . import insights
from . import widget_api

urlpatterns = [
    path("conversations", views.list_conversations, name="list-conversations"),
    path("conversations/<uuid:pk>", views.conversation_detail, name="conversation-detail"),
    path("conversations/<uuid:pk>/messages", views.create_message, name="create-message"),
    path("conversations/<uuid:pk>/assign", views.assign_conversation, name="assign-conversation"),
    path("agents", views.list_agents, name="list-agents"),
    path("teams-list", views.list_teams, name="teams-list"),
    path("members/<uuid:user_id>/analytics", views.member_analytics, name="member-analytics"),
    path("insights/summary", insights.summary, name="insights-summary"),
    path("widget/embed.js", widget_api.embed_script, name="widget-embed-script"),
    path("widget/config", widget_api.widget_config, name="widget-config"),
    path("widget/conversations", widget_api.widget_conversations, name="widget-conversations"),
    path("widget/conversations/<uuid:pk>/messages", widget_api.conversation_messages, name="widget-messages"),
]

from django.urls import path
from . import views

urlpatterns = [
    # AI Config
    path("ai/config/", views.ai_config_detail, name="ai-config"),

    # Knowledge Sources
    path("ai/sources/", views.knowledge_source_list, name="ai-source-list"),
    path("ai/sources/<uuid:pk>/", views.knowledge_source_detail, name="ai-source-detail"),
    path("ai/sources/<uuid:pk>/sync/", views.sync_source, name="ai-source-sync"),
    path("ai/sources/sync-all/", views.sync_all_sources, name="ai-sync-all"),
    path("ai/sources/sync-kb/", views.sync_kb_to_sources, name="ai-sync-kb"),

    # Widget Auto-Reply (AllowAny)
    path("ai/auto-reply/", views.widget_auto_reply, name="ai-auto-reply"),

    # Agent Copilot
    path("ai/suggest-reply/", views.suggest_reply_view, name="ai-suggest-reply"),
    path("ai/summarize/", views.summarize_view, name="ai-summarize"),
    path("ai/next-steps/", views.next_steps_view, name="ai-next-steps"),

    # Logs
    path("ai/logs/", views.ai_reply_logs, name="ai-reply-logs"),
]

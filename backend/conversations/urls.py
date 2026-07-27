from django.urls import path
from . import views
from . import insights

urlpatterns = [
    path("conversations", views.list_conversations, name="list-conversations"),
    path("conversations/<uuid:pk>", views.get_conversation, name="get-conversation"),
    path("conversations/<uuid:pk>/messages", views.create_message, name="create-message"),
    path("conversations/<uuid:pk>", views.update_conversation, name="update-conversation"),
    path("conversations/<uuid:pk>/assign", views.assign_conversation, name="assign-conversation"),
    path("agents", views.list_agents, name="list-agents"),
    path("insights/summary", insights.summary, name="insights-summary"),
]

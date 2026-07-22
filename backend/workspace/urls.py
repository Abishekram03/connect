from django.urls import path
from . import views

urlpatterns = [
    path("workspace", views.workspace, name="workspace"),
    path("workspace/branding", views.branding, name="workspace-branding"),
    path("workspace/widget-config", views.widget_config, name="workspace-widget-config"),
    path("workspace/notifications", views.notifications, name="workspace-notifications"),
]

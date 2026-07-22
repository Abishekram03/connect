from rest_framework import serializers
from .models import Branding, WidgetConfig, NotificationPreference
from accounts.models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "timezone", "plan", "created_at", "updated_at"]


class BrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branding
        fields = ["primary_color", "company_name", "logo_url"]


class WidgetConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WidgetConfig
        fields = [
            "position", "border_radius", "auto_greet", "auto_greet_delay",
            "collect_email", "show_branding", "help_center_enabled",
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "email_notifications", "new_conversation_alert",
            "message_from_visitor", "weekly_digest", "mention_alert",
        ]

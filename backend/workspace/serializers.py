from rest_framework import serializers
from .models import Branding, WidgetConfig, NotificationPreference
from accounts.models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "timezone", "plan", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "plan"]


class BrandingSerializer(serializers.ModelSerializer):
    logo_url_resolved = serializers.SerializerMethodField()

    class Meta:
        model = Branding
        fields = ["primary_color", "company_name", "logo", "logo_url", "logo_url_resolved"]

    def get_logo_url_resolved(self, obj):
        return obj.effective_logo_url


class WidgetConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WidgetConfig
        fields = [
            "position", "border_radius", "auto_greet", "auto_greet_delay",
            "collect_email", "show_branding", "help_center_enabled",
            "show_faqs_on_home", "faqs_display_count",
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "email_notifications", "new_conversation_alert",
            "message_from_visitor", "weekly_digest", "mention_alert",
        ]

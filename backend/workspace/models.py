from django.db import models
from accounts.models import Organization


class Branding(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="branding")
    primary_color = models.CharField(max_length=7, default="#2563eb")
    company_name = models.CharField(max_length=255, default="Connect")
    logo_url = models.URLField(blank=True, default="")

    def __str__(self):
        return f"Branding for {self.organization.name}"


class WidgetConfig(models.Model):
    POSITION_CHOICES = [
        ("bottom-right", "Bottom Right"),
        ("bottom-left", "Bottom Left"),
    ]

    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="widget_config")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default="bottom-right")
    border_radius = models.IntegerField(default=16)
    auto_greet = models.BooleanField(default=True)
    auto_greet_delay = models.IntegerField(default=3)
    collect_email = models.BooleanField(default=True)
    show_branding = models.BooleanField(default=True)
    help_center_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"Widget config for {self.organization.name}"


class NotificationPreference(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="notification_prefs")
    email_notifications = models.BooleanField(default=True)
    new_conversation_alert = models.BooleanField(default=True)
    message_from_visitor = models.BooleanField(default=True)
    weekly_digest = models.BooleanField(default=False)
    mention_alert = models.BooleanField(default=True)

    def __str__(self):
        return f"Notification prefs for {self.organization.name}"

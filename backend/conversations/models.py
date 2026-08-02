import uuid
from django.db import models
from django.conf import settings


class Conversation(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("pending", "Pending"),
        ("closed", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    CHANNEL_CHOICES = [
        ("widget", "Widget"),
        ("email", "Email"),
        ("api", "API"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="conversations"
    )
    ticket_id = models.PositiveIntegerField(editable=False, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="normal")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="widget")
    subject = models.CharField(max_length=255, blank=True, default="")
    customer_name = models.CharField(max_length=255, blank=True, default="")
    customer_email = models.EmailField(blank=True, default="")
    customer_avatar = models.URLField(blank=True, default="")
    session_token = models.CharField(max_length=64, blank=True, default="", db_index=True)
    browser = models.JSONField(blank=True, default=dict)
    location = models.CharField(max_length=255, blank=True, default="")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_conversations"
    )
    team = models.ForeignKey(
        "teams.Team", on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations"
    )
    last_message_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "conversations"
        ordering = ["-last_message_at"]

    def save(self, *args, **kwargs):
        if self.ticket_id is None:
            max_ticket = Conversation.objects.filter(
                organization=self.organization
            ).aggregate(models.Max("ticket_id"))["ticket_id__max"]
            self.ticket_id = (max_ticket or 0) + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer_name or 'Unknown'} - {self.subject or 'No subject'}"


class Message(models.Model):
    TYPE_CHOICES = [
        ("reply", "Reply"),
        ("note", "Note"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="reply")
    body = models.TextField()
    original_body = models.TextField(blank=True, default="", help_text="Original text before translation")
    detected_language = models.CharField(max_length=10, blank=True, default="", help_text="Detected language code")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_from_customer = models.BooleanField(default=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.type}] {self.body[:60]}"

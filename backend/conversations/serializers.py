from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "type", "body", "original_body", "detected_language", "sender", "sender_name", "is_from_customer", "read_at", "created_at"]
        read_only_fields = ["id", "sender_name", "read_at", "created_at"]

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.first_name or obj.sender.email
        return "Customer"


class MessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField()
    type = serializers.ChoiceField(choices=["reply", "note"], default="reply")


class TeamMinimalSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True, default="")


class ConversationListSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    team = TeamMinimalSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "ticket_id", "status", "priority", "channel", "subject",
            "customer_name", "customer_email", "customer_avatar",
            "assignee", "team", "last_message", "message_count",
            "last_message_at", "created_at", "updated_at",
        ]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return {"id": str(msg.id), "body": msg.body[:100], "created_at": msg.created_at.isoformat(), "is_from_customer": msg.is_from_customer}
        return None

    def get_message_count(self, obj):
        return obj.messages.count()


class ConversationDetailSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    team = TeamMinimalSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = "__all__"


class ConversationUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["open", "pending", "closed"], required=False)
    priority = serializers.ChoiceField(choices=["low", "normal", "high", "urgent"], required=False)

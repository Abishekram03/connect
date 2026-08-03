from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="notification_type")
    conversation_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "body", "conversation_id", "read", "created_at"]

    def get_conversation_id(self, obj):
        if obj.conversation:
            return str(obj.conversation.id)
        return None

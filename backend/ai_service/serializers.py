from rest_framework import serializers
from .models import AIConfig, KnowledgeSource, DocumentChunk, AIReplyLog, SLAConfig


class AIConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConfig
        fields = [
            "id", "auto_reply_enabled", "reply_generation_enabled", "model_name", "embedding_model",
            "temperature", "max_tokens", "system_prompt",
            "escalate_on_angry", "escalate_on_low_confidence", "confidence_threshold",
            "max_ai_turns", "provider_base_url", "provider_api_key",
            "auto_assign_on_escalation", "auto_assign_routing", "auto_assign_team_id",
            "escalation_increase_priority",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask API key on read — only send it back if the client just wrote it
        if instance.provider_api_key:
            key = instance.provider_api_key
            data["provider_api_key"] = key[:4] + "****" + key[-4:] if len(key) > 8 else "****"
        return data


class AIConfigPublicSerializer(serializers.ModelSerializer):
    """Serializer for widget — hides API key and provider URL."""
    class Meta:
        model = AIConfig
        fields = [
            "id", "auto_reply_enabled", "model_name",
            "escalate_on_angry", "escalate_on_low_confidence", "confidence_threshold",
            "max_ai_turns",
        ]


class KnowledgeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeSource
        fields = [
            "id", "source_type", "external_id", "title", "content", "url",
            "is_indexed", "chunk_count", "last_synced_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_indexed", "chunk_count", "last_synced_at", "created_at", "updated_at"]


class KnowledgeSourceListSerializer(serializers.ModelSerializer):
    """List serializer without content field."""
    class Meta:
        model = KnowledgeSource
        fields = [
            "id", "source_type", "external_id", "title", "url",
            "is_indexed", "chunk_count", "last_synced_at",
            "created_at",
        ]


class DocumentChunkSerializer(serializers.ModelSerializer):
    source_title = serializers.CharField(source="source.title", read_only=True)

    class Meta:
        model = DocumentChunk
        fields = ["id", "source", "source_title", "chunk_index", "content", "token_count", "created_at"]
        read_only_fields = ["id", "created_at"]


class AIReplyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIReplyLog
        fields = [
            "id", "conversation", "model_used", "prompt_tokens",
            "completion_tokens", "confidence", "escalated",
            "escalation_reason", "sources_used", "response_text",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# --- Request/Response serializers ---

class AutoReplyRequestSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField()
    message = serializers.CharField(max_length=5000)


class AutoReplyResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()
    confidence = serializers.FloatField()
    escalate = serializers.BooleanField()
    escalation_reason = serializers.CharField()
    sources = serializers.ListField(child=serializers.CharField())
    ai_log_id = serializers.UUIDField()


class SuggestReplyResponseSerializer(serializers.Serializer):
    suggestions = serializers.ListField(child=serializers.CharField())


class SummarizeResponseSerializer(serializers.Serializer):
    summary = serializers.CharField()


class NextStepsResponseSerializer(serializers.Serializer):
    steps = serializers.ListField(child=serializers.CharField())


class SLAConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLAConfig
        fields = [
            "id", "enabled",
            "urgent_hours", "high_hours", "normal_hours", "low_hours",
            "warn_before_minutes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

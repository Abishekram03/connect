from django.contrib import admin
from .models import AIConfig, KnowledgeSource, DocumentChunk, AIReplyLog


@admin.register(AIConfig)
class AIConfigAdmin(admin.ModelAdmin):
    list_display = ("organization", "auto_reply_enabled", "model_name", "temperature")
    list_filter = ("auto_reply_enabled",)


@admin.register(KnowledgeSource)
class KnowledgeSourceAdmin(admin.ModelAdmin):
    list_display = ("title", "source_type", "organization", "is_indexed", "created_at")
    list_filter = ("source_type", "is_indexed")


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ("source", "chunk_index", "created_at")


@admin.register(AIReplyLog)
class AIReplyLogAdmin(admin.ModelAdmin):
    list_display = ("conversation", "model_used", "confidence", "escalated", "created_at")
    list_filter = ("escalated",)

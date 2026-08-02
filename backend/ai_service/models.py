import uuid
from django.db import models
from pgvector.django import VectorField


class AIConfig(models.Model):
    """Per-organization AI settings."""
    MODEL_CHOICES = [
        ("openai/gpt-4o-mini", "GPT-4o Mini"),
        ("openai/gpt-4o", "GPT-4o"),
        ("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet"),
        ("google/gemini-2.0-flash-001", "Gemini 2.0 Flash"),
        ("groq/llama-3.1-8b-instant", "Llama 3.1 8B (Groq Free)"),
        ("groq/llama-3.3-70b-versatile", "Llama 3.3 70B (Groq)"),
        ("groq/mixtral-8x7b-32768", "Mixtral 8x7B (Groq)"),
    ]

    EMBEDDING_MODEL_CHOICES = [
        ("openai/text-embedding-3-small", "Text Embedding 3 Small"),
        ("openai/text-embedding-3-large", "Text Embedding 3 Large"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.OneToOneField(
        "accounts.Organization", on_delete=models.CASCADE, related_name="ai_config"
    )

    # Core settings
    auto_reply_enabled = models.BooleanField(default=True)
    reply_generation_enabled = models.BooleanField(default=True)
    model_name = models.CharField(max_length=100, choices=MODEL_CHOICES, default="groq/llama-3.1-8b-instant")
    embedding_model = models.CharField(max_length=100, choices=EMBEDDING_MODEL_CHOICES, default="openai/text-embedding-3-small")
    temperature = models.FloatField(default=0.3)
    max_tokens = models.IntegerField(default=512)
    system_prompt = models.TextField(
        default="You are a helpful customer support assistant. Answer questions accurately and concisely based on the provided context. If you're unsure or the question is about something not in the context, say you'll connect them with a human agent.",
        blank=True,
    )

    # Escalation settings
    escalate_on_angry = models.BooleanField(default=True)
    escalate_on_low_confidence = models.BooleanField(default=True)
    confidence_threshold = models.FloatField(default=0.5, help_text="Minimum confidence to auto-reply (0-1)")
    max_ai_turns = models.IntegerField(default=5, help_text="Max consecutive AI replies before escalating")

    # Provider settings
    provider_base_url = models.URLField(
        default="https://openrouter.ai/api/v1",
        blank=True,
        help_text="OpenRouter API base URL (or OmniRoute URL)",
    )
    provider_api_key = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI Configuration"
        verbose_name_plural = "AI Configurations"

    def __str__(self):
        return f"AI Config for {self.organization.name}"


class KnowledgeSource(models.Model):
    """A source of knowledge for RAG (articles, FAQs, websites, docs)."""
    SOURCE_TYPE_CHOICES = [
        ("kb_article", "Knowledge Base Article"),
        ("kb_faq", "Knowledge Base FAQ"),
        ("website", "Website Scrape"),
        ("document", "Uploaded Document"),
        ("manual", "Manual Entry"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="ai_sources"
    )
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    external_id = models.CharField(max_length=255, blank=True, default="", help_text="ID of linked KB article/FAQ")
    title = models.CharField(max_length=500)
    content = models.TextField(blank=True, default="")
    url = models.URLField(blank=True, default="")
    is_indexed = models.BooleanField(default=False)
    chunk_count = models.IntegerField(default=0)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.source_type}] {self.title}"


class DocumentChunk(models.Model):
    """An embedded text chunk for vector search."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(
        KnowledgeSource, on_delete=models.CASCADE, related_name="chunks"
    )
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="ai_chunks"
    )
    chunk_index = models.IntegerField(default=0)
    content = models.TextField()
    embedding = VectorField(dimensions=1536, null=True, blank=True)
    token_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["source", "chunk_index"]

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.source.title}"


class AIReplyLog(models.Model):
    """Logs AI replies for auditing and improvement."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "conversations.Conversation", on_delete=models.CASCADE, related_name="ai_logs"
    )
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="ai_logs"
    )
    model_used = models.CharField(max_length=100)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    confidence = models.FloatField(default=0.0)
    escalated = models.BooleanField(default=False)
    escalation_reason = models.CharField(max_length=255, blank=True, default="")
    sources_used = models.JSONField(default=list, blank=True, help_text="List of source IDs used for context")
    response_text = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AI reply to {self.conversation} (conf={self.confidence})"

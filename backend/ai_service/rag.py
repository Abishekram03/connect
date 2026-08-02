import re
import logging
from typing import Optional
from django.db.models import Q
from pgvector.django import L2Distance, CosineDistance

from .models import AIConfig, KnowledgeSource, DocumentChunk, AIReplyLog
from .provider import OpenRouterProvider, GroqProvider, TemplateProvider

logger = logging.getLogger(__name__)

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# Embedding model for Groq (doesn't have its own embeddings, use a small local hash fallback)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def get_provider(org) -> OpenRouterProvider:
    """Get an AI provider for the given organization. Fallback chain: user config -> Groq free -> template."""
    config = AIConfig.objects.filter(organization=org).first()

    # 1. Try user-configured provider
    if config and config.provider_api_key and config.provider_base_url:
        return OpenRouterProvider(
            base_url=config.provider_base_url,
            api_key=config.provider_api_key,
            model=config.model_name,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
        )

    # 2. Try Groq free tier (set GROQ_API_KEY in env)
    from django.conf import settings
    groq_key = getattr(settings, "GROQ_API_KEY", "")
    if groq_key:
        model = config.model_name if config and config.model_name else "llama-3.1-8b-instant"
        # Strip provider prefix (e.g. "groq/llama-3.1-8b-instant" -> "llama-3.1-8b-instant")
        if "/" in model:
            model = model.split("/", 1)[1]
        return GroqProvider(
            api_key=groq_key,
            model=model,
            temperature=config.temperature if config else 0.3,
            max_tokens=config.max_tokens if config else 512,
        )

    # 3. Fallback to template-based (no API key needed)
    logger.info("No AI API key configured for org %s, using template fallback", org.id)
    return TemplateProvider()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    text = text.strip()
    if not text:
        return []

    # Split by paragraphs first
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk = f"{current_chunk}\n\n{para}" if current_chunk else para
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If single paragraph exceeds chunk_size, split by sentences
            if len(para) > chunk_size:
                sentences = re.split(r'(?<=[.!?])\s+', para)
                current_chunk = ""
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 <= chunk_size:
                        current_chunk = f"{current_chunk} {sentence}" if current_chunk else sentence
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sentence
            else:
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    # Add overlap
    if overlap > 0 and len(chunks) > 1:
        overlapped = [chunks[0]]
        for i in range(1, len(chunks)):
            prev_words = chunks[i - 1].split()[-overlap:]
            overlapped.append(" ".join(prev_words) + " " + chunks[i])
        return overlapped

    return chunks


def sync_source_to_chunks(source: KnowledgeSource, provider: OpenRouterProvider) -> int:
    """Sync a knowledge source into document chunks with embeddings."""
    text = source.content
    if not text:
        return 0

    # Delete existing chunks
    DocumentChunk.objects.filter(source=source).delete()

    # Chunk the text
    text_chunks = chunk_text(text)
    if not text_chunks:
        return 0

    # Get embeddings in batches
    batch_size = 20
    all_embeddings = []
    for i in range(0, len(text_chunks), batch_size):
        batch = text_chunks[i:i + batch_size]
        embeddings = provider.embed(batch)
        all_embeddings.extend(embeddings)

    # Create DocumentChunk objects
    chunks = []
    for i, (content, embedding) in enumerate(zip(text_chunks, all_embeddings)):
        chunks.append(DocumentChunk(
            source=source,
            organization=source.organization,
            chunk_index=i,
            content=content,
            embedding=embedding,
            token_count=len(content.split()),
        ))

    DocumentChunk.objects.bulk_create(chunks)

    source.is_indexed = True
    source.chunk_count = len(chunks)
    from django.utils import timezone
    source.last_synced_at = timezone.now()
    source.save(update_fields=["is_indexed", "chunk_count", "last_synced_at"])

    return len(chunks)


def retrieve(
    org,
    query: str,
    provider: OpenRouterProvider,
    top_k: int = 5,
    min_score: float = 0.0,
) -> list[dict]:
    """
    Retrieve relevant chunks for a query using vector similarity search.
    Returns list of {"content": str, "source_title": str, "score": float, "source_id": str}
    """
    # Embed the query
    query_embedding = provider.embed([query])[0]

    # Search using cosine distance
    chunks = (
        DocumentChunk.objects.filter(organization=org, embedding__isnull=False)
        .annotate(distance=CosineDistance("embedding", query_embedding))
        .order_by("distance")[:top_k]
    )

    results = []
    for chunk in chunks:
        # Cosine distance: 0 = identical, 2 = opposite. Convert to similarity score.
        score = 1.0 - (chunk.distance / 2.0)
        if score >= min_score:
            results.append({
                "content": chunk.content,
                "source_title": chunk.source.title,
                "source_type": chunk.source.source_type,
                "source_id": str(chunk.source_id),
                "score": round(score, 4),
            })

    return results


def generate_reply(
    org,
    query: str,
    conversation_history: list[dict],
    provider,
    config: AIConfig,
    agent_language: str = "en",
) -> dict:
    """
    Generate an AI reply using RAG with auto-translation.
    Detects customer language, translates to English for AI understanding,
    generates reply in agent's language, then translates to customer's language.
    """
    from .translation import translate_for_ai, translate_reply_from_ai

    # Auto-detect and translate customer message to English for AI understanding
    detected_lang, translated_query, original_query = translate_for_ai(query, conversation_history)

    # Retrieve relevant context using translated query
    try:
        retrieved = retrieve(org, translated_query, provider, top_k=5, min_score=config.confidence_threshold)
    except Exception:
        retrieved = []

    # Build context string
    context_parts = []
    source_ids = []
    for r in retrieved:
        context_parts.append(f"[{r['source_title']}]\n{r['content']}")
        source_ids.append(r["source_id"])

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant knowledge base content found."

    # Calculate confidence from retrieval scores
    avg_score = sum(r["score"] for r in retrieved) / len(retrieved) if retrieved else 0.0
    confidence = avg_score

    # Build messages for AI — generate in agent's language
    system_prompt = config.system_prompt or "You are a helpful customer support assistant."
    lang_instruction = f"ALWAYS reply in {agent_language} only." if agent_language != "en" else "ALWAYS reply in English only."
    messages = [
        {
            "role": "system",
            "content": f"{system_prompt}\n\nUse the following context to answer the customer's question. If the context doesn't contain enough information, say you'll connect them with a human agent. Never make up information. {lang_instruction}\n\n<context>\n{context}\n</context>",
        }
    ]

    # Add conversation history (last 10 messages)
    for msg in conversation_history[-10:]:
        role = "assistant" if not msg.get("is_from_customer", True) else "user"
        messages.append({"role": role, "content": msg["body"]})

    # Add current query (use English translated version for better AI understanding)
    messages.append({"role": "user", "content": translated_query})

    # Generate reply in agent's language
    result = provider.chat(messages)

    # Store agent-language version (original for inbox)
    original_reply = result["content"]

    # Translate to customer's language if different
    ai_reply = original_reply
    if detected_lang != agent_language:
        ai_reply = translate_reply_from_ai(original_reply, detected_lang, source_lang=agent_language)

    # Check for escalation triggers (use original query for language-specific detection)
    escalate = False
    escalation_reason = ""

    # Low confidence
    if config.escalate_on_low_confidence and confidence < config.confidence_threshold:
        escalate = True
        escalation_reason = "low_confidence"

    # Angry detection
    angry_keywords = ["angry", "furious", "terrible", "horrible", "worst", "unacceptable",
                      "frustrated", "frustrating", "waste", "scam", "refund", "cancel",
                      "speak to manager", "human agent", "real person"]
    if config.escalate_on_angry and any(kw in original_query.lower() for kw in angry_keywords):
        escalate = True
        escalation_reason = "angry_customer"

    # Explicit request for human
    human_keywords = ["human agent", "real person", "talk to someone", "speak to someone",
                      "connect me to", "transfer me", "live agent"]
    if any(kw in original_query.lower() for kw in human_keywords):
        escalate = True
        escalation_reason = "explicit_human_request"

    return {
        "content": ai_reply,
        "original_content": original_reply,
        "confidence": confidence,
        "sources": source_ids,
        "escalate": escalate,
        "escalation_reason": escalation_reason,
        "prompt_tokens": result.get("prompt_tokens", 0),
        "completion_tokens": result.get("completion_tokens", 0),
        "detected_language": detected_lang,
    }


def suggest_reply(org, conversation_messages: list[dict], provider: OpenRouterProvider, config: AIConfig) -> list[str]:
    """Generate 3 suggested replies for an agent. Returns list of 3 strings."""
    # Build context from conversation
    conversation_text = "\n".join(
        f"{'Customer' if msg.get('is_from_customer') else 'Agent'}: {msg['body']}"
        for msg in conversation_messages[-20:]
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI assistant helping a customer support agent. "
                "Based on the conversation below, suggest 3 different reply options the agent could send. "
                "Return them as a JSON array of 3 strings. Each reply should have a different tone: "
                "1) Professional and concise, 2) Friendly and detailed, 3) Empathetic and solution-focused. "
                "Only return the JSON array, no other text."
            ),
        },
        {
            "role": "user",
            "content": f"Conversation:\n{conversation_text}",
        },
    ]

    result = provider.chat(messages, temperature=0.7)

    # Parse the JSON response
    import json
    try:
        # Try to extract JSON from the response
        content = result["content"]
        # Find JSON array in the response
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            suggestions = json.loads(match.group())
            if isinstance(suggestions, list) and len(suggestions) >= 3:
                return [str(s) for s in suggestions[:3]]
    except (json.JSONDecodeError, AttributeError):
        pass

    # Fallback: return the content split by newlines
    lines = [l.strip() for l in result["content"].split("\n") if l.strip()]
    if len(lines) >= 3:
        return lines[:3]
    return [
        "Thank you for reaching out. I'd be happy to help you with this.",
        "I understand your concern. Let me look into this for you right away.",
        "I'm sorry for the inconvenience. Let me get this resolved for you.",
    ]


def summarize_conversation(org, conversation_messages: list[dict], provider: OpenRouterProvider) -> str:
    """Summarize a conversation for an agent."""
    conversation_text = "\n".join(
        f"{'Customer' if msg.get('is_from_customer') else 'Agent'}: {msg['body']}"
        for msg in conversation_messages
    )

    messages = [
        {
            "role": "system",
            "content": (
                "Summarize this customer support conversation in 2-3 sentences. "
                "Include: main issue, current status, and any pending actions."
            ),
        },
        {
            "role": "user",
            "content": f"Conversation:\n{conversation_text}",
        },
    ]

    result = provider.chat(messages, temperature=0.3, max_tokens=256)
    return result["content"]


def suggest_next_steps(org, conversation_messages: list[dict], provider: OpenRouterProvider) -> list[str]:
    """Suggest next steps for an agent. Returns list of actionable items."""
    conversation_text = "\n".join(
        f"{'Customer' if msg.get('is_from_customer') else 'Agent'}: {msg['body']}"
        for msg in conversation_messages[-20:]
    )

    messages = [
        {
            "role": "system",
            "content": (
                "Based on this customer support conversation, suggest 2-4 specific next steps "
                "the agent should take. Return them as a JSON array of strings. "
                "Each step should be actionable and specific. Only return the JSON array."
            ),
        },
        {
            "role": "user",
            "content": f"Conversation:\n{conversation_text}",
        },
    ]

    result = provider.chat(messages, temperature=0.5, max_tokens=256)

    import json
    try:
        content = result["content"]
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            steps = json.loads(match.group())
            if isinstance(steps, list):
                return [str(s) for s in steps[:4]]
    except (json.JSONDecodeError, AttributeError):
        pass

    lines = [l.strip().lstrip("0123456789. ") for l in result["content"].split("\n") if l.strip()]
    return lines[:4] if lines else ["Follow up with the customer within 24 hours"]

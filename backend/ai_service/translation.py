import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

LIBRETRANSLATE_URL = getattr(settings, "LIBRETRANSLATE_URL", "http://127.0.0.1:5000")


def detect_language(text: str) -> str:
    """Detect the language of a text string. Returns language code."""
    try:
        resp = requests.post(
            f"{LIBRETRANSLATE_URL}/detect",
            json={"q": text[:500]},
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        if data and isinstance(data, list) and len(data) > 0:
            return data[0].get("language", "en")
    except Exception:
        logger.warning("Language detection failed, defaulting to en")
    return "en"


def translate_text(text: str, source: str, target: str) -> str:
    """Translate text from source language to target language."""
    if source == target or not text.strip():
        return text

    try:
        resp = requests.post(
            f"{LIBRETRANSLATE_URL}/translate",
            json={"q": text, "source": source, "target": target},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("translatedText", text)
    except Exception:
        logger.warning("Translation failed: %s -> %s", source, target)
        return text


def get_supported_languages() -> list[dict]:
    """Get list of supported languages from LibreTranslate."""
    try:
        resp = requests.get(f"{LIBRETRANSLATE_URL}/languages", timeout=5)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        logger.warning("Failed to fetch supported languages")
        return []


def translate_for_ai(query: str, conversation_history: list[dict]) -> tuple[str, str, str]:
    """
    Detect user language, translate query to English for AI, returns (detected_lang, translated_query, original_query).
    """
    detected = detect_language(query)

    if detected == "en":
        return "en", query, query

    translated = translate_text(query, detected, "en")
    return detected, translated, query


def translate_reply_from_ai(reply: str, target_lang: str, source_lang: str = "en") -> str:
    """Translate AI reply from source_lang back to customer's language."""
    if target_lang == source_lang or not reply.strip():
        return reply

    return translate_text(reply, source_lang, target_lang)

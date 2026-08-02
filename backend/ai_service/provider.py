import json
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# Free tier defaults
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_FREE_MODEL = "llama-3.1-8b-instant"


class OpenRouterProvider:
    """Client for OpenRouter API (also compatible with OmniRoute, Groq, Gemini)."""

    def __init__(self, base_url: str, api_key: str, model: str, temperature: float = 0.3, max_tokens: int = 512):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://onconnect.one",
            "X-Title": "Connect AI",
        }

    def chat(self, messages: list[dict], temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> dict:
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            choice = data["choices"][0]
            usage = data.get("usage", {})
            return {
                "content": choice["message"]["content"],
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
            }
        except requests.RequestException as e:
            logger.error("Chat API error: %s", e)
            raise
        except (KeyError, IndexError) as e:
            logger.error("Chat response parse error: %s", e)
            raise

    def embed(self, texts: list[str]) -> list[list[float]]:
        payload = {
            "model": self.model,
            "input": texts,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/embeddings",
                headers=self._headers(),
                json=payload,
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            sorted_data = sorted(data["data"], key=lambda x: x["index"])
            return [item["embedding"] for item in sorted_data]
        except requests.RequestException as e:
            logger.error("Embedding API error: %s", e)
            raise
        except (KeyError, IndexError) as e:
            logger.error("Embedding response parse error: %s", e)
            raise

    def is_available(self) -> bool:
        try:
            resp = requests.get(f"{self.base_url}/models", headers=self._headers(), timeout=10)
            return resp.status_code == 200
        except Exception:
            return False


class GroqProvider(OpenRouterProvider):
    """Groq free tier — 30K tokens/min, 14,400 req/day, no credit card."""

    def __init__(self, api_key: str, model: str = GROQ_FREE_MODEL, temperature: float = 0.3, max_tokens: int = 512):
        super().__init__(base_url=GROQ_BASE_URL, api_key=api_key, model=model, temperature=temperature, max_tokens=max_tokens)


class TemplateProvider:
    """No-API-key fallback — rule-based replies from knowledge base."""

    def __init__(self):
        self.model = "template-fallback"

    def chat(self, messages: list[dict], temperature: float = 0.3, max_tokens: int = 512) -> dict:
        user_msg = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_msg = msg.get("content", "")
                break

        context = ""
        for msg in messages:
            if msg.get("role") == "system" and "<context>" in msg.get("content", ""):
                import re
                match = re.search(r"<context>(.*?)</context>", msg["content"], re.DOTALL)
                if match:
                    context = match.group(1).strip()
                    break

        if context and context != "No relevant knowledge base content found.":
            relevant = context[:500]
            reply = f"Based on our knowledge base:\n\n{relevant}\n\nIf you need more help, I can connect you with a human agent."
        else:
            reply = "Thank you for reaching out! I've received your message and a team member will respond shortly. In the meantime, you can check our help center for instant answers."

        return {"content": reply, "prompt_tokens": 0, "completion_tokens": 0}

    def embed(self, texts: list[str]) -> list[list[float]]:
        import hashlib
        results = []
        for text in texts:
            h = hashlib.sha256(text.encode()).digest()
            vec = [((b - 128) / 128.0) for b in h]
            results.append(vec)
        return results

    def is_available(self) -> bool:
        return True

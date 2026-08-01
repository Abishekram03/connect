import json
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)


class OpenRouterProvider:
    """Client for OpenRouter API (also compatible with OmniRoute)."""

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
        """
        Send a chat completion request.
        Returns: {"content": str, "prompt_tokens": int, "completion_tokens": int}
        """
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
            logger.error(f"OpenRouter chat error: {e}")
            raise
        except (KeyError, IndexError) as e:
            logger.error(f"OpenRouter response parse error: {e}")
            raise

    def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Get embeddings for a list of texts.
        Returns list of embedding vectors.
        """
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
            # Sort by index to maintain order
            sorted_data = sorted(data["data"], key=lambda x: x["index"])
            return [item["embedding"] for item in sorted_data]
        except requests.RequestException as e:
            logger.error(f"OpenRouter embedding error: {e}")
            raise
        except (KeyError, IndexError) as e:
            logger.error(f"OpenRouter embedding response parse error: {e}")
            raise

    def is_available(self) -> bool:
        """Quick check if the API is reachable."""
        try:
            resp = requests.get(f"{self.base_url}/models", headers=self._headers(), timeout=10)
            return resp.status_code == 200
        except Exception:
            return False

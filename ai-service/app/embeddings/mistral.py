import logging
import re
from typing import List, Optional

from app.core.config import settings
from app.embeddings.base import EmbeddingProvider, validate_embedding_input, validate_vector
from app.embeddings.exceptions import (
    EmbeddingConfigurationError,
    EmbeddingProviderError,
    InvalidEmbeddingResponseError,
)

logger = logging.getLogger(__name__)


def _sanitize_error(msg: str, key_patterns: Optional[List[str]] = None) -> str:
    """Sanitize error messages to ensure API keys and bearer tokens are never leaked."""
    sanitized = re.sub(r"(Bearer\s+)[A-Za-z0-9_\-\.]+", r"\1[REDACTED]", msg)
    sanitized = re.sub(r"(api[_\-]?key[=:\s]+)[A-Za-z0-9_\-\.]+", r"\1[REDACTED]", sanitized, flags=re.IGNORECASE)
    return sanitized


class MistralEmbeddingProvider(EmbeddingProvider):
    """
    Concrete embedding provider integrating with Mistral AI's embedding API (`mistral-embed`).
    Generates 1024-dimensional dense vectors.
    """

    DEFAULT_MODEL: str = "mistral-embed"
    DEFAULT_DIMENSION: int = 1024

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: Optional[str] = None,
        dimension: Optional[int] = None,
    ) -> None:
        self._api_key = api_key or settings.EMBEDDING_API_KEY or settings.MISTRAL_API_KEY
        self._model_id = model_id or settings.EMBEDDING_MODEL or self.DEFAULT_MODEL
        self._dimension = dimension or settings.EMBEDDING_DIMENSION or self.DEFAULT_DIMENSION

        if not self._api_key:
            raise EmbeddingConfigurationError(
                "Mistral API key is required. Set MISTRAL_API_KEY or EMBEDDING_API_KEY in environment."
            )

        try:
            from mistralai.client import Mistral
            self._client = Mistral(api_key=self._api_key)
        except Exception as e:
            sanitized = _sanitize_error(str(e))
            logger.error("Failed to initialize Mistral client: %s", sanitized)
            raise EmbeddingProviderError(f"Failed to initialize Mistral client: {sanitized}") from e

    @property
    def provider_name(self) -> str:
        return "mistral"

    @property
    def model_id(self) -> str:
        return self._model_id

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed(self, text: str) -> List[float]:
        """
        Call Mistral embeddings API and return a validated 1024-dimensional float vector.
        """
        clean_text = validate_embedding_input(text)

        try:
            response = self._client.embeddings.create(
                model=self._model_id,
                inputs=[clean_text],
            )
        except Exception as e:
            sanitized = _sanitize_error(str(e))
            logger.error("Mistral embeddings API call failed: %s", sanitized)
            raise EmbeddingProviderError(f"Mistral embeddings API error: {sanitized}") from e

        if not response or not hasattr(response, "data") or not response.data:
            raise InvalidEmbeddingResponseError("Mistral API returned an empty or invalid response object.")

        item = response.data[0]
        raw_embedding = getattr(item, "embedding", None)

        return validate_vector(raw_embedding, expected_dimension=self._dimension)

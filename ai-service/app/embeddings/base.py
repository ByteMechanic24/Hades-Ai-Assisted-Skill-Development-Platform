from abc import ABC, abstractmethod
import math
from typing import Any, List, Optional

from app.embeddings.exceptions import (
    InvalidEmbeddingInputError,
    InvalidEmbeddingResponseError,
)


def validate_embedding_input(text: str) -> str:
    """
    Validate that input text is a non-empty string.

    Raises:
        InvalidEmbeddingInputError: If text is empty, whitespace-only, or not a string.
    """
    if text is None or not isinstance(text, str) or not text.strip():
        raise InvalidEmbeddingInputError(
            "Input text for embedding must be a non-empty, non-whitespace string."
        )
    return text.strip()


def validate_vector(embedding: Any, expected_dimension: Optional[int] = None) -> List[float]:
    """
    Validate that the generated embedding is a non-empty list of finite floating-point numbers.

    Raises:
        InvalidEmbeddingResponseError: If vector is invalid, non-numeric, contains NaN/Inf, or dimension mismatch.
    """
    if embedding is None or not isinstance(embedding, (list, tuple)):
        raise InvalidEmbeddingResponseError("Embedding vector must be a non-null list of numbers.")

    if len(embedding) == 0:
        raise InvalidEmbeddingResponseError("Embedding vector cannot be empty.")

    if expected_dimension is not None and len(embedding) != expected_dimension:
        raise InvalidEmbeddingResponseError(
            f"Embedding vector dimension mismatch: expected {expected_dimension}, got {len(embedding)}."
        )

    validated_vector: List[float] = []
    for i, val in enumerate(embedding):
        if val is None or not isinstance(val, (int, float)) or isinstance(val, bool):
            raise InvalidEmbeddingResponseError(
                f"Embedding vector element at index {i} is not a valid number: {type(val).__name__}."
            )
        float_val = float(val)
        if not math.isfinite(float_val):
            raise InvalidEmbeddingResponseError(
                f"Embedding vector element at index {i} is non-finite (NaN or Inf)."
            )
        validated_vector.append(float_val)

    return validated_vector


class EmbeddingProvider(ABC):
    """
    Abstract contract for model-agnostic embedding generation.
    Decouples persistent memory and agents from concrete provider SDKs.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the embedding provider."""
        pass

    @property
    @abstractmethod
    def model_id(self) -> str:
        """Identifier of the active embedding model."""
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Expected output vector dimensionality."""
        pass

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """
        Generate an embedding vector for the provided text.

        Parameters:
            text: Non-empty input string.

        Returns:
            List[float]: Normalized embedding vector of length matching self.dimension.

        Raises:
            InvalidEmbeddingInputError: If text is empty or invalid.
            EmbeddingProviderError: If the provider fails.
            InvalidEmbeddingResponseError: If the response vector fails validation.
        """
        pass

import hashlib
import math
from typing import List, Optional

from app.embeddings.base import EmbeddingProvider, validate_embedding_input, validate_vector


class FakeEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic, zero-network embedding provider for local testing and CI/CD.
    Produces predictable unit-normalized float vectors derived deterministically from the input text.
    """

    def __init__(
        self,
        dimension: int = 1024,
        model_id: str = "fake-deterministic-embed",
        fail_mode: Optional[str] = None,
    ) -> None:
        self._dimension = dimension
        self._model_id = model_id
        self._fail_mode = fail_mode

    @property
    def provider_name(self) -> str:
        return "fake"

    @property
    def model_id(self) -> str:
        return self._model_id

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed(self, text: str) -> List[float]:
        """
        Generate a deterministic pseudo-embedding vector for the given text.
        """
        clean_text = validate_embedding_input(text)

        if self._fail_mode == "api_error":
            from app.embeddings.exceptions import EmbeddingProviderError
            raise EmbeddingProviderError("Simulated fake provider network/API failure.")
        elif self._fail_mode == "invalid_response":
            # Return non-numeric/empty for testing response validation
            return []  # type: ignore

        # Deterministically compute vector from text hash
        raw_vals: List[float] = []
        for i in range(self._dimension):
            h = hashlib.sha256(f"{clean_text}:{i}".encode("utf-8")).digest()
            # Convert first 4 bytes to integer and scale to [-1.0, 1.0]
            val = int.from_bytes(h[:4], "big", signed=True) / (2**31 - 1)
            raw_vals.append(val)

        # L2-normalize vector to unit length
        norm = math.sqrt(sum(x * x for x in raw_vals)) or 1.0
        normalized = [round(x / norm, 6) for x in raw_vals]

        return validate_vector(normalized, expected_dimension=self._dimension)

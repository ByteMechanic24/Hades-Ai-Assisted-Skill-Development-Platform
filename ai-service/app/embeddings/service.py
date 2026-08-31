import logging
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.db.connection import DatabaseManager
from app.db.memory import save_memory
from app.embeddings.base import EmbeddingProvider, validate_embedding_input
from app.embeddings.exceptions import EmbeddingConfigurationError
from app.embeddings.fake import FakeEmbeddingProvider
from app.embeddings.mistral import MistralEmbeddingProvider
from app.schemas.models import MemoryChunk

logger = logging.getLogger(__name__)


def get_embedding_provider(
    provider_type: Optional[str] = None,
    api_key: Optional[str] = None,
    model_id: Optional[str] = None,
    dimension: Optional[int] = None,
) -> EmbeddingProvider:
    """
    Factory function to instantiate the configured embedding provider.

    Parameters:
        provider_type: Provider identifier ('mistral', 'fake'). Defaults to settings.EMBEDDING_PROVIDER.
        api_key: Optional API key override.
        model_id: Optional model identifier override.
        dimension: Optional dimension override.

    Returns:
        EmbeddingProvider: Configured provider instance.

    Raises:
        EmbeddingConfigurationError: If provider_type is unsupported.
    """
    ptype = (provider_type or settings.EMBEDDING_PROVIDER or "mistral").lower().strip()

    if ptype == "mistral":
        return MistralEmbeddingProvider(api_key=api_key, model_id=model_id, dimension=dimension)
    elif ptype == "fake":
        dim = dimension or settings.EMBEDDING_DIMENSION or 1024
        mid = model_id or "fake-deterministic-embed"
        return FakeEmbeddingProvider(dimension=dim, model_id=mid)
    else:
        raise EmbeddingConfigurationError(
            f"Unsupported embedding provider '{ptype}'. Supported options: 'mistral', 'fake'."
        )


def generate_embedding(
    text: str,
    provider: Optional[EmbeddingProvider] = None,
) -> List[float]:
    """
    Generate an embedding vector for the provided text using the active or supplied provider.

    Parameters:
        text: Non-empty input string.
        provider: Optional EmbeddingProvider instance; defaults to factory default.

    Returns:
        List[float]: Normalized embedding vector.

    Raises:
        InvalidEmbeddingInputError: If text is invalid or empty.
        EmbeddingProviderError: If the provider call fails.
        InvalidEmbeddingResponseError: If the returned vector is invalid.
    """
    active_provider = provider or get_embedding_provider()
    return active_provider.embed(text)


def save_memory_with_embedding(
    external_id: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    provider: Optional[EmbeddingProvider] = None,
    manager: Optional[DatabaseManager] = None,
) -> MemoryChunk:
    """
    Convenience service function that generates an embedding for memory content
    and persists the record via the existing save_memory repository layer.

    Parameters:
        external_id: External learner identifier (e.g. 'learner-1049').
        content: Text content of the memory.
        metadata: Optional dictionary of structured metadata.
        provider: Optional EmbeddingProvider instance.
        manager: Optional DatabaseManager instance.

    Returns:
        MemoryChunk: Fully populated persisted memory record with embedding.
    """
    # 1. Validate content and generate embedding
    embedding_vector = generate_embedding(content, provider=provider)

    # 2. Persist via existing repository layer
    return save_memory(
        external_id=external_id,
        content=content,
        metadata=metadata,
        embedding=embedding_vector,
        manager=manager,
    )

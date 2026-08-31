"""
Application-level exceptions for the embedding provider layer.
Ensures sensitive details and API keys are never exposed in error messages.
"""


class EmbeddingError(Exception):
    """Base exception for all embedding-related failures."""
    pass


class InvalidEmbeddingInputError(EmbeddingError):
    """Raised when the input text provided for embedding is invalid (empty, whitespace, non-string)."""
    pass


class EmbeddingConfigurationError(EmbeddingError):
    """Raised when the embedding provider configuration or credentials are missing/invalid."""
    pass


class EmbeddingProviderError(EmbeddingError):
    """Raised when an external embedding provider API call fails or encounters an operational error."""
    pass


class InvalidEmbeddingResponseError(EmbeddingError):
    """Raised when an embedding provider returns an invalid vector (empty, non-numeric, NaN/Inf, dimension mismatch)."""
    pass

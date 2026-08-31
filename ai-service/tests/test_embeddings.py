from unittest.mock import MagicMock, patch
import math
import pytest

from app.schemas.models import MemoryChunk
from app.embeddings.base import validate_embedding_input, validate_vector, EmbeddingProvider
from app.embeddings.exceptions import (
    EmbeddingConfigurationError,
    EmbeddingError,
    EmbeddingProviderError,
    InvalidEmbeddingInputError,
    InvalidEmbeddingResponseError,
)
from app.embeddings.fake import FakeEmbeddingProvider
from app.embeddings.mistral import MistralEmbeddingProvider, _sanitize_error
from app.embeddings.service import (
    generate_embedding,
    get_embedding_provider,
    save_memory_with_embedding,
)
from app.db.memory import save_memory, get_learner_memories
from app.db.connection import get_db


class TestEmbeddingInputValidation:
    """Unit tests for embedding input validation."""

    def test_valid_text_input(self):
        cleaned = validate_embedding_input("  Sample text for embedding  ")
        assert cleaned == "Sample text for embedding"

    def test_empty_text_input_raises_error(self):
        with pytest.raises(InvalidEmbeddingInputError) as exc_info:
            validate_embedding_input("")
        assert "non-empty" in str(exc_info.value)

    def test_whitespace_only_text_raises_error(self):
        with pytest.raises(InvalidEmbeddingInputError) as exc_info:
            validate_embedding_input("   \t\n  ")
        assert "non-empty" in str(exc_info.value)

    def test_none_input_raises_error(self):
        with pytest.raises(InvalidEmbeddingInputError):
            validate_embedding_input(None)  # type: ignore

    def test_non_string_input_raises_error(self):
        with pytest.raises(InvalidEmbeddingInputError):
            validate_embedding_input(12345)  # type: ignore


class TestVectorValidation:
    """Unit tests for output vector validation."""

    def test_valid_vector(self):
        vec = [0.1, -0.2, 0.5, 0.0]
        validated = validate_vector(vec, expected_dimension=4)
        assert validated == [0.1, -0.2, 0.5, 0.0]

    def test_empty_vector_raises_error(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([])
        assert "cannot be empty" in str(exc_info.value)

    def test_dimension_mismatch_raises_error(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([0.1, 0.2], expected_dimension=1024)
        assert "dimension mismatch" in str(exc_info.value)

    def test_non_numeric_element_raises_error(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([0.1, "not-a-number", 0.3])
        assert "not a valid number" in str(exc_info.value)

    def test_boolean_element_rejected(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([0.1, True, 0.3])
        assert "not a valid number" in str(exc_info.value)

    def test_nan_element_raises_error(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([0.1, float("nan"), 0.3])
        assert "non-finite" in str(exc_info.value)

    def test_inf_element_raises_error(self):
        with pytest.raises(InvalidEmbeddingResponseError) as exc_info:
            validate_vector([0.1, float("inf"), 0.3])
        assert "non-finite" in str(exc_info.value)


class TestFakeEmbeddingProvider:
    """Unit tests for the deterministic FakeEmbeddingProvider."""

    def test_deterministic_generation(self):
        provider = FakeEmbeddingProvider(dimension=128)
        vec1 = provider.embed("Learner wants to master Scala")
        vec2 = provider.embed("Learner wants to master Scala")

        assert len(vec1) == 128
        assert vec1 == vec2
        # Check normalized to unit length
        length = math.sqrt(sum(x * x for x in vec1))
        assert pytest.approx(length, 0.001) == 1.0

    def test_distinct_texts_generate_distinct_embeddings(self):
        provider = FakeEmbeddingProvider(dimension=128)
        vec1 = provider.embed("Topic A")
        vec2 = provider.embed("Topic B")
        assert vec1 != vec2

    def test_simulated_api_error(self):
        provider = FakeEmbeddingProvider(fail_mode="api_error")
        with pytest.raises(EmbeddingProviderError):
            provider.embed("Test text")


class TestMistralEmbeddingProvider:
    """Unit tests for MistralEmbeddingProvider with mocked SDK client."""

    def test_missing_api_key_raises_configuration_error(self):
        with patch("app.core.config.settings.EMBEDDING_API_KEY", None), \
             patch("app.core.config.settings.MISTRAL_API_KEY", ""):
            with pytest.raises(EmbeddingConfigurationError) as exc_info:
                MistralEmbeddingProvider(api_key="")
            assert "API key is required" in str(exc_info.value)

    def test_successful_mocked_mistral_embed(self):
        mock_response = MagicMock()
        mock_item = MagicMock()
        mock_item.embedding = [0.01] * 1024
        mock_response.data = [mock_item]

        with patch("mistralai.client.Mistral") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value
            mock_client_instance.embeddings.create.return_value = mock_response

            provider = MistralEmbeddingProvider(api_key="mock-key-12345")
            res = provider.embed("Explain actor concurrency")

            assert len(res) == 1024
            assert res == [0.01] * 1024
            mock_client_instance.embeddings.create.assert_called_once_with(
                model="mistral-embed",
                inputs=["Explain actor concurrency"],
            )

    def test_mistral_api_failure_raises_provider_error(self):
        with patch("mistralai.client.Mistral") as mock_client_cls:
            mock_client_instance = mock_client_cls.return_value
            mock_client_instance.embeddings.create.side_effect = Exception("Rate limit exceeded for api_key=secret123")

            provider = MistralEmbeddingProvider(api_key="mock-key-12345")
            with pytest.raises(EmbeddingProviderError) as exc_info:
                provider.embed("Explain actor concurrency")
            
            # Verify secret is redacted in error message
            assert "secret123" not in str(exc_info.value)
            assert "[REDACTED]" in str(exc_info.value) or "Rate limit" in str(exc_info.value)

    def test_sanitize_error_removes_keys(self):
        raw = "Error with api_key=supersecretkey and Bearer abcdef12345"
        sanitized = _sanitize_error(raw)
        assert "supersecretkey" not in sanitized
        assert "abcdef12345" not in sanitized


class TestEmbeddingService:
    """Unit tests for the embedding service layer and provider injection."""

    def test_generate_embedding_with_injected_provider(self):
        mock_provider = MagicMock(spec=EmbeddingProvider)
        mock_provider.embed.return_value = [0.5, 0.5]

        vec = generate_embedding("Some learning item", provider=mock_provider)
        assert vec == [0.5, 0.5]
        mock_provider.embed.assert_called_once_with("Some learning item")

    def test_get_embedding_provider_factory(self):
        fake_prov = get_embedding_provider(provider_type="fake", dimension=64)
        assert isinstance(fake_prov, FakeEmbeddingProvider)
        assert fake_prov.dimension == 64

    def test_get_embedding_provider_unsupported_raises_error(self):
        with pytest.raises(EmbeddingConfigurationError) as exc_info:
            get_embedding_provider(provider_type="unsupported-provider-xyz")
        assert "Unsupported embedding provider" in str(exc_info.value)


@pytest.mark.integration
class TestEmbeddingPersistenceIntegration:
    """Integration tests connecting generated embeddings to PostgreSQL persistence."""

    def test_save_memory_with_embedding_service(self):
        """Test full pipeline: content -> generate_embedding (Fake) -> save_memory -> PostgreSQL."""
        provider = FakeEmbeddingProvider(dimension=1024)

        mem = save_memory_with_embedding(
            external_id="learner-1049",
            content="Learner is proficient with Pekko Cluster sharding.",
            metadata={"source": "step5A2_integration_test", "domain": "distributed_systems"},
            provider=provider,
        )

        assert isinstance(mem, MemoryChunk)
        assert mem.learner_id == "learner-1049"
        assert "Pekko Cluster sharding" in mem.content
        assert mem.metadata.get("source") == "step5A2_integration_test"

        # Verify record exists in PostgreSQL via get_learner_memories
        memories = get_learner_memories("learner-1049", limit=10)
        found = next((m for m in memories if m.id == mem.id), None)
        assert found is not None
        assert found.content == mem.content

    def test_existing_save_memory_backward_compatibility(self):
        """Verify existing save_memory without embedding continues working exactly as before."""
        mem = save_memory(
            external_id="learner-1049",
            content="Backward compatibility memory without embedding.",
            metadata={"test": "compat"},
        )
        assert isinstance(mem, MemoryChunk)
        assert mem.id is not None

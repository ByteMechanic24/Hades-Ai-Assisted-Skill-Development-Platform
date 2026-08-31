from unittest.mock import MagicMock
import pytest

from app.schemas.models import MemoryChunk
from app.db.exceptions import (
    DatabaseConnectionError,
    DatabaseError,
    LearnerNotFoundError,
)
from app.db.memory import save_memory, get_learner_memories, get_similar_memories, _format_vector
from app.db.connection import DatabaseManager, get_db
from app.embeddings.exceptions import InvalidEmbeddingInputError
from app.embeddings.fake import FakeEmbeddingProvider


class TestMemoryUnit:
    """Unit tests for memory formatting and validation logic without live DB."""

    def test_vector_formatting_valid(self):
        vec = [0.1, 0.25, -0.5]
        formatted = _format_vector(vec)
        assert formatted == "[0.1,0.25,-0.5]"

    def test_vector_formatting_none(self):
        assert _format_vector(None) is None

    def test_vector_formatting_empty_raises_error(self):
        with pytest.raises(ValueError):
            _format_vector([])

    def test_save_memory_empty_external_id_raises_error(self):
        with pytest.raises(ValueError) as exc_info:
            save_memory("", "Learned Python basics")
        assert "non-empty string" in str(exc_info.value)

    def test_save_memory_empty_content_raises_error(self):
        with pytest.raises(ValueError) as exc_info:
            save_memory("learner-1049", "")
        assert "non-empty string" in str(exc_info.value)

    def test_get_learner_memories_invalid_limit_raises_error(self):
        with pytest.raises(ValueError) as exc_info:
            get_learner_memories("learner-1049", limit=0)
        assert "positive integer" in str(exc_info.value)

    def test_get_similar_memories_blank_query_raises_error(self):
        with pytest.raises(InvalidEmbeddingInputError) as exc_info:
            get_similar_memories("learner-1049", "   \t\n  ")
        assert "non-empty" in str(exc_info.value)

    def test_get_similar_memories_invalid_limit_raises_error(self):
        with pytest.raises(ValueError) as exc_info:
            get_similar_memories("learner-1049", "Valid query", limit=0)
        assert "positive integer" in str(exc_info.value)

    def test_learner_not_found_raises_db_error(self):
        mock_manager = MagicMock(spec=DatabaseManager)
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_manager.get_connection.return_value.__enter__.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur
        mock_cur.fetchone.return_value = None

        with pytest.raises(LearnerNotFoundError):
            save_memory("nonexistent-learner", "Some memory", manager=mock_manager)


@pytest.mark.integration
class TestMemoryIntegration:
    """Integration tests executing against the live PostgreSQL + pgvector database."""

    def test_save_memory_for_existing_learner(self):
        """Test persisting a memory item for existing seeded learner-1049."""
        memory = save_memory(
            external_id="learner-1049",
            content="Learner successfully solved initial concurrency challenges in Pekko.",
            metadata={"source": "agent_observation", "session": "s-101"},
        )

        assert isinstance(memory, MemoryChunk)
        assert memory.learner_id == "learner-1049"
        assert "concurrency challenges" in memory.content
        assert memory.metadata.get("source") == "agent_observation"
        assert memory.id is not None

    def test_save_memory_with_jsonb_metadata_and_retrieval(self):
        """Test metadata storage as JSONB and retrieval via get_learner_memories."""
        test_meta = {
            "category": "preference",
            "modality": "hands-on",
            "confidence": 0.92,
            "nested": {"key": "val"},
        }
        mem = save_memory(
            external_id="learner-1049",
            content="Learner prefers step-by-step code walkthroughs over slide lectures.",
            metadata=test_meta,
        )

        memories = get_learner_memories("learner-1049", limit=5)
        assert len(memories) >= 1
        found = next((m for m in memories if m.id == mem.id), None)
        assert found is not None
        assert found.metadata == test_meta

    def test_save_memory_with_optional_embedding(self):
        """Test persisting a memory with unconstrained vector embedding."""
        sample_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
        mem = save_memory(
            external_id="learner-1049",
            content="Learner demonstrated strong interest in event sourcing.",
            embedding=sample_embedding,
        )
        assert mem.id is not None

    def test_learner_foreign_key_isolation(self):
        """
        Test strict learner isolation:
        Memories created for learner-1049 must never be returned when querying another learner.
        """
        # Ensure secondary learner exists for isolation boundary testing
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO learners (external_id, experience_level, available_hours_per_week)
                    VALUES ('learner-iso-test', 'beginner', 5.0)
                    ON CONFLICT (external_id) DO NOTHING;
                    """
                )
            conn.commit()

        # Save memory specifically for learner-1049
        mem_1049 = save_memory(
            external_id="learner-1049",
            content="Strictly private memory for learner 1049.",
            metadata={"private": True},
        )

        # Query secondary learner
        iso_memories = get_learner_memories("learner-iso-test", limit=50)
        iso_ids = [m.id for m in iso_memories]
        assert mem_1049.id not in iso_ids

    def test_missing_learner_raises_not_found_error(self):
        """Test that attempting to persist or fetch memories for non-existent learner raises error."""
        with pytest.raises(LearnerNotFoundError) as exc_info:
            save_memory("unknown-ghost-learner", "Memory text")
        assert exc_info.value.external_id == "unknown-ghost-learner"

        with pytest.raises(LearnerNotFoundError):
            get_learner_memories("unknown-ghost-learner")

        with pytest.raises(LearnerNotFoundError):
            get_similar_memories("unknown-ghost-learner", "Some search query")

    def test_connection_pool_resources_released(self):
        """Test database connection is properly checked back into the pool."""
        manager = DatabaseManager()
        pool = manager.get_pool()
        assert pool.closed is False

        mem = save_memory(
            external_id="learner-1049",
            content="Resource tracking memory item.",
            manager=manager,
        )
        assert mem.id is not None
        assert pool.closed is False
        manager.close()

    def test_semantic_retrieval_and_cosine_ranking(self):
        """
        Test A & Test B:
        Create memories with known vectors and query.
        Verify results are ranked by cosine distance ascending (closest match first).
        """
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO learners (external_id, experience_level, available_hours_per_week)
                    VALUES ('learner-rank-test', 'intermediate', 10.0)
                    ON CONFLICT (external_id) DO NOTHING;
                    """
                )
                cur.execute(
                    """
                    DELETE FROM memory_chunks 
                    WHERE learner_id = (SELECT id FROM learners WHERE external_id = 'learner-rank-test');
                    """
                )
            conn.commit()


        fake_prov = FakeEmbeddingProvider(dimension=1024)

        # Text 1: "Mastering Akka Streams in Scala"
        # Text 2: "Introduction to HTML and CSS Flexbox"
        mem1 = save_memory(
            external_id="learner-rank-test",
            content="Mastering Akka Streams in Scala and event sourcing.",
            embedding=fake_prov.embed("Mastering Akka Streams in Scala and event sourcing."),
        )
        mem2 = save_memory(
            external_id="learner-rank-test",
            content="Introduction to HTML and CSS Flexbox for web design.",
            embedding=fake_prov.embed("Introduction to HTML and CSS Flexbox for web design."),
        )

        # Query closely aligned with Text 1
        results = get_similar_memories(
            external_id="learner-rank-test",
            query_text="Mastering Akka Streams in Scala and event sourcing.",
            limit=5,
            provider=fake_prov,
        )

        assert len(results) >= 2
        result_ids = [r.id for r in results]
        assert mem1.id in result_ids
        assert mem2.id in result_ids

        # mem1 must be the top result (exact match => cosine distance 0)
        assert results[0].id == mem1.id


    def test_semantic_retrieval_learner_isolation(self):
        """
        Test C: Learner isolation in semantic search.
        Learner A's semantic search must never return Learner B's memories.
        """
        fake_prov = FakeEmbeddingProvider(dimension=1024)
        target_text = "Highly proprietary knowledge for learner 1049 only."

        # Save for learner-1049
        mem_1049 = save_memory(
            external_id="learner-1049",
            content=target_text,
            embedding=fake_prov.embed(target_text),
        )

        # Query secondary learner with exact matching query
        results_iso = get_similar_memories(
            external_id="learner-iso-test",
            query_text=target_text,
            limit=10,
            provider=fake_prov,
        )

        iso_ids = [r.id for r in results_iso]
        assert mem_1049.id not in iso_ids

    def test_semantic_retrieval_limit(self):
        """Test D: Verify limit parameter restricts returned count."""
        fake_prov = FakeEmbeddingProvider(dimension=1024)
        results = get_similar_memories(
            external_id="learner-1049",
            query_text="Scala stream processing",
            limit=1,
            provider=fake_prov,
        )
        assert len(results) == 1

    def test_unembedded_memories_excluded(self):
        """
        Test E: Memories with embedding=NULL must be excluded from semantic search results.
        """
        fake_prov = FakeEmbeddingProvider(dimension=1024)
        raw_text = "Unembedded note without any vector representation."

        unembedded_mem = save_memory(
            external_id="learner-1049",
            content=raw_text,
            embedding=None,  # Explicitly NULL
        )

        results = get_similar_memories(
            external_id="learner-1049",
            query_text=raw_text,
            limit=20,
            provider=fake_prov,
        )

        retrieved_ids = [r.id for r in results]
        assert unembedded_mem.id not in retrieved_ids

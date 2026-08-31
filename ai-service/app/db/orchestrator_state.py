"""
Durable Orchestration State & Roadmap Chunk Persistence (Step 4)

Persists and retrieves OrchestrationState and RoadmapChunk objects using
PostgreSQL memory_chunks with structured metadata and provides safe
in-memory fallback.
"""

import logging
from typing import Optional, List, Dict

from app.schemas.models import (
    OrchestrationState,
    RoadmapChunk,
)

from app.db.connection import (
    db_manager,
    DatabaseManager,
)

from app.db.memory import save_memory

logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------
# In-memory fast cache
# ----------------------------------------------------------------------

_STATE_CACHE: Dict[str, OrchestrationState] = {}

_CHUNK_CACHE: Dict[str, List[RoadmapChunk]] = {}


# ======================================================================
# ORCHESTRATION STATE
# ======================================================================

def save_orchestration_state(
    state: OrchestrationState,
    manager: Optional[DatabaseManager] = None,
) -> None:
    """
    Persist orchestration state.

    The complete state remains available through the process-local cache.

    PostgreSQL memory_chunks receives a searchable summary/checkpoint.
    """

    _STATE_CACHE[state.session_id] = (
        state.model_copy(deep=True)
    )

    try:
        payload_meta = {
            "category": "orchestration_state",
            "session_id": state.session_id,
            "status": state.status,
            "active_topic": state.active_topic,
            "target_goal": state.target_goal,
            "current_topic_index": state.current_topic_index,
            "available_topics_count": len(
                state.available_topics
            ),
            "generated_chunks_count": len(
                state.generated_chunks
            ),
            "prefetched_topics": state.prefetched_topics,
        }

        summary_content = (
            f"Orchestration State for learner "
            f"{state.learner_id} "
            f"(Session {state.session_id}): "
            f"Status={state.status}, "
            f"ActiveTopic={state.active_topic or 'None'}, "
            f"Goal={state.target_goal or 'None'}. "
            f"AvailableTopics="
            f"{', '.join(state.available_topics[:5])}"
        )

        save_memory(
            external_id=state.learner_id,
            content=summary_content,
            metadata=payload_meta,
            manager=manager or db_manager,
        )

        logger.debug(
            "Persisted OrchestrationState for session %s",
            state.session_id,
        )

    except Exception as exc:
        logger.warning(
            "Non-blocking DB persistence failure for session %s: %s",
            state.session_id,
            exc,
        )


def get_orchestration_state(
    session_id: str,
    learner_id: Optional[str] = None,
    manager: Optional[DatabaseManager] = None,
) -> Optional[OrchestrationState]:
    """
    Retrieve orchestration state.

    Current implementation uses the process-local state cache.

    PostgreSQL memory_chunks stores searchable checkpoints but does not
    currently reconstruct the complete Pydantic OrchestrationState.
    """

    state = _STATE_CACHE.get(session_id)

    if state is None:
        return None

    return state.model_copy(deep=True)


# ======================================================================
# ROADMAP CHUNKS
# ======================================================================

def save_roadmap_chunk(
    learner_id: str,
    chunk: RoadmapChunk,
    manager: Optional[DatabaseManager] = None,
) -> None:
    """
    Persist an incremental RoadmapChunk.
    """

    if learner_id not in _CHUNK_CACHE:
        _CHUNK_CACHE[learner_id] = []

    existing_ids = {
        c.chunk_id
        for c in _CHUNK_CACHE[learner_id]
    }

    if chunk.chunk_id not in existing_ids:
        _CHUNK_CACHE[learner_id].append(chunk)

    try:
        meta = {
            "category": "roadmap_chunk",
            "chunk_id": chunk.chunk_id,
            "roadmap_id": chunk.roadmap_id,
            "sequence_number": chunk.sequence_number,
            "title": chunk.title,
            "topics": chunk.topics,
            "has_more": chunk.has_more,
        }

        content = (
            f"Roadmap Chunk #{chunk.sequence_number} "
            f"'{chunk.title}' for learner {learner_id}: "
            f"Topics: {', '.join(chunk.topics)}"
        )

        save_memory(
            external_id=learner_id,
            content=content,
            metadata=meta,
            manager=manager or db_manager,
        )

        logger.debug(
            "Persisted RoadmapChunk %s for learner %s",
            chunk.chunk_id,
            learner_id,
        )

    except Exception as exc:
        logger.warning(
            "Non-blocking DB chunk persistence failure: %s",
            exc,
        )


def get_saved_roadmap_chunks(
    learner_id: str,
) -> List[RoadmapChunk]:
    """
    Retrieve cached roadmap chunks for a learner.
    """

    return list(
        _CHUNK_CACHE.get(
            learner_id,
            [],
        )
    )


# ======================================================================
# TEST / CACHE UTILITIES
# ======================================================================

def clear_state_cache() -> None:
    """
    Clear process-local orchestration caches.

    Primarily used by tests.
    """

    _STATE_CACHE.clear()
    _CHUNK_CACHE.clear()
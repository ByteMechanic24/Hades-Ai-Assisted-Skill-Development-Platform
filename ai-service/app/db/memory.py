import json
import logging
from typing import Any, Dict, List, Optional
import psycopg

from app.schemas.models import MemoryChunk
from app.db.connection import DatabaseManager, db_manager
from app.db.exceptions import (
    DatabaseError,
    DatabaseConnectionError,
    LearnerNotFoundError,
    sanitize_db_url,
)

logger = logging.getLogger(__name__)


def _format_vector(embedding: Optional[List[float]]) -> Optional[str]:
    """Format a list of float numbers into pgvector string format '[x,y,z]'."""
    if embedding is None:
        return None
    if not isinstance(embedding, (list, tuple)) or len(embedding) == 0:
        raise ValueError("Embedding must be a non-empty list of floating-point numbers.")
    return "[" + ",".join(str(float(x)) for x in embedding) + "]"


def save_memory(
    external_id: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    embedding: Optional[List[float]] = None,
    manager: Optional[DatabaseManager] = None,
) -> MemoryChunk:
    """
    Persist a foundational memory item associated with a learner in PostgreSQL + pgvector.

    Parameters:
        external_id: External learner identifier (e.g. 'learner-1049').
        content: Text content of the memory.
        metadata: Optional dictionary of structured metadata.
        embedding: Optional list of floats representing the embedding vector.
        manager: Optional DatabaseManager instance; defaults to global db_manager.

    Returns:
        MemoryChunk: Fully populated persisted memory domain object.

    Raises:
        ValueError: If external_id or content is empty/invalid.
        LearnerNotFoundError: If the learner does not exist in the database.
        DatabaseConnectionError: If connection to the database fails.
        DatabaseError: If the SQL query fails.
    """
    if not external_id or not isinstance(external_id, str) or not external_id.strip():
        raise ValueError("external_id must be a non-empty string.")
    if not content or not isinstance(content, str) or not content.strip():
        raise ValueError("content must be a non-empty string.")

    cleaned_external_id = external_id.strip()
    cleaned_content = content.strip()
    meta_json = json.dumps(metadata or {})
    vec_str = _format_vector(embedding)
    active_manager = manager or db_manager

    try:
        with active_manager.get_connection() as conn:
            with conn.cursor() as cur:
                # 1. Resolve learner internal UUID
                cur.execute(
                    "SELECT id FROM learners WHERE external_id = %s;",
                    (cleaned_external_id,),
                )
                row = cur.fetchone()
                if not row:
                    raise LearnerNotFoundError(cleaned_external_id)
                db_learner_id = row[0]

                # 2. Insert memory chunk
                if vec_str is not None:
                    cur.execute(
                        """
                        INSERT INTO memory_chunks (learner_id, content, metadata, embedding)
                        VALUES (%s, %s, %s::jsonb, %s::vector)
                        RETURNING id, created_at, updated_at;
                        """,
                        (db_learner_id, cleaned_content, meta_json, vec_str),
                    )
                else:
                    cur.execute(
                        """
                        INSERT INTO memory_chunks (learner_id, content, metadata)
                        VALUES (%s, %s, %s::jsonb)
                        RETURNING id, created_at, updated_at;
                        """,
                        (db_learner_id, cleaned_content, meta_json),
                    )

                res = cur.fetchone()
                chunk_id, created_at, updated_at = res

            conn.commit()

            return MemoryChunk(
                id=str(chunk_id),
                learner_id=cleaned_external_id,
                content=cleaned_content,
                metadata=metadata or {},
                created_at=created_at.isoformat() if created_at else None,
                updated_at=updated_at.isoformat() if updated_at else None,
            )

    except LearnerNotFoundError:
        raise
    except ValueError:
        raise
    except psycopg.OperationalError as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL operational error in save_memory: %s", sanitized_msg)
        raise DatabaseConnectionError(
            f"Database connection error saving memory: {sanitized_msg}",
            original_error=e,
        ) from e
    except psycopg.Error as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL error in save_memory: %s", sanitized_msg)
        raise DatabaseError(f"Database query failed saving memory: {sanitized_msg}") from e
    except Exception as e:
        if isinstance(e, (DatabaseError, ValueError)):
            raise
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("Unexpected error in save_memory: %s", sanitized_msg)
        raise DatabaseError(f"Unexpected error saving memory: {sanitized_msg}") from e


def get_learner_memories(
    external_id: str,
    limit: int = 10,
    manager: Optional[DatabaseManager] = None,
) -> List[MemoryChunk]:
    """
    Retrieve persisted memories for a specific learner ordered by creation time descending.

    Enforces strict learner isolation: only memories matching the specified learner are returned.

    Parameters:
        external_id: External learner identifier.
        limit: Maximum number of memories to return (must be > 0).
        manager: Optional DatabaseManager instance; defaults to global db_manager.

    Returns:
        List[MemoryChunk]: List of persisted memory chunks.

    Raises:
        ValueError: If parameters are invalid.
        LearnerNotFoundError: If learner does not exist in the database.
        DatabaseConnectionError: If connection fails.
        DatabaseError: If database query fails.
    """
    if not external_id or not isinstance(external_id, str) or not external_id.strip():
        raise ValueError("external_id must be a non-empty string.")
    if limit <= 0:
        raise ValueError("limit must be a positive integer.")

    cleaned_external_id = external_id.strip()
    active_manager = manager or db_manager

    try:
        with active_manager.get_connection() as conn:
            with conn.cursor() as cur:
                # 1. Verify learner existence
                cur.execute(
                    "SELECT id FROM learners WHERE external_id = %s;",
                    (cleaned_external_id,),
                )
                row = cur.fetchone()
                if not row:
                    raise LearnerNotFoundError(cleaned_external_id)
                db_learner_id = row[0]

                # 2. Query memories scoped to this learner
                cur.execute(
                    """
                    SELECT id, content, metadata, created_at, updated_at
                    FROM memory_chunks
                    WHERE learner_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (db_learner_id, limit),
                )
                rows = cur.fetchall()

                return [
                    MemoryChunk(
                        id=str(r[0]),
                        learner_id=cleaned_external_id,
                        content=r[1],
                        metadata=r[2] if isinstance(r[2], dict) else {},
                        created_at=r[3].isoformat() if r[3] else None,
                        updated_at=r[4].isoformat() if r[4] else None,
                    )
                    for r in rows
                ]

    except LearnerNotFoundError:
        raise
    except ValueError:
        raise
    except psycopg.OperationalError as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL operational error in get_learner_memories: %s", sanitized_msg)
        raise DatabaseConnectionError(
            f"Database connection error querying memories: {sanitized_msg}",
            original_error=e,
        ) from e
    except psycopg.Error as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL error in get_learner_memories: %s", sanitized_msg)
        raise DatabaseError(f"Database query failed for memories: {sanitized_msg}") from e
    except Exception as e:
        if isinstance(e, (DatabaseError, ValueError)):
            raise
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("Unexpected error in get_learner_memories: %s", sanitized_msg)
        raise DatabaseError(f"Unexpected error querying memories: {sanitized_msg}") from e


def get_similar_memories(
    external_id: str,
    query_text: str,
    limit: int = 5,
    provider: Optional[Any] = None,
    manager: Optional[DatabaseManager] = None,
) -> List[MemoryChunk]:
    """
    Retrieve top-K most semantically similar memories for a specific learner using pgvector cosine distance.

    Enforces strict learner isolation: only memories matching the specified learner are evaluated.
    Unembedded memories (embedding IS NULL) are excluded from the result.

    Parameters:
        external_id: External learner identifier (e.g. 'learner-1049').
        query_text: Query string to be embedded and compared.
        limit: Maximum number of memories to return (must be > 0, defaults to 5).
        provider: Optional EmbeddingProvider instance for generating the query vector.
        manager: Optional DatabaseManager instance; defaults to global db_manager.

    Returns:
        List[MemoryChunk]: Ranked list of memory chunks ordered by cosine similarity descending.

    Raises:
        InvalidEmbeddingInputError: If query_text is empty, whitespace, or invalid.
        ValueError: If external_id or limit is invalid.
        LearnerNotFoundError: If learner does not exist in the database.
        DatabaseConnectionError: If connection fails.
        DatabaseError: If database query fails.
    """
    if not external_id or not isinstance(external_id, str) or not external_id.strip():
        raise ValueError("external_id must be a non-empty string.")
    if limit <= 0:
        raise ValueError("limit must be a positive integer.")

    from app.embeddings.base import validate_embedding_input
    from app.embeddings.service import generate_embedding

    cleaned_external_id = external_id.strip()
    cleaned_query = validate_embedding_input(query_text)

    # 1. Generate query embedding using the Step 5A.2 abstraction
    query_vector = generate_embedding(cleaned_query, provider=provider)
    vec_str = _format_vector(query_vector)
    query_dims = len(query_vector)
    active_manager = manager or db_manager

    try:
        with active_manager.get_connection() as conn:
            with conn.cursor() as cur:
                # 2. Verify learner existence
                cur.execute(
                    "SELECT id FROM learners WHERE external_id = %s;",
                    (cleaned_external_id,),
                )
                row = cur.fetchone()
                if not row:
                    raise LearnerNotFoundError(cleaned_external_id)
                db_learner_id = row[0]

                # 3. Query top-K similar memories scoped strictly to this learner
                cur.execute(
                    """
                    SELECT 
                        id, 
                        content, 
                        metadata, 
                        created_at, 
                        updated_at
                    FROM memory_chunks
                    WHERE learner_id = %s 
                      AND embedding IS NOT NULL
                      AND vector_dims(embedding) = %s
                    ORDER BY embedding <=> %s::vector ASC
                    LIMIT %s;
                    """,
                    (db_learner_id, query_dims, vec_str, limit),
                )
                rows = cur.fetchall()

                return [
                    MemoryChunk(
                        id=str(r[0]),
                        learner_id=cleaned_external_id,
                        content=r[1],
                        metadata=r[2] if isinstance(r[2], dict) else {},
                        created_at=r[3].isoformat() if r[3] else None,
                        updated_at=r[4].isoformat() if r[4] else None,
                    )
                    for r in rows
                ]

    except LearnerNotFoundError:
        raise
    except ValueError:
        raise
    except psycopg.OperationalError as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL operational error in get_similar_memories: %s", sanitized_msg)
        raise DatabaseConnectionError(
            f"Database connection error querying memories: {sanitized_msg}",
            original_error=e,
        ) from e
    except psycopg.Error as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL error in get_similar_memories: %s", sanitized_msg)
        raise DatabaseError(f"Database query failed for memories: {sanitized_msg}") from e
    except Exception as e:
        if isinstance(e, (DatabaseError, ValueError)):
            raise
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("Unexpected error in get_similar_memories: %s", sanitized_msg)
        raise DatabaseError(f"Unexpected error querying memories: {sanitized_msg}") from e


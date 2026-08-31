# Persistent Agent Memory Foundation Documentation (Step 5A.1)

## 1. Overview & Architecture

Step 5A.1 establishes the foundational persistent memory storage and repository layer for the Python AI Service. Persistent memory records are stored in PostgreSQL using the `memory_chunks` table, with foreign-key scoping to the `learners` table and support for model-agnostic vector embeddings via `pgvector`.

```
                    Learner Memory Item
                            │
                            ▼
              ┌───────────────────────────┐
              │    app.db.memory Module   │
              │       save_memory()       │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   PostgreSQL + pgvector   │
              │       memory_chunks       │
              │  (learner_id, jsonb, vec) │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   get_learner_memories()  │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   MemoryChunk (Pydantic)  │
              └───────────────────────────┘
```

---

## 2. Database Schema: `memory_chunks`

Defined in migration [`database/migrations/V002__add_memory_chunks.sql`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/database/migrations/V002__add_memory_chunks.sql):

```sql
CREATE TABLE IF NOT EXISTS memory_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_chunks_learner_id ON memory_chunks(learner_id);
```

### Schema Features:
1. **Learner Scoping:** Foreign key `learner_id` references `learners(id)` with `ON DELETE CASCADE`.
2. **Unconstrained Vector (`embedding vector`):** Uses pgvector without hardcoding dimension length, ensuring model-agnostic compatibility with future embedding providers (Mistral, OpenAI, etc.).
3. **Structured Extensible Metadata (`metadata JSONB`):** Stores arbitrary key-value attributes (source, session context, tags, confidence scores).
4. **Learner Index:** `idx_memory_chunks_learner_id` guarantees high-performance learner-filtered queries.

---

## 3. Repository Layer: `app.db.memory`

### 3.1 `save_memory`
```python
def save_memory(
    external_id: str,
    content: str,
    metadata: Optional[Dict[str, Any]] = None,
    embedding: Optional[List[float]] = None,
    manager: Optional[DatabaseManager] = None,
) -> MemoryChunk:
    ...
```
* Resolves learner UUID from `external_id`.
* Persists memory content, JSONB metadata, and optional vector embedding.
* Commits and returns typed [`MemoryChunk`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/schemas/models.py).

### 3.2 `get_learner_memories`
```python
def get_learner_memories(
    external_id: str,
    limit: int = 10,
    manager: Optional[DatabaseManager] = None,
) -> List[MemoryChunk]:
    ...
```
* Queries memory items belonging strictly to the requested learner, ordered chronologically by `created_at DESC`.

### 3.3 `get_similar_memories`
```python
def get_similar_memories(
    external_id: str,
    query_text: str,
    limit: int = 5,
    provider: Optional[EmbeddingProvider] = None,
    manager: Optional[DatabaseManager] = None,
) -> List[MemoryChunk]:

    ...
```
* Generates an embedding for `query_text` via the decoupled [`EmbeddingService`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/embeddings/service.py).
* Queries `memory_chunks` using pgvector cosine distance (`embedding <=> %s::vector ASC`).
* Strictly scopes retrieval to the specified learner UUID (`WHERE learner_id = %s AND embedding IS NOT NULL`).
* Excludes unembedded memories (`embedding IS NULL`).
* Returns an ordered `List[MemoryChunk]` ranked from most similar to least similar.

---

## 4. Implementation Status & Boundaries

| Capability | Status | Notes |
|---|---|---|
| Persistent Storage (`memory_chunks`) | **IMPLEMENTED** | Table with UUID PK, FK to learners, JSONB metadata, vector column |
| Learner Scoping & Isolation | **IMPLEMENTED** | All queries enforce strict learner-scoped filtering |
| Database Repository Layer | **IMPLEMENTED** | `save_memory()`, `get_learner_memories()`, `get_similar_memories()` in `app.db.memory` |
| Domain Models | **IMPLEMENTED** | `MemoryChunk` in `app.schemas.models` |
| Embedding Generation | **IMPLEMENTED** | Mistral (`mistral-embed`, 1024-dim) & Fake providers in `app.embeddings` |
| Vector Similarity Retrieval | **IMPLEMENTED** | Semantic similarity search using pgvector cosine distance (`<=>`) |
| Vector Indexing (HNSW/IVFFlat) | **NOT IMPLEMENTED** | Index creation deferred until production migration |
| Agno Agent Memory Integration | **NOT IMPLEMENTED** | Deferred to Step 5A.4 |
| Orchestration Memory Injection | **NOT IMPLEMENTED** | Deferred to Step 5A.5 |

---

## 5. Next Steps

1. **Step 5A.4 — Agno Memory Integration:** Connect persistent memory and semantic retrieval to Agno agent sessions.
2. **Step 5A.5 — Orchestration Integration:** Inject retrieved context into multi-agent workflows.
3. **ANN Vector Indexing:** HNSW or IVFFlat index will be added in a future migration when index tuning is finalized.


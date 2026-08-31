# Step 5A.3 — pgvector Semantic Retrieval

## Objective

Implement semantic retrieval over the existing persistent memory_chunks table.

This step must build directly on the already completed Steps 5A.1 and 5A.2.

## Existing baseline — DO NOT REDESIGN

PostgreSQL + pgvector is the persistent database layer.

memory_chunks already exists in V002__add_memory_chunks.sql.

memory_chunks.embedding is already an unconstrained pgvector column.

save_memory() and get_learner_memories() already exist.

Step 5A.2 is COMPLETE.

MistralEmbeddingProvider is already implemented.

The selected production embedding model is mistral-embed.

Embedding dimensionality is 1024.

FakeEmbeddingProvider exists for offline testing.

EmbeddingService already exists.

save_memory_with_embedding() already exists.

Do NOT redo or redesign embedding generation.

Do NOT modify the Skill Analysis Agent.

Do NOT integrate Agno memory yet.

Do NOT modify the Orchestrator.

Do NOT add FastAPI routes.

Do NOT modify Scala.

Do NOT implement the later agent-memory orchestration step.

## 1. Implement Semantic Memory Retrieval

Add a repository function in the existing database layer:

get_similar_memories(
    external_id: str,
    query_text: str,
    limit: int = 5,
    manager: Optional[DatabaseManager] = None,
) -> List[MemoryChunk]

Purpose:

Resolve the learner using the existing external_id.

Generate an embedding for query_text using the already implemented EmbeddingService.

Query memory_chunks.embedding using pgvector cosine distance.

Return the most semantically similar memories.

Strictly scope retrieval to the requested learner.

Use the existing project conventions and infrastructure rather than creating a second database or embedding abstraction.

## 2. Similarity Query

Use pgvector cosine distance:

embedding <=> %s

The query must:

Filter by the resolved learner UUID.

Ignore memories whose embedding is NULL.

Order by cosine distance ascending.

Return the requested number of memories.

Preserve the existing MemoryChunk domain representation.

Conceptually:

SELECT
    id,
    learner_id,
    content,
    metadata,
    embedding,
    created_at,
    updated_at
FROM memory_chunks
WHERE learner_id = %s
  AND embedding IS NOT NULL
ORDER BY embedding <=> %s
LIMIT %s;

Adapt parameter/vector serialization to the existing psycopg + pgvector setup already present in the repository.

Do not introduce a different similarity metric.

## 3. Learner Isolation

Learner isolation is mandatory.

A semantic search for learner A must NEVER return memory belonging to learner B, even when B has a mathematically closer embedding.

Use the existing external_id -> learners.id resolution pattern already established by get_learner_context() and the memory repository.

If the learner does not exist, preserve the project's existing database exception behavior rather than silently returning another learner's memories.

## 4. Query Embedding

Do not implement another embedding provider.

Use the embedding infrastructure from Step 5A.2.

The flow must be:

query_text
    ↓
EmbeddingService
    ↓
MistralEmbeddingProvider / configured provider
    ↓
query embedding
    ↓
pgvector cosine similarity
    ↓
ranked MemoryChunk results

The repository should depend on the existing embedding abstraction, not directly hard-code a new HTTP request to Mistral.

Make the dependency testable/injectable where consistent with the current Step 5A.2 implementation.

## 5. Retrieval API Semantics

The returned list should be ordered from most similar to least similar.

limit must be validated as a sensible positive bounded integer according to existing project conventions.

query_text must reject empty/blank input.

If there are no memories with embeddings for the learner, return:

[]

Do not fall back to lexical/text search.

Do not retrieve unembedded memories for semantic results.

## 6. Similarity Score / Distance

If the existing MemoryChunk model already supports an appropriate similarity/distance representation, preserve it.

If it does not, do NOT redesign the domain model unnecessarily.

The minimum required contract for this step is an ordered:

List[MemoryChunk]

where ordering represents cosine similarity ranking.

If adding a distance field is necessary for the existing implementation, explicitly document that change and keep it minimal.

Do not invent a new scoring system.

## 7. Vector Index

Do NOT add an ANN index automatically in this step unless the existing schema/project specification explicitly requires it.

The current architecture intentionally separates semantic retrieval from future ANN optimization.

If the implementation requires an index to function correctly, explain why.

Otherwise:

implement correct pgvector retrieval first;

leave HNSW/IVFFlat optimization for a later migration/optimization decision.

Do not modify V001.

Do not rewrite V002.

Do not create another memory table.

## 8. Tests

Add deterministic unit tests and PostgreSQL integration tests.

At minimum verify:

Test A — Basic semantic retrieval

Create several memories with embeddings and query using an embedding positioned closest to one memory.

Verify the closest memory is returned first.

Test B — Ranking

Create multiple memories with known vectors.

Verify results are ordered by cosine distance ascending.

Test C — Learner isolation

Create memories for at least two learners.

Ensure a query for learner A never returns learner B's memory.

Test D — Limit

Verify limit=1, limit=3, etc. return no more than the requested number.

Test E — Unembedded memories

Create a memory with embedding=None.

Verify it is excluded from semantic retrieval.

Test F — Unknown learner

Verify the existing learner-not-found behavior is preserved.

Test G — Blank query

Verify empty/whitespace-only query text is rejected.

Test H — Embedding service usage

Mock/inject the embedding service and verify query_text is passed through the existing Step 5A.2 embedding abstraction.

Do not make unit tests depend on a live Mistral API.

Integration tests may use the project's existing test embedding infrastructure.

## 9. Backward Compatibility

Existing functionality must remain unchanged:

save_memory()

get_learner_memories()

save_memory_with_embedding()

EmbeddingService

MistralEmbeddingProvider

FakeEmbeddingProvider

learner context retrieval

Skill Analysis Agent

existing learning-path tests

Do not remove or rename existing functions.

Do not change existing payload field names.

Do not change existing database table names.

## 10. Files / Scope

Modify only the minimum required existing files and create tests/documentation where appropriate.

Expected implementation areas:

ai-service/app/db/memory.py
ai-service/app/schemas/models.py       # only if genuinely required
ai-service/app/...                     # existing embedding abstraction location
ai-service/tests/test_memory.py
ai-service/docs/persistent_memory.md   # if documentation needs updating

Use the actual existing project paths if they differ.

Do not create duplicate embedding providers, repositories, or database managers.

## 11. Explicitly OUT OF SCOPE

Do NOT implement any of the following in Step 5A.3:

Agno memory integration

Agent session memory

Orchestrator changes

Skill Analysis Agent changes

Learning Path Agent changes

Resource Discovery changes

Assessment changes

Adaptation changes

FastAPI endpoint changes

Scala backend changes

ANN indexing unless explicitly required

HNSW migration

IVFFlat migration

new embedding providers

new vector database

external vector database

cloud database migration

memory summarization

memory deletion policies

automatic memory extraction from conversations

Those belong to later steps.

## 12. Validation

Run the complete existing test suite:

uv run pytest -v

Also run:

uv run pytest -m "not integration" -v

and:

uv run pytest -m "integration" -v

Report:

total tests

unit tests

integration tests

failures, if any

files created

files modified

database migrations changed, if any

exact retrieval function implemented

embedding abstraction used

similarity metric used

## 13. Completion Criteria

Step 5A.3 is COMPLETE only when:

get_similar_memories() exists and is usable.

Query text is embedded through the existing Step 5A.2 embedding abstraction.

pgvector cosine distance is used.

Results are ranked by semantic similarity.

Results are strictly learner-scoped.

NULL embeddings are excluded.

limit is respected.

unknown learners are handled correctly.

blank queries are rejected.

unit and integration tests cover the behavior.

existing tests continue to pass.

no Agno/orchestrator/FastAPI/Scala work is introduced.

no unnecessary schema redesign occurs.

# STEP 5A.2 — EMBEDDING PROVIDER + GENERATION

You are working on the HADES AI Personalized Learning Platform.

This is an incremental implementation step. You MUST preserve the existing architecture and MUST NOT redesign unrelated parts of the system.

============================================================
CURRENT ARCHITECTURE — SOURCE OF TRUTH
============================================================

Main Backend:
- Scala

AI Service:
- Python
- FastAPI
- Agno

Database:
- PostgreSQL
- pgvector extension
- Local development database currently used
- Cloud provider has NOT been finalized

Current database migrations:
- V001__initial_schema.sql
- V002__add_memory_chunks.sql

Current persistent memory foundation:

Table:
memory_chunks

Fields:

- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE
- content TEXT NOT NULL
- metadata JSONB NOT NULL DEFAULT '{}'::jsonb
- embedding vector
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

Current indexes:
- idx_memory_chunks_learner_id

Current trigger:
- trg_memory_chunks_updated_at

IMPORTANT:

The embedding column is intentionally currently an unconstrained pgvector:

    embedding vector

DO NOT change it to vector(N) in this step unless absolutely required by the selected provider and explicitly justified.

The reason is that embedding dimensionality has not yet been locked into the database schema.

============================================================
PREVIOUSLY COMPLETED WORK
============================================================

Step 4A.2:
- get_learner_context(external_id) implemented.
- Reads real learner information from PostgreSQL.
- Maps DB data into LearnerProfile.

Step 4A.4:
- LearnerSkillAnalysisAgent now uses:
    get_learner_context(learner_id)

- No mock fallback for learner profile/skills.

Step 5A.1:
Persistent memory foundation implemented.

Repository:

    app.db.memory

Functions:

    save_memory(
        external_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        embedding: Optional[List[float]] = None,
        manager: Optional[DatabaseManager] = None,
    ) -> MemoryChunk

and:

    get_learner_memories(
        external_id: str,
        limit: int = 10,
        manager: Optional[DatabaseManager] = None,
    ) -> List[MemoryChunk]

Step 5A.1 deliberately DID NOT implement:

- embedding generation
- semantic vector retrieval
- ANN vector indexes
- Agno memory integration
- orchestrator integration
- FastAPI memory endpoints
- Scala changes
- agent changes

The existing test baseline is:

73 tests passing
58 unit tests
15 integration tests

============================================================
OVERALL MEMORY IMPLEMENTATION SEQUENCE
============================================================

We are implementing memory incrementally:

5A.1 — Persistent Memory Foundation
        ✅ COMPLETE

5A.2 — Embedding Provider + Generation
        ← YOU ARE IMPLEMENTING THIS STEP

5A.3 — pgvector Semantic Retrieval

5A.4 — Agno Memory Integration

5A.5 — Memory into Orchestration / Agents

DO NOT implement 5A.3, 5A.4, or 5A.5 in this task.

============================================================
OBJECTIVE OF STEP 5A.2
============================================================

Implement the embedding-generation layer for persistent agent memory.

The goal is:

    memory text
        ↓
    embedding provider
        ↓
    embedding vector
        ↓
    existing memory persistence layer

After this step, the application should be able to take memory content and generate an embedding using a clean, isolated provider abstraction.

The embedding should be compatible with the existing:

    memory_chunks.embedding

column.

============================================================
CRITICAL ARCHITECTURAL REQUIREMENT
============================================================

Do NOT tightly couple the memory repository to a specific provider implementation.

Create a small embedding abstraction so that the provider/model can be replaced later without rewriting:

- memory repository
- agents
- orchestration
- database schema

For example, use an interface/protocol/abstract contract such as:

    EmbeddingProvider

with an operation conceptually equivalent to:

    embed(text) -> List[float]

The exact implementation style is up to you, but keep it simple and idiomatic for the existing Python project.

============================================================
EMBEDDING PROVIDER SELECTION
============================================================

Before implementing the provider, inspect the EXISTING project configuration and dependencies.

Determine whether the project already contains an embedding provider dependency/configuration that should be reused.

DO NOT blindly introduce a completely new provider if an appropriate provider is already present.

If an embedding provider has already been configured in the project, use that existing configuration.

If no embedding provider is currently configured, select a reasonable provider that fits the existing architecture and document the decision clearly.

The provider must support generating embeddings from text.

The implementation must NOT require changing the database schema merely to accommodate the provider.

============================================================
CONFIGURATION
============================================================

Embedding configuration must NOT be hardcoded.

Use the project's existing configuration/settings mechanism.

If configuration fields do not already exist, add only the minimum required configuration, for example conceptually:

    EMBEDDING_PROVIDER
    EMBEDDING_MODEL
    EMBEDDING_API_KEY

Use the project's existing naming conventions.

DO NOT expose API keys in source code.

DO NOT commit secrets.

Environment variables / existing settings infrastructure should be used.

If the provider supports a local/no-network test strategy, preserve that for tests.

============================================================
REQUIRED COMPONENTS
============================================================

Implement the following logical pieces.

### 1. Embedding Provider Abstraction

Create a clean provider contract.

Conceptually:

    class EmbeddingProvider:
        def embed(self, text: str) -> List[float]:
            ...

The exact implementation may use Protocol, ABC, or another appropriate pattern.

Requirements:

- accepts text
- returns embedding vector
- validates input
- returns deterministic shape for a configured provider/model
- raises a clear application-level exception on provider failure

Do not make database code responsible for calling the external embedding API.

------------------------------------------------------------

### 2. Concrete Embedding Provider

Implement the selected provider.

Responsibilities:

- call the provider's embedding API/library
- pass the configured model
- extract the embedding vector
- return List[float]
- handle provider/API failures cleanly
- avoid leaking API keys in logs/errors

Keep provider-specific code isolated.

------------------------------------------------------------

### 3. Embedding Service

If useful for clean separation, create an application-level service such as:

    generate_embedding(text)

which delegates to the configured provider.

The goal is to allow callers to depend on the application abstraction rather than the provider SDK.

------------------------------------------------------------

### 4. Memory Integration

Integrate embedding generation with the EXISTING memory persistence functionality only where necessary.

The desired capability is:

    content
      ↓
    generate_embedding(content)
      ↓
    save_memory(..., embedding=embedding)

However:

IMPORTANT:

Do NOT redesign save_memory().

Do NOT remove the ability to explicitly pass an embedding.

Do NOT make the repository itself responsible for provider/API calls.

Prefer a separate service/helper that generates the embedding and then uses:

    save_memory()

The existing repository should remain a persistence layer.

------------------------------------------------------------

### 5. Optional Convenience Function

If appropriate, provide a thin application-level function such as:

    save_memory_with_embedding(...)

which:

1. validates memory content
2. generates embedding
3. calls existing save_memory()
4. returns the persisted MemoryChunk

This is optional, not mandatory.

Do not create unnecessary abstraction layers.

============================================================
VALIDATION REQUIREMENTS
============================================================

Embedding generation must validate:

### Input

Reject:

- empty string
- whitespace-only text
- invalid text input

### Output

Validate:

- embedding exists
- embedding is a list/sequence of numeric values
- vector is not empty
- values are finite
- vector dimensionality is consistent for the configured provider/model

Do NOT silently truncate or pad vectors.

Do NOT silently change dimensions.

If dimensionality is invalid, raise a clear application-level error.

============================================================
ERROR HANDLING
============================================================

Create/use appropriate application-level exceptions.

At minimum, distinguish:

- invalid embedding input
- embedding provider configuration error
- embedding provider/API failure
- invalid embedding response

Do not expose:

- API keys
- credentials
- sensitive provider response details

in logs or user-facing errors.

Follow the project's existing exception-handling conventions where possible.

============================================================
TESTING
============================================================

Tests are REQUIRED.

Do NOT rely on live external embedding API calls for the normal test suite.

Mock/stub the provider.

Add unit tests covering at minimum:

1. Valid text generates an embedding.

2. Empty text is rejected.

3. Whitespace-only text is rejected.

4. Provider failure is converted into the appropriate application exception.

5. Invalid provider response is rejected.

6. Empty embedding is rejected.

7. Non-numeric embedding values are rejected.

8. Non-finite values are rejected.

9. Embedding dimensionality validation works.

10. The generated embedding can be passed to the existing save_memory() repository.

11. Existing save_memory() behavior remains backward compatible.

12. Provider abstraction can be replaced/injected in tests.

If integration tests can be safely performed using the existing PostgreSQL instance, add an appropriate integration test verifying:

    text
    ↓
    embedding
    ↓
    memory_chunks.embedding

But DO NOT require an external paid embedding API for integration tests.

A deterministic fake embedding provider is acceptable for integration testing.

============================================================
DATABASE RESTRICTIONS
============================================================

DO NOT:

- modify V001
- rewrite V001
- modify existing learner tables
- redesign memory_chunks
- add HNSW
- add IVFFlat
- add vector similarity queries
- add vector indexes
- add distance operators
- change embedding to vector(N) unless absolutely required and explicitly justified
- create another vector database
- introduce Redis/vector DB/etc.

The existing PostgreSQL + pgvector architecture remains the source of truth.

============================================================
NO SEMANTIC RETRIEVAL YET
============================================================

This step is ONLY about embedding generation.

Do NOT implement:

    cosine similarity search
    nearest-neighbor retrieval
    semantic search
    top-k vector retrieval
    HNSW
    IVFFlat
    pgvector <-> queries
    pgvector <=> queries

Those belong to:

    STEP 5A.3 — pgvector Semantic Retrieval

============================================================
NO AGNO MEMORY YET
============================================================

Do NOT modify Agno memory functionality in this step.

Do NOT:

- configure Agno Agent memory
- add Agent memory stores
- inject retrieved memories into prompts
- create memory tools for agents
- alter orchestration context
- modify Skill Analysis Agent behavior

Agno integration belongs to Step 5A.4.

============================================================
NO ORCHESTRATOR YET
============================================================

Do NOT modify the orchestrator.

Do NOT modify:

- orchestration flow
- agent sequencing
- workflow state
- agent context propagation

That belongs to Step 5A.5.

============================================================
NO SCALA CHANGES
============================================================

Do NOT modify the Scala backend in this step.

Embedding generation is an AI-service responsibility.

============================================================
NO FASTAPI API CHANGES UNLESS ABSOLUTELY NECESSARY
============================================================

Do not create public FastAPI memory endpoints in this step.

There is no need to expose embedding generation as a public API yet.

Keep the implementation internal to the AI service unless the existing architecture absolutely requires otherwise.

============================================================
DEPENDENCY DISCIPLINE
============================================================

Before adding dependencies:

1. Inspect pyproject.toml / existing dependency configuration.
2. Check whether the required provider SDK already exists.
3. Reuse existing libraries where appropriate.
4. Add only the minimum required dependency if one is genuinely necessary.

Do NOT add multiple embedding providers.

Do NOT create an abstraction for several providers unless the project already requires it.

============================================================
MODEL / DIMENSION DOCUMENTATION
============================================================

Document:

- selected provider
- selected model
- embedding dimensionality
- how dimensionality is discovered/validated
- whether the model can be changed through configuration
- what would need to happen before adding a fixed vector index

IMPORTANT:

The database currently uses:

    embedding vector

because embedding dimensionality was intentionally not locked during Step 5A.1.

Do not prematurely introduce an ANN index.

============================================================
EXPECTED DATA FLOW AFTER THIS STEP
============================================================

After successful implementation:

    Application / future agent
             │
             ▼
        Memory content
             │
             ▼
    Embedding Service
             │
             ▼
    Embedding Provider
             │
             ▼
       List[float]
             │
             ▼
        save_memory()
             │
             ▼
      PostgreSQL
             │
             ▼
      memory_chunks
             │
             └── embedding vector

Semantic retrieval is NOT part of this step.

============================================================
FILES / MODULE STRUCTURE
============================================================

Follow the existing repository structure.

Likely locations may include:

    ai-service/app/
        embeddings/
        db/
        core/
        schemas/

But DO NOT blindly create directories if the project already has an appropriate location.

Inspect the existing structure first and place the implementation where it naturally belongs.

Potential logical files:

    embedding provider abstraction
    concrete provider
    embedding service
    embedding exceptions
    tests
    documentation

Use existing naming conventions.

============================================================
BACKWARD COMPATIBILITY
============================================================

Existing functionality MUST continue working.

In particular:

    get_learner_context()

must remain unchanged.

The Skill Analysis Agent must remain unchanged.

Existing memory repository APIs must remain compatible:

    save_memory()

    get_learner_memories()

Do not break existing callers.

============================================================
TEST BASELINE
============================================================

Before changes:

    73 tests passing

After implementation:

- all existing tests must continue passing
- new embedding tests must pass
- report the final test count

Run:

    uv run pytest -v

Also run the relevant focused tests.

============================================================
DOCUMENTATION
============================================================

Create/update documentation for Step 5A.2 explaining:

- provider selected
- model selected
- configuration
- embedding generation flow
- embedding dimensionality
- error handling
- testing strategy
- how memory persistence uses generated embeddings
- what is intentionally NOT implemented yet

Clearly state:

    Step 5A.2 = embedding generation

and that:

    Step 5A.3 = semantic retrieval

    Step 5A.4 = Agno memory integration

    Step 5A.5 = orchestration integration

============================================================
STRICT SCOPE BOUNDARY
============================================================

The following are OUT OF SCOPE:

❌ semantic retrieval
❌ vector similarity search
❌ HNSW
❌ IVFFlat
❌ vector indexes
❌ Agno memory
❌ agent prompt changes
❌ Skill Analysis Agent changes
❌ Learning Path Agent changes
❌ Resource Discovery changes
❌ Assessment changes
❌ Adaptation changes
❌ Orchestrator changes
❌ Scala backend changes
❌ new FastAPI public endpoints
❌ redesign of memory_chunks
❌ replacement of PostgreSQL
❌ replacement of pgvector

If you discover something that appears necessary but falls outside this scope, DO NOT implement it silently.

Report it under:

    Open Decisions / Follow-up

============================================================
FINAL RESPONSE REQUIRED
============================================================

When finished, provide an implementation report containing:

1. Summary
2. Provider selected
3. Model selected
4. Embedding dimensionality
5. Configuration changes
6. Files created
7. Files modified
8. Embedding provider architecture
9. Memory persistence integration
10. Exception/error handling
11. Tests added
12. Full test results
13. Existing functionality verification
14. Explicit confirmation that the following were NOT implemented:
    - semantic retrieval
    - vector indexes
    - Agno memory
    - orchestrator integration
    - Scala changes
15. Open decisions / follow-up items

Do not claim anything was implemented unless it actually exists in the repository.

============================================================
MOST IMPORTANT RULE
============================================================

Implement ONLY Step 5A.2.

Do not jump ahead.

The intended progression is:

    5A.1
      ↓
    persistent memory storage
      ↓
    5A.2
      ↓
    embedding generation
      ↓
    5A.3
      ↓
    semantic vector retrieval
      ↓
    5A.4
      ↓
    Agno memory
      ↓
    5A.5
      ↓
    orchestration / agents

Keep each layer independently testable and replaceable.

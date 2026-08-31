# Step 5A.1 — Persistent Agent Memory Foundation

## Objective

Implement ONLY the foundational persistent memory repository layer for the Python AI service.

This is a restart of the previous memory attempt.

IMPORTANT:
All changes from the previous attempted memory step were REJECTED.
Assume that no memory-related schema, repository, embedding, pgvector, or Agno-memory integration from that attempt exists.

Do NOT recover, recreate, or modify any rejected implementation unless it already exists independently in the repository and is part of the pre-existing architecture.

The purpose of this step is to establish the minimal persistent-memory foundation without integrating it into any agent yet.

## EXISTING ARCHITECTURE — SOURCE OF TRUTH

The project currently uses:

Main backend: Scala

AI service: Python

AI service framework: FastAPI + Agno

LLM provider: Mistral

PostgreSQL as the persistent relational database

pgvector is intended to be used for AI/vector retrieval

Database migrations are the eventual schema source of truth

Local PostgreSQL is currently being used for development

Cloud database/provider has NOT been finalized

Existing implemented work includes:

V001 PostgreSQL relational schema

V001 development seed data

Python PostgreSQL connection infrastructure

DatabaseManager

get_learner_context(external_id)

Real PostgreSQL learner context integration into LearnerSkillAnalysisAgent

Existing Pydantic models

Existing deterministic skill analysis tools

Existing Learning Path Agent and roadmap adapter

DO NOT redesign any of this.

DO NOT modify the Skill Analysis Agent.

DO NOT modify the Learning Path Agent.

DO NOT implement the Orchestrator.

DO NOT implement FastAPI routes.

DO NOT modify Scala.

DO NOT integrate Agno memory yet.

DO NOT generate embeddings yet.

DO NOT implement vector similarity queries yet.

## STEP 1 — INSPECT BEFORE CHANGING ANYTHING

Before writing code:

Inspect the existing migration directory.

Inspect V001__initial_schema.sql.

Inspect existing database connection code.

Inspect existing database repository patterns.

Inspect existing exception patterns.

Inspect existing test conventions.

Inspect pyproject.toml / dependency configuration.

Check whether pgvector is already installed/enabled anywhere.

Check whether any memory-related implementation already exists in the repository.

Do not assume file names or schema details.

Use the existing repository conventions.

## STEP 2 — MEMORY SCOPE

The system needs persistent memory associated with a learner.

The conceptual memory record contains:

unique memory identifier

learner association

textual memory content

extensible metadata

embedding field for future vector retrieval

creation timestamp

update timestamp

The learner association MUST reference the existing learner entity.

Memory must be learner-scoped.

A memory belonging to learner A must never be returned when querying learner B.

## STEP 3 — DATABASE MIGRATION

Create the next migration ONLY if the existing migration structure confirms that this is the correct next migration.

The migration should introduce the persistent memory storage required by the architecture.

Use the project's existing SQL/migration conventions.

The memory table should support:

UUID primary key

foreign key to the existing learners table

text content

JSONB metadata

embedding/vector storage compatible with the project's intended pgvector architecture

created timestamp

updated timestamp

IMPORTANT:

Before deciding the exact vector column declaration, inspect the project's current pgvector setup and dependency state.

If embedding dimensionality/model has NOT already been formally established in the repository, DO NOT arbitrarily hard-code an embedding dimension merely for convenience.

The embedding storage must remain compatible with the architecture's current model-agnostic approach.

Do not introduce an embedding model decision in this step.

Do not introduce a similarity metric/index decision unless it is already established elsewhere in the repository.

## STEP 4 — DATABASE INDEXING

Add only indexes that are justified by the current access pattern.

At minimum, memory retrieval will be learner-scoped, so the implementation must support efficient lookup by learner.

Do NOT create speculative ANN/vector indexes yet.

Vector indexing belongs to the later embedding/retrieval step after the embedding model and dimensionality are finalized.

## STEP 5 — PYTHON MEMORY DOMAIN MODEL

Create a minimal typed model for a persisted memory item only if the existing project architecture uses Pydantic/domain models for repository boundaries.

Preserve existing project naming conventions.

The model should represent:

id

learner_id

content

metadata

embedding, if appropriate for the repository layer

created_at

updated_at

Do not create unnecessary models.

Do not modify existing LearnerProfile, SkillAnalysis, or LearningPathResponse models.

## STEP 6 — MEMORY REPOSITORY

Create a repository module following the existing database repository conventions.

The repository should establish the foundation for:

save_memory(...)
get_similar_memories(...)

BUT:

For THIS STEP, only implement the persistence operation necessary to store a memory record.

Do NOT implement actual vector similarity retrieval yet.

If a placeholder/interface is useful for the future retrieval operation, keep it minimal and clearly mark it as future work rather than pretending vector retrieval is implemented.

The repository MUST:

use the existing DatabaseManager

use parameterized SQL

properly acquire/release database connections

preserve learner isolation

use existing database exception patterns

avoid leaking database credentials in exceptions/logs

avoid dynamic SQL where unnecessary

## STEP 7 — EMBEDDING BEHAVIOR

DO NOT generate embeddings in this step.

A memory may exist without an embedding at this stage.

The following are explicitly OUT OF SCOPE:

Mistral embedding calls

any other embedding provider

embedding generation pipeline

embedding batching

embedding retries

vector similarity calculation

cosine distance

HNSW

IVFFlat

vector search

semantic memory retrieval

Agno memory integration

Those will be separate implementation steps.

## STEP 8 — TESTS

Add focused tests for the newly implemented memory persistence foundation.

Tests should verify:

Memory can be persisted for an existing learner.

Learner foreign-key isolation is respected.

Metadata can be stored as JSON/JSONB.

Missing learner behavior is handled correctly.

Parameterized SQL is used.

Connection resources are properly released.

The migration can be applied successfully against the development PostgreSQL database if the project already supports migration integration tests.

Do NOT rewrite existing tests.

Do NOT modify unrelated tests except where required by a legitimate compatibility issue.

## STEP 9 — SEED DATA

Do NOT modify the existing V001 seed migration.

If memory seed data is actually required for tests, use the project's existing test fixture/seed convention rather than modifying historical schema migrations.

Do not add fake production learner memories unless the existing project convention requires it.

## STEP 10 — STRICT SCOPE BOUNDARY

The following MUST remain untouched:

LearnerSkillAnalysisAgent

Learning Path Agent

Roadmap adapter

Skill gap analysis

prerequisite resolution

Orchestrator

FastAPI routes

Scala backend

AI Assistant

Agno agent memory configuration

embedding generation

vector similarity search

vector indexes

cloud database configuration

This step is ONLY:

PostgreSQL
    ↓
Persistent memory storage foundation
    ↓
Python repository
    ↓
Tests

## STEP 11 — DO NOT OVERENGINEER

Do not redesign the database.

Do not add unrelated tables.

Do not create speculative tables for:

conversations

messages

sessions

resources

assessments

progress

learning paths

milestones

modules

Those will be handled in later steps according to the existing architecture.

## STEP 12 — FINAL REPORT

When finished, report:

Files Created

List every newly created file.

Files Modified

List every modified file.

Database Changes

State exactly what migration/table/index/constraint was added.

Repository API

Show the exact function/class names and signatures created.

Tests

Report exact test counts and results.

Scope Confirmation

Explicitly state:

Memory persistence: IMPLEMENTED / NOT IMPLEMENTED

Embeddings: NOT IMPLEMENTED

pgvector similarity retrieval: NOT IMPLEMENTED

Vector indexes: NOT IMPLEMENTED

Agno memory integration: NOT IMPLEMENTED

Skill Analysis changes: NOT IMPLEMENTED

Learning Path changes: NOT IMPLEMENTED

Orchestrator: NOT IMPLEMENTED

FastAPI: NOT IMPLEMENTED

Scala: NOT MODIFIED

Important

Do not make additional architectural decisions beyond this specification.

If the existing repository contains an inconsistency that prevents this step from being implemented safely, STOP and report the inconsistency instead of silently changing unrelated architecture.

Run the relevant tests before reporting completion.

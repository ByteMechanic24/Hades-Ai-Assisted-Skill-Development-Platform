-- ============================================================
-- HADES AI Personalized Learning Platform
-- V002 - Add Persistent Agent Memory Foundation
-- PostgreSQL + pgvector
--
-- Model-agnostic memory persistence layer with pgvector support.
-- Supports unconstrained vector dimensions for flexible embedding providers.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS memory_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key scoping memory strictly to a learner
    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    -- Raw text content of the memory item
    content TEXT NOT NULL,

    -- Extensible metadata (memory type, source, tags, session context)
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Unconstrained vector column (model-agnostic embedding)
    embedding vector,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for learner-scoped queries (guarantees fast learner isolation)
CREATE INDEX IF NOT EXISTS idx_memory_chunks_learner_id
    ON memory_chunks(learner_id);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trg_memory_chunks_updated_at ON memory_chunks;
CREATE TRIGGER trg_memory_chunks_updated_at
BEFORE UPDATE ON memory_chunks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMIT;

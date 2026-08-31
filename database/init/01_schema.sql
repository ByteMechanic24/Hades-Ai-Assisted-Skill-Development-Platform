-- ============================================================
-- HADES AI Personalized Learning Platform
-- V001 - Initial Relational Schema
-- PostgreSQL + pgvector
--
-- IMPORTANT:
-- Goals are learner-created goal instances.
-- There is NO hardcoded global goals catalog.
--
-- This migration represents the current persistence contract.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================================
-- 1. SKILLS
-- ============================================================

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. LEARNERS
-- ============================================================

CREATE TABLE learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Keeps compatibility with existing mock IDs such as
    -- "learner-1049" without making them the DB primary key.
    external_id TEXT UNIQUE,

    experience_level TEXT NOT NULL
        CHECK (
            experience_level IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),

    available_hours_per_week NUMERIC(5,2) NOT NULL
        CHECK (available_hours_per_week >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. LEARNER CAREER ASPIRATIONS
-- ============================================================
--
-- Examples:
--
-- "Senior Distributed Systems Engineer"
-- "Scala Backend Architect"
--
-- These are learner-provided context, not a predefined
-- career catalog.
-- ============================================================

CREATE TABLE learner_career_aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    aspiration TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_learner_career_aspiration
        UNIQUE (learner_id, aspiration)
);


-- ============================================================
-- 4. LEARNER INTERESTS
-- ============================================================
--
-- Examples:
--
-- "Functional Programming"
-- "Game Psychology"
-- "Event-Driven Architecture"
--
-- Interests describe what the learner is interested in,
-- and are part of the AI's learner context.
-- ============================================================

CREATE TABLE learner_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    interest TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_learner_interest
        UNIQUE (learner_id, interest)
);


-- ============================================================
-- 5. LEARNER LEARNING PREFERENCES
-- ============================================================
--
-- Examples:
--
-- "hands-on"
-- "project-based"
-- "code-walkthroughs"
-- "visual"
--
-- These describe HOW the learner prefers to learn.
-- ============================================================

CREATE TABLE learner_learning_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    preference TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_learner_learning_preference
        UNIQUE (learner_id, preference)
);


-- ============================================================
-- 6. LEARNER GOALS
-- ============================================================
--
-- A goal is NOT a predefined catalog item.
--
-- Example:
--
-- "I want to learn game development psychology"
--
-- becomes one learner_goal row.
--
-- The AI can then derive:
--
-- normalized_goal
-- target_role
-- required skills
--
-- One learner can have multiple goals.
-- ============================================================

CREATE TABLE learner_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    -- Exact goal wording supplied by the learner.
    raw_goal TEXT NOT NULL,

    -- Optional AI-normalized interpretation.
    normalized_goal TEXT,

    -- Optional AI-derived target role.
    target_role TEXT,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'completed',
                'paused',
                'archived'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 7. LEARNER SKILLS
-- ============================================================
--
-- Represents the learner's current known skill state.
-- ============================================================

CREATE TABLE learner_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_id UUID NOT NULL
        REFERENCES learners(id)
        ON DELETE CASCADE,

    skill_id UUID NOT NULL
        REFERENCES skills(id)
        ON DELETE RESTRICT,

    level TEXT NOT NULL
        CHECK (
            level IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),

    years_of_experience NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (years_of_experience >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (learner_id, skill_id)
);


-- ============================================================
-- 8. SKILL PREREQUISITES
-- ============================================================
--
-- Self-referencing many-to-many relationship.
--
-- Example:
--
-- Scala
--   ↓
-- Functional Programming
--   ↓
-- Distributed Systems
--
-- skill_id represents the skill being learned.
-- prerequisite_skill_id represents a prerequisite.
-- ============================================================

CREATE TABLE skill_prerequisites (
    skill_id UUID NOT NULL
        REFERENCES skills(id)
        ON DELETE CASCADE,

    prerequisite_skill_id UUID NOT NULL
        REFERENCES skills(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (
        skill_id,
        prerequisite_skill_id
    ),

    CHECK (skill_id <> prerequisite_skill_id)
);


-- ============================================================
-- 9. GOAL REQUIRED SKILLS
-- ============================================================
--
-- AI-derived requirements for a SPECIFIC learner goal.
--
-- This is intentionally NOT attached to a global Goal catalog.
--
-- Two learners can have similar goals but receive different
-- required skills.
-- ============================================================

CREATE TABLE goal_required_skills (
    learner_goal_id UUID NOT NULL
        REFERENCES learner_goals(id)
        ON DELETE CASCADE,

    skill_id UUID NOT NULL
        REFERENCES skills(id)
        ON DELETE RESTRICT,

    required_level TEXT NOT NULL
        CHECK (
            required_level IN (
                'beginner',
                'intermediate',
                'advanced'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (
        learner_goal_id,
        skill_id
    )
);


-- ============================================================
-- 10. LEARNING PATHS
-- ============================================================

CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learner_goal_id UUID NOT NULL
        REFERENCES learner_goals(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,
    summary TEXT,
    target_role TEXT,

    estimated_total_weeks INTEGER
        CHECK (estimated_total_weeks >= 0),

    estimated_total_hours NUMERIC(7,2)
        CHECK (estimated_total_hours >= 0),

    adaptation_rationale TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 11. MILESTONES
-- ============================================================

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    learning_path_id UUID NOT NULL
        REFERENCES learning_paths(id)
        ON DELETE CASCADE,

    milestone_order INTEGER NOT NULL
        CHECK (milestone_order > 0),

    title TEXT NOT NULL,
    objective TEXT,

    estimated_hours NUMERIC(7,2)
        CHECK (estimated_hours >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (
        learning_path_id,
        milestone_order
    )
);


-- ============================================================
-- 12. MILESTONE PREREQUISITE SKILLS
-- ============================================================

CREATE TABLE milestone_prerequisite_skills (
    milestone_id UUID NOT NULL
        REFERENCES milestones(id)
        ON DELETE CASCADE,

    skill_id UUID NOT NULL
        REFERENCES skills(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (
        milestone_id,
        skill_id
    )
);


-- ============================================================
-- 13. MODULES
-- ============================================================
--
-- Kept as arrays for V001 because the current API contract
-- treats these as module attributes and we do not yet have
-- individual-topic/style query requirements.
-- ============================================================

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    milestone_id UUID NOT NULL
        REFERENCES milestones(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,

    topics TEXT[],

    estimated_hours NUMERIC(7,2)
        CHECK (estimated_hours >= 0),

    learning_styles TEXT[],

    key_deliverable TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Learner context

CREATE INDEX idx_learner_career_aspirations_learner_id
    ON learner_career_aspirations(learner_id);

CREATE INDEX idx_learner_interests_learner_id
    ON learner_interests(learner_id);

CREATE INDEX idx_learner_learning_preferences_learner_id
    ON learner_learning_preferences(learner_id);


-- Goals

CREATE INDEX idx_learner_goals_learner_id
    ON learner_goals(learner_id);

CREATE INDEX idx_learner_goals_active
    ON learner_goals(learner_id)
    WHERE status = 'active';


-- Learner skills

CREATE INDEX idx_learner_skills_learner_id
    ON learner_skills(learner_id);

CREATE INDEX idx_learner_skills_skill_id
    ON learner_skills(skill_id);


-- Skill prerequisites

CREATE INDEX idx_skill_prerequisites_prerequisite
    ON skill_prerequisites(prerequisite_skill_id);


-- Goal required skills

CREATE INDEX idx_goal_required_skills_skill_id
    ON goal_required_skills(skill_id);


-- Learning paths

CREATE INDEX idx_learning_paths_goal_id
    ON learning_paths(learner_goal_id);


-- Milestones

CREATE INDEX idx_milestones_learning_path_id
    ON milestones(learning_path_id);


-- Milestone prerequisites

CREATE INDEX idx_milestone_prereq_skill_id
    ON milestone_prerequisite_skills(skill_id);


-- Modules

CREATE INDEX idx_modules_milestone_id
    ON modules(milestone_id);


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_skills_updated_at
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_learners_updated_at
BEFORE UPDATE ON learners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_learner_goals_updated_at
BEFORE UPDATE ON learner_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_learner_skills_updated_at
BEFORE UPDATE ON learner_skills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_learning_paths_updated_at
BEFORE UPDATE ON learning_paths
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_milestones_updated_at
BEFORE UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trg_modules_updated_at
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


COMMIT;
# Step 4A.4 — Integrate Real PostgreSQL Learner Context into the Skill Analysis Agent

## CONTEXT

We have completed Step 4A.2.

The Python AI service now has a working PostgreSQL repository:

    app/db/learner_context.py

with:

    get_learner_context(external_id: str) -> LearnerProfile

It has been tested against the existing PostgreSQL schema and seed data.

Current result:

    59/59 tests passing

The repository successfully reads:

- learners
- learner_goals
- learner_career_aspirations
- learner_interests
- learner_learning_preferences
- learner_skills
- skills

and maps the database representation into the existing Pydantic:

    LearnerProfile

and:

    SkillItem

The existing Learner / Skill Analysis Agent from Step 3A is still mock-driven.

It currently imports:

    from app.tools.mock_tools import (
        get_learner_profile,
        get_learner_skills,
        get_goal_requirements,
        get_skill_prerequisites,
    )

and internally performs:

    profile = get_learner_profile(learner_id)

This must now be changed so that learner context comes from PostgreSQL.

---

# OBJECTIVE

Integrate the existing:

    get_learner_context(external_id)

repository into the existing:

    LearnerSkillAnalysisAgent

without redesigning the agent architecture.

The goal is:

    external_id
        ↓
    PostgreSQL
        ↓
    get_learner_context()
        ↓
    LearnerProfile
        ↓
    LearnerSkillAnalysisAgent
        ↓
    existing deterministic gap analysis
        ↓
    existing prerequisite analysis
        ↓
    SkillAnalysis

---

# IMPORTANT ARCHITECTURAL RULES

Do NOT:

- redesign the Skill Analysis Agent
- create a new agent
- create an orchestrator
- create FastAPI routes
- modify the Scala backend
- implement memory
- implement embeddings
- implement pgvector queries
- implement Learning Path persistence
- modify the database schema
- create new database tables
- replace PostgreSQL
- replace Agno
- replace Mistral
- remove the existing deterministic analysis tools
- rewrite the Step 3A Pydantic contracts
- modify the Step 3B Learning Path Agent

This step is ONLY about replacing the learner data source with the real PostgreSQL repository.

---

# REQUIRED CHANGE

Modify:

    app/agents/skill_analysis_agent.py

(or the actual existing Step 3A agent file if the repository uses a different filename).

Replace the learner-context retrieval:

    get_learner_profile(learner_id)

with:

    get_learner_context(learner_id)

from:

    app.db.learner_context

The resulting flow should be:

    profile: LearnerProfile = get_learner_context(learner_id)

The returned LearnerProfile must then continue through the EXISTING Step 3A workflow unchanged.

---

# EXISTING ANALYSIS WORKFLOW TO PRESERVE

After obtaining the real LearnerProfile, retain the existing sequence:

1. Fetch/resolve goal requirements.

2. Calculate deterministic skill gaps using:

    calculate_skill_gaps()

3. Resolve prerequisite chains using:

    resolve_prerequisite_chain()

4. Generate the existing analysis summary.

5. Return the existing:

    SkillAnalysis

Do not change the established SkillAnalysis schema.

---

# IMPORTANT DISTINCTION

The learner's profile data must now come from PostgreSQL.

However, do NOT blindly replace every existing Step 3A tool with database access.

At this step, only the learner-context retrieval must be migrated.

If:

    get_goal_requirements()
    get_skill_prerequisites()
    calculate_skill_gaps()
    resolve_prerequisite_chain()

are still backed by the existing mock/reference implementations, leave them as they are unless a change is absolutely required for compatibility.

The purpose of this step is specifically:

    REAL LEARNER DATA → EXISTING SKILL ANALYSIS PIPELINE

not:

    migrate every tool to PostgreSQL

That will be handled in later database integration work.

---

# AGNO REQUIREMENT

Preserve the existing Agno Agent configuration.

Do not remove the Agno Agent.

Do not create a second Agno Agent.

Do not redesign the tool list.

If the existing Agent tool registration contains learner retrieval tools that are now obsolete, assess them carefully.

The class-level execution path must use:

    get_learner_context()

for the actual learner profile retrieval.

Do not introduce unnecessary duplicate DB queries.

---

# ERROR HANDLING

Preserve the existing database exception behavior.

If:

    get_learner_context()

raises:

    LearnerNotFoundError

allow that error to propagate appropriately rather than silently falling back to mock learner data.

There must be NO automatic fallback from real PostgreSQL learner data to mock learner data.

A missing real learner should be treated as a real data error.

---

# TESTING

Update/add tests for the real DB integration.

At minimum verify:

## Test 1 — Real learner context is used

Given a seeded learner such as:

    learner-1049

the Skill Analysis Agent obtains its LearnerProfile from PostgreSQL.

Verify that the resulting SkillAnalysis contains the learner information coming from the database.

---

## Test 2 — No mock learner fallback

Mock:

    get_learner_context()

to return a known LearnerProfile.

Verify the Skill Analysis Agent uses that profile rather than:

    get_learner_profile()

from mock_tools.

---

## Test 3 — Learner not found

Given an unknown external_id:

    nonexistent-learner

verify that:

    LearnerNotFoundError

is raised.

There must be no fallback to mock data.

---

## Test 4 — Existing deterministic gap analysis remains correct

Verify that the same:

    calculate_skill_gaps()

and:

    resolve_prerequisite_chain()

logic continues to produce the expected SkillAnalysis structure.

---

## Test 5 — Existing tests remain passing

Run the complete test suite:

    uv run pytest -v

Report the final result.

---

# BACKWARD COMPATIBILITY

Do not break the existing Step 3A tests unnecessarily.

If existing tests assume mock learner retrieval, update only the tests that are specifically testing the learner source.

Do not weaken assertions simply to make tests pass.

The intended architecture is now:

    PostgreSQL
         │
         ▼
    get_learner_context()
         │
         ▼
    LearnerProfile
         │
         ▼
    Skill Analysis Agent
         │
         ├── get_goal_requirements()
         ├── calculate_skill_gaps()
         ├── get_skill_prerequisites()
         └── resolve_prerequisite_chain()
         │
         ▼
    SkillAnalysis

---

# DOCUMENTATION

Update or create the appropriate documentation describing that:

- Step 4A.2 implemented the PostgreSQL learner-context repository.
- Step 4A.4 connects that repository to the Skill Analysis Agent.
- learner profile data is no longer obtained from mock learner data during the real execution path.
- goal/prerequisite/reference tools may remain mock-backed at this stage.
- memory, embeddings, pgvector, orchestrator, FastAPI, Scala integration, and later agents remain out of scope.

Clearly distinguish:

IMPLEMENTED

from:

STILL MOCKED

from:

PLANNED.

---

# DO NOT OVER-IMPLEMENT

Stop after completing this integration and tests.

Do NOT proceed automatically to:

- persistent memory
- memory_chunks
- embeddings
- pgvector similarity search
- Agno persistent memory
- Learning Path DB persistence
- Resource Discovery
- Assessment
- Adaptation
- Orchestrator
- AI Assistant
- FastAPI
- Scala integration

Those are later steps.

---

# FINAL REPORT

When finished, provide:

1. Files modified
2. Files created
3. Exact changes made
4. How PostgreSQL learner context now reaches Skill Analysis
5. Which tools remain mock-backed
6. Test results
7. Any compatibility issues
8. Any open decisions discovered

Do not implement the next step automatically.
Stop after Step 4A.4.

STEP 4A.2 — Implement get_learner_context(external_id)

ROLE

You are working as the backend/AI-service engineer for the HCL personalized learning platform.

Step 4A.1 is complete: the Python AI service now has a PostgreSQL connection layer.

Your task is ONLY to complete Step 4A.2:

Implement a repository/context function that retrieves the existing learner context from the existing PostgreSQL database using external_id.

Do NOT connect this context to the Skill Analysis Agent yet.
Do NOT implement memory or embeddings.
Do NOT implement pgvector retrieval.
Do NOT implement FastAPI endpoints.
Do NOT implement the orchestrator.
Do NOT modify the Scala backend.
Do NOT change the existing database schema or migrations.

Stop after the learner-context repository/database layer is implemented and tested.

1. CURRENT ARCHITECTURE — SOURCE OF TRUTH

The project currently consists of:

Main backend: Scala

AI service: Python

API framework: FastAPI

Agent framework: Agno

LLMs: Mistral model family

Database: PostgreSQL 16

Vector extension: pgvector

Local PostgreSQL is running through Docker

The database schema/migrations already exist

Step 4A.1 PostgreSQL connection infrastructure is already implemented

The existing AI-service work includes:

Step 1 mock contracts

Step 2 deterministic tool layer

Step 3A Skill Analysis Agent

Step 3B Learning Path Recommendation Agent

roadmap.sh hybrid adapter

existing Pydantic/application models

tests

Do not redesign any of these.

2. IMPORTANT: EXISTING DATABASE IS THE SOURCE OF TRUTH

Before writing code:

Inspect the repository.

Inspect the existing database handoff/documentation.

Inspect the existing migration files.

Inspect the actual existing table definitions.

Inspect the existing seed/reference data if present.

Inspect the existing Python Pydantic models.

Inspect the Step 4A.1 database connection implementation.

Inspect any existing SQL/query documentation from the database work.

You MUST derive the learner-context query from the existing schema.

DO NOT invent a new schema.

DO NOT rename tables.

DO NOT add tables.

DO NOT add columns.

DO NOT change migrations.

DO NOT silently "fix" inconsistencies between the database and Python models.

If something does not line up, report it.

3. OBJECTIVE

Implement:

get_learner_context(external_id: str)

The function should retrieve the learner's current database-backed context needed by the AI service.

Conceptually:

external_id
    │
    ▼
Repository / Context Layer
    │
    ├── learner/profile
    ├── learner goal
    ├── current skills
    ├── career aspirations
    ├── interests
    ├── learning preferences
    ├── experience level
    └── other fields already defined by the existing schema
    │
    ▼
Learner Context

Use only information that is actually represented by the existing database schema.

4. EXISTING APPLICATION MODEL

The Step 2/Step 3 application layer already has learner-related Pydantic structures.

In particular, inspect the existing LearnerProfile model and preserve its established field names.

The previously established learner profile contains:

learner_id
target_goal
career_aspirations
current_skills
interests
available_hours_per_week
learning_preferences
experience_level

Do NOT change these names merely to make them match database column names.

Database representation and application representation are allowed to differ; the repository/context layer should perform the mapping.

If the existing repository contains additional established context models, inspect and reuse them rather than creating duplicates.

5. EXTERNAL ID

The function signature must use:

get_learner_context(external_id: str)

external_id is the external learner identifier used to locate the learner in the database.

Do NOT assume that external_id is the same as an internal numeric/database primary key.

Inspect the actual schema and existing seed data.

The repository should use the appropriate existing column/relationship to resolve the learner.

6. DATA RETRIEVAL

Retrieve the learner context from PostgreSQL using the existing database connection layer created in Step 4A.1.

The repository must:

use parameterized SQL

never interpolate external_id directly into SQL

use the existing connection/pool abstraction

release connections correctly

avoid connection leaks

keep SQL/database logic inside the repository/context layer

Do NOT put SQL queries inside:

agents/
tools/
FastAPI routes

7. WHAT TO RETURN

Return one coherent learner-context object/structure.

It should contain the existing learner information needed by the AI service.

At minimum, where represented by the database:

learner identity
goal
career aspirations
current skills
interests
available learning hours
learning preferences
experience level

If the database schema already contains additional learner-context information that is explicitly part of the established handoff, include it only if it belongs to the existing context contract.

Do NOT invent new fields.

8. GOAL AND SKILL RELATIONSHIPS

The learner's goal and skills may be represented across multiple relational tables.

Inspect the existing relationships and joins.

The repository should assemble the context into the application-level representation expected by the AI service.

For example, conceptually:

learner
   │
   ├── goal
   │
   ├── learner skills
   │       └── skill
   │
   ├── preferences
   │
   └── profile information

But DO NOT assume those exact table names or relationships.

Use the actual existing schema.

Do not invent relationships that are not present.

9. SKILLS

The context must preserve the established skill representation.

The existing application model uses skill information such as:

skill_name
level
years_of_experience

If the database stores these values across multiple tables, join/map them into the existing SkillItem representation.

Do not modify SkillItem unless the existing schema makes the current representation impossible.

If a mismatch exists, report it instead of silently redesigning the model.

10. GOAL

The learner's goal should be retrieved from the existing database relationship.

Preserve the established application-level representation:

target_goal

Do not replace it with a newly invented goal structure.

If the database contains a goal ID and a separate goal definition table, resolve it using the existing relationship.

Again: inspect first; do not assume.

11. ERROR HANDLING

Implement clear repository-level errors.

At minimum:

learner not found
database failure

If the existing project already has an appropriate exception hierarchy, reuse it.

Do not duplicate exceptions unnecessarily.

For an unknown external_id, return/raise the project's established "not found" style rather than returning a fake/default learner.

Do NOT silently create a learner.

12. NULL / OPTIONAL DATA

Respect the actual nullability of the existing database.

Do not manufacture fake values such as:

"Unknown"
[]
0
"beginner"

unless the existing application contract explicitly requires a default.

If an existing database field is nullable and the application model is not nullable, identify the mismatch and report it.

Do not silently change the schema or invent semantics.

13. REPOSITORY DESIGN

Keep responsibilities separated:

Database connection
        ↓
Repository / context query
        ↓
Application/domain model
        ↓
Agent

This step implements only the middle part.

The Skill Analysis Agent must NOT directly execute SQL.

The repository should own:

SQL

joins

row mapping

database exceptions

learner-not-found handling

The agent should eventually receive a clean application-level object.

That agent integration is a later step.

14. DO NOT IMPLEMENT AGENT INTEGRATION YET

This is extremely important.

Even though the eventual flow is:

PostgreSQL
   ↓
get_learner_context()
   ↓
Skill Analysis Agent

for THIS step stop at:

PostgreSQL
   ↓
get_learner_context()

Do NOT modify the Skill Analysis Agent.

Do NOT change its execution flow.

Do NOT replace its current mock inputs.

Do NOT introduce DB calls into the agent.

That will be Step 4A.4.

15. TESTING

Create repository/context tests against the actual local PostgreSQL database.

The tests should verify at minimum:

Valid learner

known external_id
        ↓
context returned

Verify important fields.

Unknown learner

unknown external_id
        ↓
appropriate not-found error

Empty/invalid external_id

Verify behavior consistent with existing project conventions.

Relationship mapping

Verify that:

learner goal is mapped correctly

skills are mapped correctly

multiple skills are preserved

application field names are correct

Resource handling

Ensure database connections are released correctly.

16. UNIT VS INTEGRATION TESTS

Do not make the entire existing test suite dependent on PostgreSQL.

Maintain the existing distinction:

Unit tests
    ↓
deterministic / no live DB required

Database integration tests
    ↓
explicitly connect to PostgreSQL

If the existing test setup already uses a marker for database integration tests, reuse it.

Do not invent a competing test convention.

17. PERFORMANCE

Do not prematurely optimize.

However:

avoid N+1 queries where reasonably possible

prefer an appropriate single query or small number of queries

use parameterized SQL

reuse the existing connection pool

Do not introduce caching yet.

Do not introduce Redis.

Do not introduce vector search.

Do not introduce additional infrastructure.

18. SECURITY

Never:

hardcode credentials

log database passwords

interpolate user input into SQL

expose raw database exceptions unnecessarily

Use parameterized SQL.

If an exception contains connection details, sanitize it before surfacing it.

19. PRESERVE EXISTING FUNCTIONALITY

After implementation, the following must continue working:

Step 1 mock contracts
Step 2 deterministic tools
Step 3A Skill Analysis Agent
Step 3B Learning Path Recommendation Agent
roadmap.sh adapter
Step 4A.1 PostgreSQL connection
existing test suite

Do not rewrite existing components unnecessarily.

20. DOCUMENTATION

Add/update concise documentation for this step explaining:

What get_learner_context(external_id) does.

Which existing database tables/relationships it reads.

How database rows are mapped into the application-level context.

How learner-not-found is handled.

How the integration test is run.

That the Skill Analysis Agent is NOT yet connected to this repository.

That embeddings/memory are NOT part of this step.

Do not document functionality that does not exist.

21. VALIDATION

Run:

pytest -v

and the appropriate database integration tests.

Confirm:

existing tests pass
database context tests pass
known learner resolves
unknown learner fails correctly
no schema/migration changes occurred

22. REQUIRED FINAL REPORT

When finished, provide:

Files Created

Every new file.

Files Modified

Every modified file and why.

Database Tables Queried

List the actual existing tables used.

SQL / Query Strategy

Briefly explain how the learner context is assembled.

Mapping

Show:

database representation
        ↓
application/Pydantic representation

Tests

Give exact commands and results.

Example:

XX passed

Scope Confirmation

Explicitly confirm:

get_learner_context() IMPLEMENTED
Skill Analysis Agent integration NOT implemented
Learning Path DB integration NOT implemented
Memory NOT implemented
Embeddings NOT implemented
pgvector queries NOT implemented
FastAPI DB endpoints NOT implemented
Orchestrator NOT implemented
Scala backend NOT modified
Database schema/migrations NOT modified

Problems / Open Decisions

If anything in the existing schema, handoff, or application models conflicts with this task:

DO NOT silently resolve it.

Report it clearly.

23. MOST IMPORTANT RULE

Implement ONLY Step 4A.2.

Do not anticipate Step 4A.3 or Step 4A.4.

The intended progression is:

Step 4A.1
PostgreSQL connection
        ↓
Step 4A.2
get_learner_context(external_id)
        ↓
Step 4A.3
Map DB context → existing application/Pydantic models
        ↓
Step 4A.4
Connect real DB context → Skill Analysis Agent

For THIS task, stop after Step 4A.2.

If the existing database handoff does not provide enough information to implement something safely, inspect the repository and report the gap rather than inventing a design.

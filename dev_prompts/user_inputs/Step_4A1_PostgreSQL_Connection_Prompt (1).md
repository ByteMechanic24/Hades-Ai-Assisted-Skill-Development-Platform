# STEP 4A.1 — Connect the Python AI Service to the Existing PostgreSQL Database

## ROLE

You are working as the backend/AI-service engineer for the HCL personalized learning platform.

Your task is ONLY to complete Step 4A.1:

> Establish a clean, production-style PostgreSQL connection layer inside the existing Python AI service.

Do NOT implement the learner context repository yet.
Do NOT connect the database to any agent yet.
Do NOT implement memory.
Do NOT implement FastAPI endpoints.
Do NOT implement the orchestrator.
Do NOT modify the Scala backend.

This is strictly the database connection foundation.

---

# 1. CURRENT ARCHITECTURE — DO NOT CHANGE

The project currently consists of:

- Main backend: Scala
- AI service: Python
- AI framework: Agno
- AI service API framework: FastAPI
- Database: PostgreSQL 16
- Vector extension: pgvector
- Local development database: Docker PostgreSQL
- Database migrations already exist
- Database schema and seed/reference data already exist

The Python AI service currently contains:

- Pydantic/application schemas
- deterministic tools
- skill-analysis tools
- roadmap.sh adapter
- Learning Path Recommendation Agent
- Skill Analysis Agent
- tests
- mock data

The AI-service database connection is NOT yet implemented.

---

# 2. SOURCE OF TRUTH

Before modifying anything:

1. Inspect the existing repository.
2. Inspect the existing database-related documentation/handoff.
3. Inspect existing configuration files.
4. Inspect the existing Docker/database configuration if present.
5. Inspect the existing migration/schema files only to understand the already-existing database.
6. Inspect existing Python project dependencies.

DO NOT create a new schema.

DO NOT rename existing database tables.

DO NOT modify existing migrations.

DO NOT redesign the database.

The database schema already exists and is owned by the current database work.

---

# 3. EXISTING DATABASE

The local development database is PostgreSQL 16 running through Docker.

Existing database characteristics:

- PostgreSQL 16
- pgvector enabled
- database name: `hcl_learning`
- Docker container: `hcl-postgres`

The database already contains the learner/reference data required by the current test setup.

Do NOT recreate or reseed the database as part of this step.

Do NOT hardcode credentials into source code.

---

# 4. OBJECTIVE

Create the minimum clean infrastructure required for the Python AI service to connect to PostgreSQL.

The result should allow later steps to do:

```text
AI Service
    ↓
Repository Layer
    ↓
PostgreSQL
```

without agents themselves knowing about connection details.

The connection layer should therefore be isolated from:

- agents
- tools
- business logic
- FastAPI routes
- orchestration

---

# 5. IMPLEMENTATION REQUIREMENTS

## 5.1 Configuration

Create or extend the existing AI-service configuration mechanism so database configuration is environment-driven.

At minimum support:

```text
DATABASE_URL
```

Do NOT hardcode:

- passwords
- usernames
- hostnames
- ports
- connection URLs

into Python source files.

If the project already has a configuration/settings module, extend it rather than creating a competing configuration system.

Use the project's existing configuration conventions where possible.

---

# 6. PostgreSQL Driver

Inspect the existing Python dependency setup.

If an appropriate PostgreSQL driver already exists, reuse it.

Otherwise add the minimum appropriate dependency required for the connection layer.

Prefer an implementation that works cleanly with the existing Python/FastAPI/Agno architecture and supports connection pooling where appropriate.

Do NOT add unnecessary database frameworks.

Do NOT introduce SQLAlchemy, SQLModel, or another ORM merely because it is commonly used.

If you believe an ORM is necessary, STOP and report the reason instead of introducing it silently.

The goal of this step is connection infrastructure, not ORM design.

---

# 7. CONNECTION ABSTRACTION

Create a small, isolated database connection module.

The rest of the AI service should eventually be able to obtain a database connection/session through this abstraction.

The connection module must:

- read configuration from environment
- establish PostgreSQL connectivity
- handle connection failures cleanly
- avoid leaking credentials in errors/logs
- support clean resource handling
- be testable

Do not put database connection logic inside:

```text
agents/
tools/
FastAPI routes
```

---

# 8. CONNECTION POOLING

Use a reasonable PostgreSQL connection-pooling mechanism if supported by the selected driver.

Keep pool configuration minimal.

Do NOT prematurely tune:

- maximum pool size
- timeout values
- retry strategies
- production infrastructure

unless those settings already exist in the project.

If defaults are used, document them.

---

# 9. HEALTH / CONNECTIVITY TEST

Create a small deterministic database connectivity test.

The test should verify:

```text
Python AI service
        ↓
PostgreSQL
        ↓
SELECT 1
```

The test must confirm that:

1. configuration is loaded
2. a connection can be established
3. PostgreSQL responds
4. the connection is released/closed correctly

Do NOT query learner data yet.

Do NOT implement `get_learner_context()` yet.

---

# 10. TESTING STRATEGY

Do not make the entire existing test suite dependent on a running PostgreSQL database unless that is already the project's established testing strategy.

Existing deterministic unit tests should remain runnable without requiring PostgreSQL.

For database connectivity tests, choose a clean approach such as:

- an explicitly marked integration test
- a dedicated DB test configuration
- another repository-consistent approach

The important requirement is:

```text
Unit tests
    → remain deterministic

Database integration tests
    → explicitly test PostgreSQL
```

Do not silently turn all existing tests into database integration tests.

---

# 11. ENVIRONMENT / SECRETS

If an `.env` mechanism already exists, integrate with it.

If an example environment file is appropriate, create/update:

```text
.env.example
```

with placeholders only.

Example conceptually:

```text
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
```

Do NOT place real credentials in:

- `.env.example`
- Git
- source code
- documentation
- tests
- commits

If a real `.env` file is created locally, ensure it is ignored by Git.

Inspect `.gitignore` and update it only if necessary.

---

# 12. DO NOT BUILD ANYTHING ELSE

This is extremely important.

For Step 4A.1, DO NOT implement:

- `get_learner_context()`
- learner repository
- skill repository
- goal repository
- memory repository
- `memory_chunks`
- embeddings
- pgvector queries
- `save_memory()`
- `get_similar_memories()`
- agent database access
- Skill Analysis DB integration
- Learning Path DB persistence
- Resource Discovery
- Assessment
- Adaptation
- Orchestrator
- FastAPI database endpoints
- Scala integration
- authentication
- authorization
- database migrations
- database schema changes

Those belong to later steps.

---

# 13. PRESERVE EXISTING FUNCTIONALITY

The following must continue working unchanged:

- Step 1 mock contracts
- Step 2 deterministic tools
- Step 3A Skill Analysis Agent
- Step 3B Learning Path Recommendation Agent
- roadmap.sh hybrid adapter
- existing tests

Do not rewrite existing agents simply to introduce the connection layer.

---

# 14. CODE QUALITY REQUIREMENTS

Follow normal software engineering practices:

- clear module boundaries
- type hints
- small focused functions/classes
- meaningful names
- no duplicated configuration
- no global hidden state unless required by the selected DB driver
- no hardcoded credentials
- no raw credentials in logs
- useful error messages
- clean resource management
- minimal dependencies
- testable code

Do not over-engineer this step.

---

# 15. DOCUMENTATION

Add/update a concise AI-service database documentation file explaining:

1. How the AI service obtains PostgreSQL configuration.
2. How the connection layer works.
3. How developers run the local database.
4. How to configure `DATABASE_URL`.
5. How the database connectivity test is executed.
6. That repositories and agents are NOT yet connected to the database.
7. That `get_learner_context()` is intentionally deferred to Step 4A.2.

Do not document nonexistent functionality.

---

# 16. VALIDATION

Before declaring the step complete, run:

### Existing unit tests

```bash
pytest -v
```

or the project's established equivalent.

### Database connectivity test

Run the newly created database integration/connectivity test.

Verify:

```text
PostgreSQL reachable
SELECT 1 succeeds
connection resources released
```

---

# 17. REQUIRED FINAL REPORT

When finished, provide a concise implementation report containing:

## Files Created

List every new file.

## Files Modified

List every modified file and why.

## Dependencies

List any dependency added/changed and why.

## Configuration

Explain the environment variable(s) introduced.

## Database Connection

Explain exactly how the Python AI service now connects to PostgreSQL.

## Tests

Provide the exact test command(s) and results.

Example:

```text
XX passed
```

## Scope Confirmation

Explicitly confirm:

```text
get_learner_context() NOT implemented
Agent DB integration NOT implemented
Memory NOT implemented
FastAPI DB endpoints NOT implemented
Database schema/migrations NOT modified
Scala backend NOT modified
```

## Problems / Decisions

If anything in the existing repository conflicts with this specification:

DO NOT silently fix it.

Report it clearly under:

```text
Problems / Open Decisions
```

---

# 18. MOST IMPORTANT RULE

Implement ONLY Step 4A.1.

Do not anticipate later steps by implementing them now.

The desired final architecture is:

```text
                 PostgreSQL
                     ▲
                     │
              connection layer
                     ▲
                     │
              repository layer
                     ▲
                     │
                 AI service
                     ▲
                     │
                   agents
```

For THIS step, we are implementing ONLY:

```text
PostgreSQL
    ▲
    │
connection layer
```

Stop after that and report the work.

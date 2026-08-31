# Step 2: Build the Initial Tool Layer Prompt

**Author:** User  
**Task:** Step 2 — Initial Tools Layer

---

HCLTech Hackathon — Step 2: Build the Initial Tool Layer

You are continuing development of the HCLTech Hackathon AI-Powered Personalized Learning Path Recommender.

Before making any changes:

Read project_overview.md.

Read the mock contract documentation created in Step 1.

Inspect the current repository structure.

Inspect the existing changes from Step 1.

The Step 1 mock-contract work is complete.

CURRENT DEVELOPMENT POSITION

Step 1 → Mock contracts [COMPLETE]
Step 2 → Initial tools [CURRENT]
Step 3 → Learning Path Agent
Step 4 → Orchestrator
Step 5 → FastAPI integration

This task is ONLY Step 2. Do not implement later steps.

OBJECTIVE

Build the initial tool layer required by the first learning-path-generation flow.

The tools provide mocked learner, skill, goal, and prerequisite information that a future Learning Path Agent can consume.

The mocked implementations must be replaceable later without requiring the future agent to be rewritten.

TOOLS TO IMPLEMENT

Implement the minimum necessary versions of:

1. get_learner_profile

Return the learner information required by the current mock learning-path flow.

Use the Step 1 mock contract. Do not invent unrelated learner fields.

2. get_learner_skills

Return the learner's current skills and relevant proficiency information required by the mock flow.

Use the Step 1 contract where applicable.

3. get_goal_requirements

Given a learning/career goal, return the skills or requirements associated with that goal.

Use deterministic mock data. Do not use an LLM.

4. get_skill_prerequisites

Given a skill, return its prerequisite skills according to the mock prerequisite data.

Use deterministic mock data. Do not use an LLM.

MOCK DATA

For this stage, use isolated in-memory/static mock data.

Do NOT connect to:

PostgreSQL

pgvector

Redis

Scala

external APIs

web scraping

Mistral

Agno

Do not add production infrastructure.

TOOL RESPONSIBILITY

Tools must only perform clearly defined retrieval/data operations.

They must NOT:

generate a learning path

decide what the learner should study

perform LLM reasoning

call another agent

invoke the orchestrator

rank a learning path

adapt a roadmap

make autonomous decisions

The future agent owns reasoning.

DETERMINISTIC FIRST

Do not use an LLM for:

mock learner retrieval

skill retrieval

goal requirements

prerequisites

simple filtering

simple validation

TYPE SAFETY

Use Python type hints.

Use explicit structured models where appropriate.

Avoid arbitrary untyped dictionaries when stable structures exist.

Keep inputs and outputs clear enough for the future Agno agent.

REPLACEABILITY

The future agent should be able to call:

get_learner_profile(...)

get_learner_skills(...)

get_goal_requirements(...)

get_skill_prerequisites(...)

without knowing whether the implementation uses mock data, Scala, PostgreSQL, or another service.

Keep the interface independent of the current data source.

AGNO

Do NOT build the agent yet.

Do not unnecessarily couple the tool implementations to Agno.

Keep them as normal, testable Python capabilities that can later be exposed to an Agno agent.

MODEL USAGE

Do NOT call Mistral Small, Mistral Large, or Codestral in this step.

Model routing belongs to the agent layer.

ERROR HANDLING

Handle invalid inputs cleanly.

Examples:

unknown learner ID

unknown goal

unknown skill

Do not silently return unrelated data.

Use clear exceptions or structured failure behavior consistent with the repository.

TESTING

Add unit tests for every tool.

At minimum test:

Learner profile

valid learner

unknown learner

Learner skills

valid learner

unknown learner

Goal requirements

known goal

unknown goal

Skill prerequisites

known skill

unknown skill

a skill with no prerequisites, if represented in the mock data

Tests must be deterministic and must not call external services or real LLMs.

DOCUMENTATION

Briefly document the tool layer:

what each tool does

inputs

outputs

that the implementation is mocked

that the implementation is replaceable

that the tools will be consumed by the Learning Path Agent in Step 3

Do not describe mock integrations as production integrations.

SOFTWARE ENGINEERING REQUIREMENTS

Follow professional software-development practices:

clear naming

single responsibility

type hints

small focused functions

no duplicated logic

no unnecessary abstraction

no global mutable state

deterministic tests

no secrets

no unnecessary dependencies

no unrelated refactoring

no speculative features

REPOSITORY DISCIPLINE

Before modifying anything:

Inspect the repository.

Understand the Step 1 contract files.

Follow existing project conventions.

Only make changes required for Step 2.

Do NOT modify:

frontend code

Scala code

Step 1 contract definitions unless a genuine inconsistency is discovered

agent code

orchestrator code

FastAPI routes

database configuration

If the Step 1 contract is inconsistent with the required tool structures, STOP and report the inconsistency instead of silently changing the contract.

DEFINITION OF DONE

Step 2 is complete when:

The four initial tool capabilities exist.

They use deterministic mocked data.

Their interfaces are clean and replaceable.

Their inputs and outputs are typed/structured.

Invalid inputs are handled.

Unit tests cover the tools.

No LLM is called.

No agent is created.

No orchestrator is created.

No FastAPI endpoint is created.

No production database/service integration is created.

Existing Step 1 contract work remains unchanged.

Tests pass.

FINAL REPORT

After implementation, report:

Files created/changed.

Tools implemented.

Tool inputs and outputs.

Mock data used.

Tests executed and results.

Assumptions made.

Issues that must be resolved before Step 3.

Do not proceed to Step 3 automatically.

STOP after completing the tool layer.

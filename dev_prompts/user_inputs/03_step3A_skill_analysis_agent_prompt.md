# Step 3A: Build the Learner / Skill Analysis Agent Prompt

**Author:** User  
**Task:** Step 3A — Learner / Skill Analysis Agent

---

HCLTech Hackathon — Step 3A: Build the Learner / Skill Analysis Agent

IMPORTANT — READ THIS FIRST

You are continuing the HCLTech Hackathon AI-Powered Personalized Learning Path Recommender.

Before changing anything:

Read project_overview.md.

Read the Step 1 mock contract documentation.

Inspect the current repository.

Inspect all work completed in Step 2.

Understand the existing schemas, mock tools, exceptions, tests, and conventions before writing code.

This is Step 3A only.

Do not implement the Learning Path Recommendation Agent yet.
Do not implement the Orchestrator.
Do not implement FastAPI endpoints.
Do not implement database integrations.
Do not implement production Scala integration.
Do not implement resource discovery/ranking.
Do not build the roadmap.sh integration in this step.

CURRENT PROJECT POSITION

The development sequence is currently:

Step 1 → Mock contracts                         [COMPLETE]
Step 2 → Mock/data retrieval tools              [COMPLETE]
Step 3A → Learner / Skill Analysis Agent        [CURRENT]
Step 3B → Learning Path Recommendation Agent
Step 4 → Orchestrator
Step 5 → API / Scala integration

The Step 2 implementation created deterministic mocked data-access tools such as:

get_learner_profile

get_learner_skills

get_goal_requirements

get_skill_prerequisites

These are the foundation for this agent.

ARCHITECTURAL DECISION — SOURCE OF TRUTH

The Learner / Skill Analysis Agent exists to answer:

Where is this learner now, what does their target goal require, and what meaningful skill gaps/prerequisite gaps exist?

It is NOT responsible for generating the final learning path.

The future Learning Path Recommendation Agent will consume this analysis.

The current mock contract requires a skill_gap_analysis in the eventual LearningPathResponse. It also requires learner information, current skills, target goal, available weekly hours, learning preferences, and experience level. Preserve the contract rather than inventing new contract fields.

The current mock contract is temporary and explicitly intended to unblock parallel Scala backend ↔ Python AI-service development. Do not modify it as part of this task.

RESPONSIBILITY OF THIS AGENT

The Learner / Skill Analysis Agent should:

Understand the learner's current state.

Understand the target goal.

Retrieve the target goal's required skills.

Compare current skills against required skills.

Identify missing or insufficient skills.

Inspect prerequisites for relevant missing skills.

Identify prerequisite gaps that matter for reaching the goal.

Produce a structured analysis that can be consumed by the future Learning Path Recommendation Agent.

It should NOT:

generate the final learning path

create milestones/modules

generate detailed topics

scrape roadmap.sh

search external learning resources

rank courses/videos

modify roadmap.sh content

generate a final LearningPathResponse

call the orchestrator

call FastAPI

call Scala

access a production database

IMPORTANT ROADMAP.SH ARCHITECTURE DECISION

The project will use roadmap.sh as a high-quality source of existing learning roadmaps.

The agreed future approach is a hybrid roadmap.sh integration:

Prefer obtaining structured roadmap content from the official roadmap.sh GitHub repository/source where practical.

Use the public roadmap.sh website as the website/source fallback where necessary.

Normalize retrieved roadmap data into an internal representation.

The future Learning Path Recommendation Agent will search for an appropriate roadmap.

If an appropriate roadmap exists, the system will retrieve and use that roadmap.

The system will NOT rewrite or modify the roadmap's educational sequence/content.

The retrieved roadmap will ultimately be returned/presented to the learner as the learning path, with learner progress/completion state handled separately by our platform.

If no suitable roadmap exists, the future Learning Path Recommendation Agent will generate a detailed topic-by-topic learning path using an LLM.

UI behavior such as roadmap visualization, progress buttons, "learning"/"complete"/etc. is outside the AI-service scope.

This roadmap.sh behavior is a future Step 3B concern.

Do not implement it in this task.

The current agent only determines learner/skill gaps that can later help the Learning Path Recommendation Agent select or evaluate an appropriate roadmap.

AGENT IMPLEMENTATION

Use Agno for the agent layer.

This is the first step where an actual agent is introduced.

However, keep deterministic domain logic in normal Python tools/functions.

Do not put deterministic skill-gap calculations inside an LLM prompt when they can be performed reliably in code.

The architecture should conceptually be:

Learner / Skill Analysis Agent
|
+-- get_learner_profile
+-- get_learner_skills
+-- get_goal_requirements
+-- get_skill_prerequisites
|
+-- calculate_skill_gaps
+-- resolve_prerequisite_chain
|
v
Structured Skill Analysis

The LLM should reason about ambiguous/semantic relationships where useful, but deterministic calculations should remain deterministic.

SUPPORTING TOOLS TO BUILD

The existing Step 2 tools are data retrieval tools.

For this agent, add only the supporting deterministic tools genuinely required for skill analysis.

1. calculate_skill_gaps

Purpose:

Compare the learner's current skills with the required skills for the target goal.

Inputs should use existing project schemas/types where possible.

The result should distinguish, where the current data model allows it:

skills already adequately covered

missing skills

skills that may need advancement because current proficiency is insufficient

Do not invent a sophisticated skill ontology.

The current mock contract uses human-readable skill names and categorical levels:

beginner

intermediate

advanced

Use those conventions.

2. resolve_prerequisite_chain

Purpose:

Given a target/missing skill, traverse the existing prerequisite graph and identify prerequisite skills relevant to reaching it.

This should be deterministic.

It should:

traverse known prerequisite relationships

avoid infinite loops

handle foundational skills with no prerequisites

handle repeated/shared prerequisites

produce a stable deterministic result

detect cycles if the data contains one

Do not use an LLM for graph traversal.

3. Optional supporting logic

Only create another supporting tool if the existing contracts/data and the actual implementation clearly require it.

Do NOT create speculative tools such as:

generate_learning_path

rank_roadmaps

search_resources

roadmap_scraper

generate_modules

Those belong to later steps.

OUTPUT DESIGN

The agent's internal result must be structured and typed.

Do not make the final output merely an unstructured LLM paragraph.

Use an explicit Pydantic model or equivalent project-standard structured model.

The analysis should contain only information necessary for downstream learning-path recommendation.

A reasonable conceptual structure is:

SkillAnalysis
├── learner_id
├── target_goal
├── current_skills
├── required_skills
├── covered_skills
├── missing_skills
├── insufficient_skills
├── prerequisite_gaps
└── analysis_summary

However:

Do not blindly create fields above if they conflict with existing contracts or repository conventions.

Inspect the Step 1 contract and Step 2 schemas first.

Do not modify the external mock contract merely to support this internal agent result.

MODEL STRATEGY

Use Mistral as the LLM provider through the project's chosen Agno integration.

For this agent:

Prefer Mistral Small for straightforward analysis.

Escalate to Mistral Large only where semantic reasoning genuinely requires it.

Do not use Codestral for this agent.

Do not hard-code model selection throughout business logic.

Keep model configuration isolated so that model routing can be changed later.

If the repository already contains a configuration mechanism, follow it.

Do not add unnecessary infrastructure.

AGENT BEHAVIOR

The agent should use tools rather than hallucinating learner or skill data.

A conceptual execution should be:

Retrieve learner profile.

Retrieve learner skills.

Retrieve target goal requirements.

Calculate deterministic skill gaps.

Resolve prerequisite chains for relevant missing/insufficient skills.

Produce a structured analysis.

Return the analysis to the caller.

The agent must not invent:

learner skills

goal requirements

prerequisites

roadmap content

If required information is unavailable in the current mock data, fail clearly rather than hallucinating it.

IMPORTANT: DO NOT OVER-AGENTIFY

Do not create multiple agents for every individual calculation.

There should be ONE Learner / Skill Analysis Agent.

The following remain deterministic tools:

skill-gap calculation

prerequisite traversal

simple validation

graph operations

The LLM is used for reasoning, not as a replacement for normal programming.

TESTING

Add tests for the supporting deterministic tools.

At minimum:

calculate_skill_gaps

Test:

learner with several skills already covered

learner missing required skills

learner with insufficient proficiency

empty/current skill edge cases if supported by the existing schemas

resolve_prerequisite_chain

Test:

skill with prerequisites

foundational skill with no prerequisites

multiple prerequisite levels

shared prerequisites

cycle detection if applicable

Agent

Add an agent-level test that uses mocked/deterministic tool outputs.

Do NOT make tests dependent on an external Mistral API unless the repository already has an established integration-test convention for that.

Prefer deterministic unit tests and a mocked LLM/provider for agent behavior.

Tests must not require:

PostgreSQL

Redis

Scala backend

external web access

roadmap.sh

GitHub network access

AGNO REQUIREMENTS

Use Agno only for the actual agent orchestration/reasoning layer.

Do not turn every function into an Agno-specific abstraction.

The deterministic tools should remain independently callable and unit-testable.

The agent should be able to receive the learner-analysis inputs and produce the structured internal result.

Do not build an Agno team.

Do not build the global orchestrator.

Do not create agent-to-agent communication yet.

ERROR HANDLING

Handle failures cleanly:

learner not found

goal not found

skill not found

invalid input

malformed prerequisite graph

Do not silently fabricate missing information.

Reuse Step 2 exception conventions where appropriate.

REPOSITORY DISCIPLINE

Only make changes required for Step 3A.

Do NOT modify:

frontend

Scala code

Step 1 mock contract

roadmap.sh integration

production database code

FastAPI routes

orchestrator

resource discovery

assessment

adaptation

AI assistant

coding agent

If a genuine inconsistency is discovered in the existing contract or Step 2 implementation:

Do not silently rewrite it.

Document the inconsistency.

Make the smallest safe internal change if possible.

Report it clearly.

SOFTWARE ENGINEERING REQUIREMENTS

Follow professional engineering practices:

type hints

Pydantic/structured models where appropriate

single responsibility

deterministic domain logic

dependency isolation

testability

no global mutable state

no secrets

no unnecessary dependencies

no speculative abstractions

clear module boundaries

meaningful test names

clear error handling

no unrelated refactoring

Keep the implementation small and understandable.

DEFINITION OF DONE

Step 3A is complete only when:

The Learner / Skill Analysis Agent exists.

It uses Agno.

It uses the existing Step 2 data retrieval tools.

Required deterministic supporting tools exist.

Skill-gap calculation is deterministic.

Prerequisite traversal is deterministic.

The agent returns a structured typed analysis.

Mistral integration is isolated/configurable.

Tests cover the deterministic tools.

Agent behavior has a testable mocked path.

No roadmap.sh integration has been built.

No Learning Path Recommendation Agent has been built.

No orchestrator has been built.

No FastAPI endpoint has been built.

No production database integration has been built.

Step 1 mock contracts remain unchanged.

Existing Step 2 tests continue to pass.

All new tests pass.

FINAL REPORT

After implementation, provide:

Files created.

Files changed.

Existing tools reused.

New supporting tools created.

Agent structure.

Agno configuration.

Mistral model configuration.

Structured agent output.

Tests executed and results.

Any assumptions.

Any unresolved issues.

Explicit confirmation that roadmap.sh, Learning Path Agent, Orchestrator, API, and production integrations were NOT implemented.

STOP after Step 3A.

Do not proceed to Step 3B automatically.

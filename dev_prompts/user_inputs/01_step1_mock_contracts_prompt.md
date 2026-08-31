# Step 1: Define Mock AI-Service Contracts Prompt

**Author:** User  
**Task:** Step 1 — Contract Design Only

---

the venv i have creted using uv and also activated 
for requirements make a requirements.txt file for initials then as we progress keep maintainig it simulatanelously and also in the docs folder you to document the whole project simultaenously for each tool function why it is used etc 

llm selection for right now will be both mistral-small-latest and mistral-large-latest according to requirements and the effort required for reasoning agents we will use large model and for low effort work we can use small

yes i am happy with this project structure

make sure the code written adheres with and stands ground on all software dev principles including optimization and security etc.

the work that youll do first will be directed by this prompt only do the work which written in this prompt and what ive told you :
# HCLTech Hackathon — Step 1: Define Mock AI-Service Contracts

## Context

You are working on the HCLTech Hackathon project:

**AI-Powered Personalized Learning Path Recommender**

Before doing anything, read the repository's `project_overview.md`.

Treat `project_overview.md` as the project context and source of truth for the current development plan.

The project architecture is:

React / Next.js
→ Scala Backend
→ Python / FastAPI + Agno AI Service
→ PostgreSQL + pgvector

The Python / FastAPI + Agno service is responsible for AI reasoning.

## IMPORTANT: Current Development Situation

The Scala ↔ Python AI-service contract has **NOT been finalized**.

The Scala developer has explicitly asked us to use **mock contracts for now** so that both teams can develop independently.

Therefore, this task is ONLY about defining the temporary mock contracts.

### DO NOT implement:

* Agents
* Tools
* Orchestrator
* FastAPI endpoints
* Database integration
* PostgreSQL
* pgvector
* Redis
* LLM integration
* Agno agent logic
* Resource discovery
* Resource ranking
* Adaptation
* Assistant
* Assessment generation
* Production Scala integration
* Frontend integration

Those belong to later development steps.

---

# Objective

Design the **temporary mock contract** for the first AI-service capability:

`POST /ai/generate-learning-path`

The goal is to establish a clear request and response structure that the future agent implementation can build against.

This is an internal development contract only.

It is NOT the final production Scala ↔ Python contract.

---

# What You Must Produce

Create the contract definition/documentation for:

## 1. Learning-path generation request

Define the information the AI service needs in order to generate a personalized learning path.

The architecture identifies learner information such as:

* learner goals
* interests
* career aspirations
* experience
* learning preferences
* available time
* progress
* skill confidence
* assessment signals

For this first mock contract, include only information necessary for the learning-path-generation flow.

Do NOT add fields simply because they might be useful in the future.

If a field is not supported by the current project documentation or required for this mock flow, do not invent it.

---

## 2. Learning-path generation response

Define the structured response the AI service will return.

The response must represent a personalized learning path.

The architecture document identifies learning paths containing concepts such as:

* phases
* skills
* resources
* assessments
* milestones
* prerequisites/dependencies
* progress/status information

For this mock contract, include only the structures necessary to represent the initial learning-path-generation result.

Do not design the entire future learning-path system.

---

# Contract Design Principles

## Temporary

Everything produced in this task must clearly be identified as:

**Mock Contract v0 / Temporary**

Do not call it the production contract.

Do not imply that Scala has approved this schema.

The real Scala ↔ Python contract will replace this later.

---

## Minimal

Keep the contract as small as possible while still allowing the first learning-path-generation flow to be developed.

Do not over-engineer the schema.

Do not add fields for hypothetical future requirements.

---

## Explicit

Every field should have:

* name
* type
* purpose
* whether it is required/optional where relevant
* example value where useful

Avoid vague fields such as:

```text
metadata: object
data: object
context: object
extra: object
```

unless there is a concrete reason for them.

---

# Deliverables

Create documentation for the mock contract.

The documentation should contain:

## A. Request schema

Show the complete temporary request structure.

## B. Response schema

Show the complete temporary response structure.

## C. Example request

Provide one realistic example.

Use a learner pursuing a technical career goal so the learning-path structure can be demonstrated.

## D. Example response

Provide one realistic structured learning-path response.

## E. Field definitions

Document the meaning of each field.

## F. Assumptions

Clearly list any assumptions that were necessary.

If there are no assumptions, say so.

## G. Explicitly unresolved items

Document what is intentionally NOT defined yet because the real Scala contract does not exist.

---

# Important Boundary

Do not implement the contract as application logic yet.

Do not create agents around it.

Do not create tools around it.

Do not create an orchestrator around it.

Do not create API routes around it.

Do not create database models around it.

The purpose of this step is to establish the **data contract only**.

---

# Repository Discipline

Before creating files:

1. Inspect the existing repository.
2. Check whether there is already a documentation or contract directory.
3. Reuse the existing project convention if one exists.
4. Do not modify unrelated files.
5. Do not restructure the repository.

If the repository has no appropriate location for the contract documentation, create the smallest reasonable documentation file.

Do not introduce new dependencies.

Do not modify dependency files.

Do not modify application code.

---

# Source Discipline

Use `project_overview.md` and the project architecture as the basis for this contract.

Do NOT silently invent requirements.

Where the architecture is ambiguous, prefer the smallest reasonable mock representation and explicitly record the ambiguity under "Assumptions" or "Unresolved Items".

Do not convert future architecture into current implementation requirements.

---

# Quality Requirements

The resulting contract must be:

* easy for the Scala developer to understand
* easy for the Python developer to implement later
* versionable
* explicit
* minimal
* internally consistent
* independent of any specific LLM provider
* independent of Agno implementation details
* independent of database implementation

The contract should describe **data exchanged between systems**, not how the AI internally reasons.

---

# Definition of Done

Step 1 is complete when:

* The temporary `/ai/generate-learning-path` request contract is documented.
* The temporary response contract is documented.
* Example request and response are provided.
* Fields are clearly explained.
* Assumptions are explicitly documented.
* Unresolved contract decisions are explicitly documented.
* No agent/tool/orchestrator implementation has been created.
* No FastAPI implementation has been created.
* No production integration has been created.
* No unrelated project code has been changed.

At the end, report only:

1. What contract documentation was created.
2. The request/response structures defined.
3. Any assumptions made.
4. Any unresolved decisions that need to be discussed with the Scala developer.

Remember:

**This task is contract design only. Do not proceed to implementation.**

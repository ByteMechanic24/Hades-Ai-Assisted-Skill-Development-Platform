# HCLTech Hackathon — AI-Powered Personalized Learning Path Recommender

## 1. Project Purpose

We are building an AI-powered personalized learning platform.

The product is not intended to be only a course recommender. It is intended to understand learner information such as goals, interests, career aspirations, experience, learning preferences, available time, progress, skill confidence, and assessment signals, and use that information to create and continuously adapt a personalized learning path.

The overall product loop defined by the project architecture is:

Learner Goal
→ Learner Profile
→ Skill / Prerequisite Graph
→ Personalized Learning Path
→ Resource Discovery
→ Resource Analysis
→ Recommendation / Ranking
→ Learning
→ Assessment / Feedback
→ Learner State Update
→ Path Adaptation

## 2. Current System Architecture

The documented system architecture is:

React / Next.js Frontend
→ Scala Backend
→ Python / FastAPI + Agno AI Service
→ PostgreSQL + pgvector
→ Redis where useful

The frontend must not directly depend on the AI service.

The Scala backend owns application state, business logic, authorization, persistence, and authoritative validation/rules.

The Python / FastAPI + Agno service owns AI reasoning.

The AI service is a backend-to-backend service. The browser does not call it directly.

## 3. AI Service

The AI service is being built in Python using FastAPI and Agno.

The architecture document identifies the following AI capabilities/endpoints:

- POST /ai/generate-learning-path
- POST /ai/recommend-resources
- POST /ai/adapt-learning-path
- POST /ai/chat
- POST /ai/generate-assessment

These represent the intended AI-service capabilities from the architecture document.

## 4. Current Development Plan

There is currently NO finalized Scala ↔ Python AI-service contract.

The Scala developer has explicitly requested that the AI service use mock contracts for now.

Therefore:

- Do not wait for the final Scala contract.
- Do not assume that a final production request/response schema already exists.
- Use a temporary mock contract to unblock parallel development.
- Treat the mock contract as temporary and replaceable.
- Keep the boundary between the API contract and internal agent/tool implementation clean so the real contract can be introduced later.

For the current first milestone, only the learning-path generation flow is in scope.

Current target flow:

Mock Request
→ FastAPI endpoint
→ Orchestrator
→ Learning Path reasoning
→ Mock tools/data where required
→ Structured learning-path response
→ Mock response usable by the Scala developer

The first AI endpoint to implement is:

POST /ai/generate-learning-path

Do not implement all other AI endpoints as part of this first milestone.

## 5. Current Agent-Service Build Order

The current agreed development order is:

1. Define a temporary mock contract for learning-path generation.
2. Define mock tool interfaces/data needed by the first reasoning flow.
3. Build the first learning-path reasoning agent.
4. Build the orchestrator around the first agent.
5. Expose the flow through FastAPI.
6. Test the complete mocked AI-service flow.
7. Later replace the temporary contract with the actual Scala ↔ Python contract when it is defined.

The purpose of this order is to allow the agent-service work and Scala backend work to proceed in parallel without waiting for the final contract.

## 6. First Agent Scope

The first useful AI capability is learning-path generation.

The first agent should reason about a learner's goal and available learner/skill information and produce a structured learning path.

The project architecture identifies learner signals including:

- goals
- interests
- career aspirations
- experience
- learning preferences
- available time
- progress
- skill confidence
- assessment signals

For the initial mock flow, only the information required to exercise the learning-path reasoning should be included in the temporary mock contract.

Do not invent additional product requirements or learner fields that are not required by the current flow.

## 7. Initial Mock Tools

The initial implementation may use mocked tools/data rather than real database or Scala integrations.

The currently identified tool capabilities for the first learning-path flow are:

- learner/profile information retrieval
- learner skill information retrieval
- goal requirement retrieval
- skill prerequisite retrieval

These are capabilities for the initial mock implementation, not finalized production APIs.

The first implementation should not require PostgreSQL, pgvector, Redis, or production Scala integration.

## 8. Agent vs Tool Responsibilities

Keep responsibilities separated.

A tool represents a capability used by an agent to retrieve or perform a defined operation.

An agent performs reasoning using the information available through its tools and produces structured output.

The orchestrator coordinates agents/capabilities and the overall workflow.

Do not put the entire reasoning process into tools.

Do not make the orchestrator responsible for all domain reasoning.

Do not turn every simple function into an autonomous agent.

## 9. Orchestrator Scope for the First Milestone

The first orchestrator should remain simple.

For the initial learning-path flow, its responsibility is to coordinate the learning-path generation capability, rather than implementing all AI behavior itself.

The initial conceptual flow is:

Orchestrator
→ Learning Path reasoning
→ Structured LearningPath response

The orchestrator can become more involved later when multiple capabilities such as skill analysis, resource discovery, resource analysis, ranking, adaptation, and assistant functionality are implemented.

## 10. Future AI Capabilities

The architecture document identifies these AI-side capabilities:

- Path Agent
- Discovery Agent
- Analyzer
- Ranking
- Adaptation
- Assistant

These are part of the broader target architecture.

They are NOT all required for the first milestone.

The first milestone is intentionally limited to learning-path generation with mocked dependencies.

## 11. System Boundaries

The following boundaries are important:

### Frontend

React / Next.js is the learner experience layer.

It renders and interacts with application state and communicates with the Scala backend.

It does not own AI orchestration, LLM provider calls, skill-gap reasoning, authoritative prerequisite validation, milestone unlocking rules, database access, or AI secrets.

### Scala Backend

Scala is the application/backend layer.

It owns application state, business logic, APIs, persistence, events, authorization, and authoritative validation/rules.

Scala communicates with the Python / Agno AI service through backend-to-backend AI contracts.

### Python / Agno AI Service

Python / FastAPI + Agno owns AI reasoning.

AI output must ultimately be treated as structured data that can be validated by the Scala backend before persistence or use as authoritative application state.

## 12. First Milestone Definition of Done

The first milestone is complete when a mocked learning-path-generation request can travel through the AI service:

Mock request
→ FastAPI
→ Orchestrator
→ Learning-path reasoning agent
→ Mock tools/data
→ Structured learning-path response

The implementation should be testable without depending on the final Scala contract or production databases.

## 13. Important Constraints

- The final Scala ↔ Python contract is not defined yet.
- The current contract is temporary and mocked.
- Do not silently treat the mock contract as the final production contract.
- Do not introduce unrelated features into the first milestone.
- Do not add production infrastructure that is not required for the mocked flow.
- Do not expose AI provider credentials or secrets to the frontend.
- Keep API contracts, orchestration, agents, tools, and schemas separated.
- Prefer small, testable components with clear responsibilities.
- Preserve the ability to replace mock dependencies with real integrations later.

## 14. Source of Truth

This overview is based on the project architecture document supplied for the HCLTech hackathon and the current team decision to use temporary mock contracts because the Scala ↔ Python contract has not yet been finalized.

Where this document says "current", it refers specifically to the present agent-service development plan, not to the complete future platform.

Do not infer undocumented requirements from this file.

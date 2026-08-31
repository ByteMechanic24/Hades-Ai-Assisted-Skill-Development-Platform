# Step 3B: Learning Path Recommendation Agent Prompt

**Author:** User  
**Task:** Step 3B — Learning Path Recommendation Agent  
**Source Specification File:** `stepwise/antigravity_step3B_learning_path_recommendation_agent.md`

---

```text
ok lets move to step 3b go to path stepwise\antigravity_step3B_learning_path_recommendation_agent.md to access file read it and then implement it
```

---

## Detailed Specification (from `stepwise/antigravity_step3B_learning_path_recommendation_agent.md`)

# HCLTech Hackathon — Step 3B: Learning Path Recommendation Agent

## IMPORTANT — READ FIRST

You are continuing the HCLTech Hackathon AI-Powered Personalized Learning Path Recommender.

Before making any changes:

1. Read `project_overview.md`.
2. Read the Step 1 mock contract documentation.
3. Inspect the complete current repository.
4. Inspect the completed Step 2 implementation.
5. Inspect the completed Step 3A implementation and its tests.
6. Preserve existing project conventions and interfaces unless a genuine inconsistency is found.

Step 3A is COMPLETE.

This task is ONLY Step 3B.

Do NOT build the global Orchestrator, FastAPI endpoints, Scala integration, database integration, assessment agent, adaptation agent, AI assistant, or coding agent.

---

# CURRENT DEVELOPMENT POSITION

```text
Step 1   Mock Contracts                         COMPLETE
Step 2   Mock/Data Retrieval Tools              COMPLETE
Step 3A  Learner/Skill Analysis Agent           COMPLETE
Step 3B  Learning Path Recommendation Agent     CURRENT
Step 4   Orchestrator
Step 5   API / Scala Integration
```

The existing Learner / Skill Analysis Agent provides structured learner/skill-gap information.

The Learning Path Recommendation Agent must consume that analysis as an input.

Do NOT create agent-to-agent coupling that requires the Skill Analysis Agent to internally invoke the Learning Path Agent or vice versa. They should remain independently callable until the future Orchestrator coordinates them.

---

# PRIMARY OBJECTIVE

Build the **Learning Path Recommendation Agent**.

Its responsibility is:

> Turn the learner's goal, learner state, skill-gap analysis, prerequisites, and available learning-roadmap information into the learning path represented by the existing `LearningPathResponse` contract.

There are TWO possible path-generation branches.

## Branch A — roadmap.sh has a suitable roadmap

Use the roadmap.sh roadmap.

The roadmap's educational content and ordering are NOT to be rewritten or redesigned by our system.

Retrieve the roadmap and represent it in our structured response format so the frontend can render it and our platform can track learner progress separately.

Do NOT invent a new learning sequence merely because the retrieved roadmap could be arranged differently.

## Branch B — no suitable roadmap.sh roadmap exists

Use Mistral Large to generate a detailed learning path from scratch.

The generated path must be based on:

- learner profile
- target goal
- current skills
- skill-gap analysis
- prerequisites
- experience level
- available hours per week
- learning preferences
- any other information already present in the established contract

The generated path must satisfy the existing learning-path response contract.

---

# ROADMAP.SH IS A FIRST-CLASS SOURCE

Implement the agreed hybrid approach:

```text
                roadmap.sh
                    │
          ┌─────────┴─────────┐
          │                   │
   Official GitHub        Public website
      source                fallback
          │                   │
          └─────────┬─────────┘
                    ▼
             Raw roadmap data
                    │
                    ▼
          Mistral Small parser /
          structure normalizer
                    │
                    ▼
          Internal structured roadmap
```

### Source priority

1. Prefer the official roadmap.sh GitHub repository/source where practical.
2. Use the public roadmap.sh website as a fallback when the GitHub source cannot provide the required roadmap content.
3. Do not rely on an imaginary roadmap.sh API.
4. Do not use unofficial roadmap copies as the authoritative source.

---

# MISTRAL SMALL FOR ROADMAP STRUCTURING

Use **Mistral Small** to transform/normalize the retrieved roadmap content into our internal structured representation.

Mistral Small is used for parsing, node identification, schema organization, and consistent extraction. It must NOT invent topics, alter sequences, or redesign roadmaps.

---

# MISTRAL LARGE FOR FALLBACK GENERATION

When no suitable roadmap.sh template exists, Mistral Large generates a personalized, topic-by-topic roadmap satisfying all fields of `LearningPathResponse`.

---

# VALIDATION

Both branches pass through `validate_learning_path` ensuring structural and mathematical consistency.

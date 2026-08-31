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

roadmap.sh is intentionally being used because it contains high-quality role/skill learning roadmaps.

The lack of a public API is NOT a blocker.

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

The exact source mechanics must be implemented behind tools so the agent does not care whether the roadmap came from GitHub or the public site.

---

# IMPORTANT: MISTRAL SMALL FOR ROADMAP STRUCTURING

When raw roadmap content is retrieved from GitHub or the public website, it may not already be in the exact structured shape required by our UI/contract.

Use **Mistral Small** to transform/normalize the retrieved roadmap content into our internal structured representation.

Mistral Small is being used here for:

- parsing semi-structured roadmap content
- identifying roadmap nodes/topics
- organizing the retrieved source content into our schema
- extracting titles/descriptions where the source provides them
- producing consistent structured output

Mistral Small MUST NOT:

- invent roadmap topics
- add educational content not present in the source
- reorder the roadmap's educational sequence
- redesign the roadmap
- personalize the roadmap's educational sequence
- fabricate missing source content

If source content is unavailable or ambiguous, preserve the source faithfully and report the limitation rather than hallucinating.

The role of Mistral Small here is **structuring**, not learning-path generation.

---

# MISTRAL LARGE FOR FALLBACK GENERATION

Only when no suitable roadmap.sh roadmap is available should Mistral Large generate a learning path from scratch.

The fallback should be detailed and topic-by-topic.

It should use the learner analysis and existing prerequisite information rather than inventing a generic roadmap disconnected from the learner.

Keep model configuration isolated/configurable.

Do not scatter model names throughout the code.

---

# ROADMAP SELECTION

The agent needs a mechanism to determine whether roadmap.sh contains a suitable roadmap for the learner's target goal.

Build explicit tools for roadmap discovery/retrieval rather than instructing the LLM to browse arbitrary URLs.

At minimum, provide capabilities equivalent to:

```text
search_roadmaps(goal)
get_roadmap(identifier)
```

The implementation may introduce additional small internal helpers if actually necessary.

Do not create speculative tools.

## Matching rules

Roadmap matching should consider the learner's target goal and available roadmap metadata.

Do not claim a roadmap is suitable solely because one keyword matches.

Use a deterministic filtering/matching stage first where practical.

Mistral Small may assist with semantic matching if the repository's actual source structure makes deterministic matching insufficient.

Do NOT use Mistral Large merely to search.

---

# ROADMAP RETRIEVAL

The roadmap retrieval layer must:

1. Locate the requested roadmap.
2. Retrieve its source content.
3. Preserve the source's educational ordering.
4. Preserve source topics/nodes faithfully.
5. Normalize it into an internal structured representation.
6. Return enough metadata to identify the source roadmap.
7. Make it possible for the UI/backend to associate learner progress with individual roadmap items later.

Do not build frontend progress controls.

The AI service only needs to provide the structured roadmap/path representation.

---

# ROADMAP CONTENT MUST NOT BE REWRITTEN

This is a critical product decision.

If roadmap.sh provides:

```text
A
 ↓
B
 ↓
C
 ↓
D
```

we must not turn it into:

```text
A
 ↓
C
 ↓
B
 ↓
D
```

just because we believe B/C could be better ordered.

Likewise, do not rewrite roadmap descriptions or add our own curriculum content to an existing roadmap.

Learner-specific state can be represented separately, for example conceptually:

```text
roadmap item
+
learner status
```

but the source roadmap itself remains unchanged.

The UI may later show states such as learning/completed/etc.; those controls are frontend scope and must NOT be implemented here.

---

# PERSONALIZATION BOUNDARY

For an existing roadmap.sh roadmap:

Personalization means selecting the appropriate roadmap for the learner and associating learner/skill-gap context with it.

It does NOT mean rewriting the roadmap's educational content.

For the no-roadmap fallback:

Personalization happens during Mistral Large generation.

---

# EXISTING CONTRACT — DO NOT CHANGE

The final generated response must conform to the existing `LearningPathResponse` contract from Step 1.

Do NOT create a new competing response contract.

The existing contract requires the learning path response to contain the established fields, including:

- title
- summary
- target role
- total hours
- total weeks
- milestones
- modules
- granular topics
- learning style
- deliverables
- skill-gap analysis
- adaptation rationale

Inspect the actual contract and use its exact field names/types.

Do not rely on this prompt's conceptual names if they differ from the repository contract.

If an existing roadmap cannot naturally populate a field, do not fabricate data.

Instead:
- use an existing contract-compatible representation if one exists,
- use source-provided information,
- or clearly document the limitation.

Do NOT silently modify the Step 1 contract.

---

# REUSE STEP 3A

The Learning Path Recommendation Agent should consume the result of Step 3A where available.

Relevant information includes:

- learner ID
- target goal
- current skills
- required skills
- covered skills
- missing skills
- insufficient skills
- prerequisite gaps
- analysis summary

Do not duplicate Step 3A's deterministic calculations inside this agent.

Reuse existing tools/models rather than recreating them.

---

# SUPPORTING TOOLS

The agent may use:

## Existing data tools

```text
get_learner_profile
get_learner_skills
get_goal_requirements
get_skill_prerequisites
```

## Existing skill-analysis tools

Reuse the Step 3A tools where applicable:

```text
calculate_skill_gaps
resolve_prerequisite_chain
```

Do not duplicate these implementations.

## New roadmap tools

Implement the minimum necessary roadmap.sh capabilities:

```text
search_roadmaps
get_roadmap
```

Potentially, only if actually required:

```text
normalize_roadmap
```

However, normalization should preferably be an internal implementation detail rather than an unnecessarily exposed agent tool.

## Validation

Reuse `validate_learning_path` if it already exists.

If it does not exist, implement the minimum deterministic validation needed for this agent.

Do not create a large generic framework.

---

# ROADMAP STRUCTURED REPRESENTATION

Create an internal typed representation for a roadmap if the current schemas do not already provide one.

The representation should preserve concepts such as:

```text
Roadmap
├── source
├── source_identifier
├── title
├── description (if source provides it)
└── ordered nodes/topics
      ├── id
      ├── title
      ├── description (if source provides it)
      └── children/subtopics where source provides them
```

Use the actual source structure discovered during implementation.

Do not invent fields that cannot be supported by the source.

The roadmap representation should make it possible for the frontend/backend to later track learner state per roadmap item.

---

# UI RESPONSIBILITY

The AI service is NOT responsible for:

- rendering roadmap graphics
- progress buttons
- "Learning" / "Complete" UI controls
- visual styling
- frontend state management

The AI service returns structured data.

The frontend decides how to display and interact with it.

---

# FALLBACK LEARNING PATH GENERATION

If no suitable roadmap.sh roadmap exists:

Use Mistral Large.

Prompt it with structured information rather than a giant unstructured concatenation.

The model should generate:

```text
Learning Path
├── milestone
│    ├── module
│    │    ├── topic
│    │    ├── topic
│    │    └── ...
│    └── deliverable
├── milestone
│    └── ...
└── ...
```

The generated path should:

- respect prerequisites
- account for current skills
- avoid reteaching adequately mastered skills where appropriate
- account for experience level
- account for available weekly time
- account for learning preferences
- be detailed enough to be actionable
- provide the required contract fields
- provide a meaningful skill-gap analysis
- provide an adaptation rationale

Do not make the fallback a vague list of courses or technologies.

---

# MODEL ROUTING

Use:

### Mistral Small

For:

- roadmap content structuring
- source normalization
- lightweight semantic roadmap matching where necessary

### Mistral Large

For:

- generating a new learning path when no suitable roadmap.sh roadmap exists
- complex reasoning required to construct the fallback path

### Codestral

Do NOT use it in Step 3B.

It is intended for future coding/project-oriented capabilities.

Keep all model configuration centralized/configurable.

---

# VALIDATION

Both branches must converge into deterministic validation.

Conceptually:

```text
                 roadmap.sh branch
                       │
                       ▼
               structured roadmap
                       │
                       │
fallback generation ───┘
                       │
                       ▼
              validate_learning_path
                       │
                       ▼
              LearningPathResponse
```

Validation should check what can be checked deterministically, including where appropriate:

- required fields
- valid structure
- milestone/module/topic hierarchy
- positive/non-negative duration values
- no malformed nodes
- prerequisite/order consistency for generated fallback paths
- roadmap source ordering preservation for roadmap.sh paths

Do not use an LLM to perform basic structural validation.

---

# TESTING

Add deterministic tests for roadmap integration and agent behavior.

At minimum test:

## Roadmap discovery

- known roadmap can be found
- unknown roadmap/goal returns no suitable roadmap
- source errors are handled cleanly

## Roadmap retrieval

- roadmap content is retrieved
- ordering is preserved
- source identifier is retained
- malformed source is handled safely

## Roadmap structuring

- raw source content can be converted to the internal representation
- Mistral Small is mocked in tests
- no source content is invented by the test fixture

## Existing roadmap branch

- suitable roadmap causes roadmap branch to be selected
- Large generation is NOT called
- roadmap educational ordering remains unchanged

## Fallback branch

- no suitable roadmap causes fallback generation
- Mistral Large is invoked through the configured model abstraction
- generated output is validated
- invalid model output is handled safely

## Contract

- final output conforms to the existing `LearningPathResponse` schema
- existing Step 1 and Step 2 tests continue to pass
- Step 3A tests continue to pass

Tests must not require live roadmap.sh/GitHub/network access.

Use fixtures/mocks for external source content.

A small number of explicitly marked integration tests may be added only if the repository already has an established pattern for them. Do not make them part of the normal unit-test suite.

---

# EXTERNAL SOURCE / SCRAPING DISCIPLINE

The roadmap integration must be implemented professionally.

Before scraping:

- inspect the actual current source structure
- respect robots.txt and applicable usage restrictions
- do not aggressively crawl
- do not introduce unnecessary network traffic
- cache/mock source content for tests
- isolate source adapters from agent logic

Do not assume the website HTML structure without inspecting it.

Do not hard-code fragile CSS selectors if a more stable official source representation is available.

Prefer the official GitHub source for structured ingestion.

---

# SOFTWARE ENGINEERING REQUIREMENTS

Follow professional engineering practices:

- clear module boundaries
- type hints
- Pydantic/structured models
- dependency injection where useful
- isolated external adapters
- deterministic unit tests
- no secrets in source
- no global mutable state
- no unnecessary dependencies
- clear error handling
- no duplicated logic
- no speculative abstractions
- no unrelated refactoring

The roadmap source adapter must be independently testable.

The Learning Path Agent must not contain raw HTTP/scraping logic.

---

# REPOSITORY DISCIPLINE

Do not modify:

- frontend
- Scala
- Step 1 contracts
- unrelated Step 2/3A code
- global orchestrator
- FastAPI routes
- production databases
- assessment/adaptation/assistant/coding agents

If an actual inconsistency is discovered in the existing contract or Step 3A implementation:

1. Stop before changing the contract.
2. Explain the inconsistency.
3. Make the smallest safe internal adjustment only if possible.
4. Report it.

Do not silently rewrite earlier architecture.

---

# DEFINITION OF DONE

Step 3B is complete only when:

1. The Learning Path Recommendation Agent exists.
2. It is built with Agno.
3. It can consume Step 3A's structured learner/skill analysis.
4. roadmap.sh discovery exists.
5. The agreed hybrid GitHub-primary / website-fallback approach exists behind isolated adapters.
6. Retrieved roadmap content can be normalized into a typed internal structure.
7. Mistral Small is used for roadmap structuring/normalization where needed.
8. Existing roadmap content/order is preserved.
9. A suitable roadmap.sh roadmap takes the existing-roadmap branch.
10. The system does NOT call Mistral Large for that branch unless genuinely required for matching.
11. No suitable roadmap triggers the Mistral Large fallback-generation branch.
12. The fallback generates a detailed topic-by-topic learning path.
13. Both branches produce the existing `LearningPathResponse` structure.
14. Deterministic validation exists.
15. Unit tests cover both branches.
16. Tests do not require live external services.
17. Step 1, Step 2, and Step 3A tests continue to pass.
18. No Orchestrator is built.
19. No FastAPI endpoint is built.
20. No Scala integration is built.
21. No frontend/UI is built.
22. No unrelated agents are built.

---

# FINAL REPORT

After implementation, report:

1. Files created.
2. Files changed.
3. Existing tools reused.
4. New roadmap tools created.
5. GitHub roadmap adapter implementation.
6. Website fallback implementation.
7. Roadmap structured schema.
8. How Mistral Small is used.
9. How Mistral Large is used.
10. Agent flow.
11. Existing-roadmap branch behavior.
12. No-roadmap fallback behavior.
13. Validation behavior.
14. Tests executed and results.
15. Any assumptions.
16. Any limitations.
17. Explicit confirmation that Orchestrator, FastAPI, Scala integration, frontend, and unrelated agents were NOT implemented.

STOP after Step 3B.

Do not proceed to Step 4 automatically.

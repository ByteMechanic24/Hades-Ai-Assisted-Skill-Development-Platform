# HADES AI Service --- Orchestration API Contract v1 (Draft)

**Status:** Implementation-aligned backend handoff contract v1\
**Purpose:** Backend ↔ Python AI-service integration\
**Source of truth:** Current AI-service codebase supplied with this
contract.\
**Important:** The older `Mock AI-Service Contract v0` is historical and
is **not** the source of truth for this API.

------------------------------------------------------------------------

## 1. Contract Decision

The current AI service is an **orchestration service**, not merely a
one-shot learning-path generator.

The recommended backend boundary is one event-driven endpoint:

`POST /ai/orchestrate`

The endpoint accepts a learner/session event and invokes the existing
`AIOrchestrator`.

The Scala backend does **not** need to know about:

-   Agno
-   Mistral
-   individual Python agents
-   internal orchestration state
-   resource-search providers
-   Python tool implementations

Those remain internal AI-service concerns.

The backend owns application/authentication/business state and tells the
AI service what learner event occurred.

The AI service returns the current AI-derived learning state.

------------------------------------------------------------------------

# 2. High-Level Flow

``` text
Scala Backend
     |
     | POST /ai/orchestrate
     v
Python AI Service
     |
     v
AIOrchestrator
     |
     +--> Skill Analysis Agent
     |
     +--> Learning Path Agent
     |
     +--> Roadmap Chunk Generation
     |
     +--> Resource Discovery Agent
     |
     +--> Proactive next-topic prefetch
     |
     v
OrchestrationResponse
     |
     +--> current topic
     +--> current roadmap chunk
     +--> available topics
     +--> active topic resources
     |       +--> YouTube URLs
     |       +--> general resource URLs
     |
     +--> orchestration status/action
     |
     v
Scala Backend
```

The browser should continue to communicate with the Scala backend, not
directly with the Python AI service.

------------------------------------------------------------------------

# 3. Endpoint

## `POST /ai/orchestrate`

### Protocol

-   HTTP REST
-   `Content-Type: application/json`
-   Synchronous request/response
-   Backend-to-backend

### Authentication

Authentication/authorization is owned by the Scala backend and
deployment/network layer.

The AI service should not expose AI-provider credentials or secrets to
the frontend.

------------------------------------------------------------------------

# 4. Request Contract

The current internal request model is `OrchestrationRequest`.

## JSON shape

``` json
{
  "learner_id": "psychology-demo-001",
  "event": "INITIAL_SESSION",
  "current_topic_id": null,
  "target_goal": "I want to become a behavioral science researcher specializing in how people make decisions and how cognitive biases influence behavior.",
  "context": {
    "session_id": "session-001"
  }
}
```

## Fields

  ------------------------------------------------------------------------------
  Field                Type                          Required Semantics
  -------------------- ---------------- --------------------- ------------------
  `learner_id`         string                             YES Stable learner
                                                              identifier owned
                                                              by the Scala
                                                              backend.

  `event`              string                              NO Event that
                                                              triggered
                                                              orchestration.
                                                              Defaults to
                                                              `SESSION_START`.

  `current_topic_id`   string/null                         NO Explicit
                                                              current/newly
                                                              selected topic
                                                              identifier.

  `target_goal`        string/null                         NO Optional goal
                                                              override. If
                                                              omitted, the AI
                                                              service can obtain
                                                              the learner
                                                              profile/context
                                                              using
                                                              `learner_id`.

  `context`            object                              NO Additional runtime
                                                              context. Defaults
                                                              to `{}`.
  ------------------------------------------------------------------------------

### Important

The backend **does not need to send the entire learner profile** for the
current orchestration API.

The AI service already has a learner-context layer keyed by
`learner_id`.

The old v0 contract required fields such as:

-   `current_skills`
-   `available_hours_per_week`
-   `learning_preferences`
-   `experience_level`

Those are **not required by the current `OrchestrationRequest`**.

If the backend eventually becomes the authoritative source for those
values, that can be introduced in a future contract version rather than
duplicating the profile in every orchestration request.

------------------------------------------------------------------------

# 5. Session Identification

The current runtime resolves a session identifier from the request
context.

Recommended usage:

``` json
{
  "learner_id": "learner-123",
  "event": "INITIAL_SESSION",
  "context": {
    "session_id": "session-456"
  }
}
```

The same `session_id` should be reused for subsequent events belonging
to the same orchestration session.

If no session ID is supplied, the AI service can resolve/create one
according to its internal session handling.

### Backend recommendation

For production integration, the Scala backend should generate and
persist its own stable session/correlation identifier and send it as:

`context.session_id`

------------------------------------------------------------------------

# 6. Supported Event Semantics

## 6.1 `INITIAL_SESSION`

Use when the learner first starts the personalized learning experience.

Expected behavior:

``` text
load/create orchestration state
→ analyze skills if needed
→ generate roadmap if needed
→ prepare active topic resources
→ prepare next-topic resources when selected by orchestration
→ return current state
```

The exact number of internal agent/tool steps is controlled by the AI
service's orchestration safety ceiling.

The backend should not assume that every internal action occurs in one
fixed number of steps.

------------------------------------------------------------------------

## 6.2 `SESSION_START`

Equivalent initial-session trigger supported by the current request
model.

Recommended production convention is to standardize on:

`INITIAL_SESSION`

but the current implementation accepts `SESSION_START` as the request
default.

------------------------------------------------------------------------

## 6.3 `TOPIC_COMPLETE`

Use when the learner completes the current active topic.

The current runtime:

1.  records the active topic as completed;
2.  advances the active topic to the next roadmap topic;
3.  updates the upcoming-topic queue;
4.  synchronizes the proactive prefetch target;
5.  lets the autonomous orchestrator determine the next operation.

Example:

``` json
{
  "learner_id": "learner-123",
  "event": "TOPIC_COMPLETE",
  "context": {
    "session_id": "session-456"
  }
}
```

------------------------------------------------------------------------

## 6.4 `TOPIC_COMPLETED`

The current implementation also recognizes this spelling.

For the stable backend contract, use `TOPIC_COMPLETE` unless the
implementation is later standardized.

------------------------------------------------------------------------

## 6.5 Explicit topic selection

The backend can send `current_topic_id` when it explicitly knows which
roadmap topic has become active.

Example:

``` json
{
  "learner_id": "learner-123",
  "event": "TOPIC_OPEN",
  "current_topic_id": "topic-or-module-identifier",
  "context": {
    "session_id": "session-456"
  }
}
```

The current runtime resolves the supplied identifier against known
topics and, where applicable, module identifiers.

`TOPIC_OPEN` itself is not a separate hard-coded state transition in the
current runtime; `current_topic_id` is the important field.

------------------------------------------------------------------------

# 7. Response Contract

The current public response model is `OrchestrationResponse`.

``` json
{
  "session_id": "session-456",
  "learner_id": "learner-123",
  "status": "READY",
  "active_topic": "Introduction to Psychology: History and Systems",
  "current_chunk": {
    "chunk_id": "chunk-001",
    "roadmap_id": "roadmap-001",
    "sequence_number": 1,
    "title": "Foundations of Psychology and Cognitive Science",
    "milestones": [],
    "topics": [
      "Introduction to Psychology: History and Systems",
      "Cognitive Psychology: The Science of Thinking",
      "Biological Bases of Behavior: Neuroscience Fundamentals"
    ],
    "has_more": true,
    "next_generation_hint": "Continue into cognitive and behavioral science foundations."
  },
  "available_topics": [
    "Introduction to Psychology: History and Systems",
    "Cognitive Psychology: The Science of Thinking",
    "Biological Bases of Behavior: Neuroscience Fundamentals"
  ],
  "active_resources": {
    "learner_id": "learner-123",
    "topic_id": "topic-001",
    "topic_title": "Introduction to Psychology: History and Systems",
    "youtube_resources": [],
    "general_resources": [],
    "summary": "Curated resources for the active topic."
  },
  "prefetched_topics": [
    "Cognitive Psychology: The Science of Thinking"
  ],
  "can_continue": true,
  "more_roadmap_needed": false,
  "next_recommended_action": "WAIT_FOR_LEARNER",
  "rationale": "Resources are prepared for the active topic and the learner can continue."
}
```

------------------------------------------------------------------------

# 8. Response Fields

  ----------------------------------------------------------------------------
  Field                       Type                    Semantics
  --------------------------- ----------------------- ------------------------
  `session_id`                string                  Orchestration session
                                                      identifier.

  `learner_id`                string                  Learner identifier.

  `status`                    enum                    Current orchestration
                                                      lifecycle state.

  `active_topic`              string/null             Topic currently being
                                                      studied.

  `current_chunk`             object/null             Active/latest roadmap
                                                      chunk.

  `available_topics`          array\[string\]         Topics currently
                                                      available in generated
                                                      roadmap chunks.

  `active_resources`          object/null             Curated resources for
                                                      the current active
                                                      topic.

  `prefetched_topics`         array\[string\]         Topics whose resources
                                                      have been proactively
                                                      fetched.

  `can_continue`              boolean                 Whether
                                                      orchestration/learning
                                                      can continue from the
                                                      returned state.

  `more_roadmap_needed`       boolean                 Whether another roadmap
                                                      chunk may be needed for
                                                      continued progression.

  `next_recommended_action`   enum                    Latest operational
                                                      action/state
                                                      recommendation.

  `rationale`                 string                  Concise operational
                                                      explanation.
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

# 9. Status Values

The current implementation supports:

``` text
INITIALIZING
ANALYZING_SKILLS
GENERATING_ROADMAP
PREPARING_RESOURCES
READY
PAUSED
COMPLETED
FAILED
```

### Backend handling

The backend should treat:

-   `READY` as usable learner state;
-   `PAUSED` as a resumable orchestration state;
-   `FAILED` as an AI-service failure state requiring appropriate
    backend error handling.

The backend should not hard-code assumptions about how many internal
actions produce each status.

------------------------------------------------------------------------

# 10. Action Values

The current orchestrator can return:

``` text
ANALYZE_SKILLS
GENERATE_ROADMAP_CHUNK
PREPARE_TOPIC_RESOURCES
PREFETCH_NEXT_TOPIC
RETURN_CURRENT_STATE
WAIT_FOR_LEARNER
REPLAN
COMPLETE
ERROR_RECOVERY
```

These are **AI-service operational states**, not frontend routes.

The Scala backend should not need to execute these actions itself.

------------------------------------------------------------------------

# 11. Roadmap Chunk

`current_chunk` is an incremental roadmap slice.

``` json
{
  "chunk_id": "chunk-001",
  "roadmap_id": "roadmap-001",
  "sequence_number": 1,
  "title": "Foundations of Psychology and Cognitive Science",
  "milestones": [],
  "topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ],
  "has_more": true,
  "next_generation_hint": "..."
}
```

### Semantics

The roadmap is intentionally generated incrementally.

The backend/frontend should not assume that the entire multi-month
learning path must be present in the first response.

`has_more` indicates whether additional roadmap content exists
downstream.

------------------------------------------------------------------------

# 12. Resource Contract

The current resource response is:

`TopicResourceDiscoveryResponse`

``` json
{
  "learner_id": "learner-123",
  "topic_id": "topic-001",
  "topic_title": "Introduction to Psychology",
  "youtube_resources": [
    {
      "resource_id": "resource-001",
      "title": "Introduction to Psychology",
      "url": "https://youtube.com/...",
      "resource_type": "video",
      "source": "YouTube",
      "description": "Educational introduction...",
      "relevance_score": 0.95,
      "difficulty": "beginner",
      "estimated_time": "30 mins",
      "why_recommended": [
        "Covers the core concepts required for this topic."
      ]
    }
  ],
  "general_resources": [
    {
      "resource_id": "resource-002",
      "title": "Introduction to Psychology",
      "url": "https://...",
      "resource_type": "article",
      "source": "Official Docs / Website",
      "description": "Reference material...",
      "relevance_score": 0.92,
      "difficulty": "beginner",
      "estimated_time": "20 mins",
      "why_recommended": [
        "Provides authoritative coverage of the topic."
      ]
    }
  ],
  "summary": "Curated resources selected for the learner."
}
```

## `LearningResource`

  ------------------------------------------------------------------------------------
  Field               Type                           Required Semantics
  ------------------- ----------------- --------------------- ------------------------
  `resource_id`       string                              YES Unique resource
                                                              identifier.

  `title`             string                              YES Resource title.

  `url`               string                              YES Canonical resource URL.

  `resource_type`     enum                                YES `video`,
                                                              `documentation`,
                                                              `article`, `tutorial`,
                                                              `course`, `book`,
                                                              `practice`, `project`.

  `source`            string                              YES Platform/domain/source
                                                              label.

  `description`       string/null                          NO Resource
                                                              description/snippet.

  `relevance_score`   number 0..1                         YES Resource relevance
                                                              score.

  `difficulty`        enum/null                            NO `beginner`,
                                                              `intermediate`,
                                                              `advanced`.

  `estimated_time`    string/null                          NO Approximate
                                                              completion/watch time.

  `why_recommended`   array\[string\]                      NO Recommendation reasons.
  ------------------------------------------------------------------------------------

### URL guarantee

A returned `LearningResource.url` is the URL that the backend/frontend
can use to access the resource.

For YouTube resources, this is the YouTube URL returned by the
resource-discovery pipeline.

For general resources, this is the discovered canonical web URL.

------------------------------------------------------------------------

# 13. Important Prefetch Semantics

The AI service uses a runtime-owned concept:

`prefetch_target_topic`

The runtime determines the next eligible roadmap topic. The autonomous
agent is given that target and can choose `PREFETCH_NEXT_TOPIC`.

The agent is **not responsible for calculating roadmap ordering**.

The intended learning experience is proactive rather than strictly
one-topic-at-a-time:

``` text
Learner is studying Topic 1
        |
        v
Runtime identifies the next eligible topic
        |
        v
prefetch_target_topic = Topic 2
        |
        v
Agno decides to prefetch Topic 2
        |
        v
Topic 2 resources are discovered and stored
        |
        v
runtime advances the prefetch target
        |
        v
Topic 3 can become the next prefetch target
```

The implementation may build a **small forward resource buffer** during
an orchestration run. Therefore `prefetched_topics` may contain more
than one upcoming topic.

This does **not** mean the backend must calculate or manage the
prefetch queue. The backend only consumes the returned
`prefetched_topics` and active resources.

When the learner reaches a prefetched topic, its already-discovered
resources should be reused as the active resources rather than
discovered again unnecessarily.

`prefetch_target_topic` is an internal implementation detail and is not
part of the backend request/response contract.

------------------------------------------------------------------------

# 14. What the Backend Must Persist

The Scala backend should remain the authoritative owner of
application/business state.

At minimum it should retain:

-   learner identifier
-   orchestration session/correlation ID
-   roadmap/application identifiers as needed by the backend
-   learner progress/completion state
-   the AI-service response or the relevant persisted portions

The Python service also has internal orchestration-state persistence.

The two persistence responsibilities should not be conflated.

The Scala backend remains authoritative for learner/application state.

The Python service maintains the state necessary to continue AI
orchestration.

------------------------------------------------------------------------

# 15. Initial Session Example

## Request

``` http
POST /ai/orchestrate
Content-Type: application/json
```

``` json
{
  "learner_id": "learner-1049",
  "event": "INITIAL_SESSION",
  "target_goal": "Become a behavioral science researcher specializing in decision-making and cognitive biases.",
  "context": {
    "session_id": "session-1049-001"
  }
}
```

## Response

``` json
{
  "session_id": "session-1049-001",
  "learner_id": "learner-1049",
  "status": "READY",
  "active_topic": "Introduction to Psychology",
  "current_chunk": {
    "chunk_id": "chunk-001",
    "roadmap_id": "roadmap-001",
    "sequence_number": 1,
    "title": "Foundations of Psychology and Cognitive Science",
    "milestones": [],
    "topics": [
      "Introduction to Psychology",
      "Cognitive Psychology",
      "Biological Bases of Behavior"
    ],
    "has_more": true,
    "next_generation_hint": null
  },
  "available_topics": [
    "Introduction to Psychology",
    "Cognitive Psychology",
    "Biological Bases of Behavior"
  ],
  "active_resources": {
    "learner_id": "learner-1049",
    "topic_id": "topic-001",
    "topic_title": "Introduction to Psychology",
    "youtube_resources": [],
    "general_resources": [],
    "summary": "Curated resources for the active topic."
  },
  "prefetched_topics": [
    "Cognitive Psychology"
  ],
  "can_continue": true,
  "more_roadmap_needed": false,
  "next_recommended_action": "WAIT_FOR_LEARNER",
  "rationale": "The active topic is ready for learner engagement."
}
```

The exact generated topics/resources are dynamic and must not be
hard-coded by the backend.

------------------------------------------------------------------------

# 16. Topic Completion Example

## Request

``` json
{
  "learner_id": "learner-1049",
  "event": "TOPIC_COMPLETE",
  "context": {
    "session_id": "session-1049-001"
  }
}
```

## Expected semantic behavior

``` text
Topic 1 marked completed
        |
        v
Topic 2 becomes active
        |
        v
Topic 2's prefetched resources are reused
        |
        v
runtime advances the prefetch target
        |
        v
orchestrator proactively prepares upcoming topic resources
        |
        v
response exposes Topic 2 as active
and its resources as active_resources
```

The AI service may prefetch one or more upcoming eligible topics. The
backend does not need to separately call a "prefetch endpoint" for this
flow.

------------------------------------------------------------------------

# 17. Topic Resources Returned to Frontend

The frontend should consume:

``` text
response.active_resources.youtube_resources
response.active_resources.general_resources
```

and each item exposes:

``` text
resource.title
resource.url
resource.resource_type
resource.source
resource.description
resource.relevance_score
resource.difficulty
resource.estimated_time
resource.why_recommended
```

The frontend should not call YouTube/search providers itself.

------------------------------------------------------------------------

# 18. Error Contract --- Current State

The current `OrchestrationResponse` represents an unsuccessful
orchestration through:

``` json
{
  "status": "FAILED",
  "next_recommended_action": "ERROR_RECOVERY",
  "can_continue": false
}
```

However, the current repository does **not yet define a dedicated HTTP
error envelope** such as RFC 7807.

Therefore this contract intentionally does **not** invent one.

### Future contract work

A production API should standardize:

-   validation errors
-   authentication/authorization errors
-   downstream resource-provider failures
-   LLM/provider failures
-   orchestration failures
-   correlation IDs

before declaring the contract final.

------------------------------------------------------------------------

# 19. What Is NOT Part of This Contract

The following remain internal:

-   `AutonomousOrchestratorAgent`
-   Agno configuration
-   Mistral model configuration
-   agent prompts
-   tool implementations
-   resource search providers
-   internal orchestration state fields such as `prefetch_target_topic`
-   internal error-recovery mechanics
-   Python database implementation details

The backend consumes the public request/response boundary.

------------------------------------------------------------------------

# 20. Relationship to the Old Mock Contract v0

The old contract used:

`POST /ai/generate-learning-path`

with a large request containing:

-   current skills
-   weekly hours
-   learning preferences
-   experience level
-   career aspirations

and returned a static-style `LearningPathResponse` with
milestones/modules.

That contract is retained only as historical/reference material.

The current orchestration implementation has moved beyond that design.

### Current direction

``` text
OLD v0

POST /ai/generate-learning-path
        ↓
LearningPathResponse


CURRENT v1

POST /ai/orchestrate
        ↓
event-driven orchestration
        ↓
skill analysis
        ↓
roadmap generation
        ↓
topic resources
        ↓
prefetch/progression
        ↓
OrchestrationResponse
```

The old contract explicitly described itself as temporary/mock and
stated that external resource links were out of scope. The current
implementation now includes topic-level YouTube and general resource
discovery, so the old response cannot be treated as the complete current
contract.

------------------------------------------------------------------------

# 21. HTTP Integration / Production Hardening

The orchestration endpoint is currently exposed as:

`POST /ai/orchestrate`

and has been exercised successfully through the running FastAPI/Uvicorn
service.

The following are **production-hardening items**, not reasons to create
another AI endpoint:

1. Standardized HTTP status codes for validation and service failures.
2. Dedicated HTTP error envelope.
3. Authentication/service-to-service authorization.
4. Request timeout policy.
5. Production logging/correlation policy.
6. API-level integration tests.
7. Backend integration test against the real endpoint.

The backend should integrate through the single orchestration endpoint
rather than calling individual Python agents or resource providers.

------------------------------------------------------------------------

# 22. Backend Developer Integration Summary

The Scala backend should initially need only:

### Request

``` text
POST /ai/orchestrate
```

with:

``` json
{
  "learner_id": "...",
  "event": "INITIAL_SESSION | TOPIC_COMPLETE",
  "current_topic_id": null,
  "target_goal": "...",
  "context": {
    "session_id": "..."
  }
}
```

### Response

Consume:

``` text
session_id
status
active_topic
current_chunk
available_topics
active_resources
prefetched_topics
can_continue
more_roadmap_needed
next_recommended_action
rationale
```

### Most important resource paths

``` text
active_resources.youtube_resources[*].url
active_resources.general_resources[*].url
```

### Progression

``` text
INITIAL_SESSION
    ↓
AI service analyzes learner + generates roadmap
    ↓
active Topic 1 resources prepared
    ↓
upcoming topic resources proactively prefetched
    ↓
response returned to Scala backend
    ↓
backend/frontend displays Topic 1
    ↓
learner completes Topic 1
    ↓
TOPIC_COMPLETE
    ↓
AI service advances to Topic 2
    ↓
prefetched Topic 2 resources are reused
    ↓
AI service continues proactive prefetching
    ↓
response returned
```

The backend should not implement this progression logic itself. It
should report learner events and consume the resulting AI state.

------------------------------------------------------------------------

# 23. Contract Stability Rule

This document is the **v1 backend handoff contract** for the current
AI-service integration.

Rules:

- Keep internal implementation details out of the backend contract.
- Version breaking changes.
- Prefer additive fields for compatible changes.
- Do not make the Scala backend depend on Agno/Mistral internals.
- Do not make the Scala backend calculate resource-prefetch ordering.
- Use `POST /ai/orchestrate` as the single AI-service integration
  boundary.

The first backend integration target should be the smallest stable flow:

``` text
INITIAL_SESSION
→ personalized roadmap
→ active topic
→ active resources
→ response

TOPIC_COMPLETE
→ next active topic
→ previously prefetched resources
→ next-topic prefetch
→ response
```

That is the current end-to-end product flow supported by the
orchestration design.

# HADES AI Service — Scala Backend Integration Contract

## 1. Purpose

The Python AI Service exposes two HTTP endpoints for the Scala backend:

- `POST /ai/orchestrate` — learning orchestration, roadmap/resource progression, and state decisions.
- `POST /ai/assistant/chat` — context-aware conversational learner assistant.

Both endpoints are served by the same FastAPI application on port `8000`.

Base URL: `http://<ai-service-host>:8000`

---

## 2. POST /ai/orchestrate

### Request

```json
{
  "learner_id": "psychology-demo-001",
  "target_goal": "I want to become a behavioral science researcher specializing in how people make decisions and how cognitive biases influence behavior.",
  "event": "INITIAL_SESSION",
  "context": {
    "session_id": "docker-integration-test-001"
  }
}
```

### Request fields

| Field | Type | Required | Description |
|---|---|---|---|
| `learner_id` | string | Yes | External learner identifier |
| `target_goal` | string | Yes | Learner's target goal |
| `event` | string | Yes | Event triggering orchestration |
| `context` | object | No/variable | Additional orchestration context; session ID may be supplied here |

### Response

Response model: `OrchestrationResponse`.

Example shape observed during testing:

```json
{
  "session_id": "docker-integration-test-001",
  "learner_id": "psychology-demo-001",
  "status": "PREPARING_RESOURCES",
  "next_recommended_action": "PREPARE_TOPIC_RESOURCES",
  "active_topic": "Introduction to Psychology: History and Core Concepts",
  "active_resources": {},
  "prefetched_topics": [],
  "rationale": "..."
}
```

**Do not hard-code example values. Deserialize according to the actual `OrchestrationResponse` schema.**

---

## 3. POST /ai/assistant/chat

### Purpose

Provides a conversational assistant grounded in learner-specific context.

Before answering, the assistant retrieves:

- learner profile
- current orchestration/learning state when `session_id` is supplied
- recent persistent learner memories
- semantically relevant persistent memories for the current question

The assistant then uses Mistral to generate the response.

### Request

```json
{
  "learner_id": "psychology-demo-001",
  "session_id": "full-pipeline-001",
  "message": "Why was my current learning path recommended for my goal?"
}
```

### Request fields

| Field | Type | Required | Description |
|---|---|---|---|
| `learner_id` | string | Yes | External learner identifier |
| `session_id` | string | No | Current learning/orchestration session |
| `message` | string | Yes | Learner's conversational question |

### Response

```json
{
  "learner_id": "psychology-demo-001",
  "session_id": "full-pipeline-001",
  "message": "Your current learning path was recommended because..."
}
```

### Response fields

| Field | Type | Description |
|---|---|---|
| `learner_id` | string | Learner identifier |
| `session_id` | string/null | Session identifier supplied in the request |
| `message` | string | Contextual assistant answer |

---

## 4. Assistant behavior

The assistant can answer questions about:

- learner goal
- current skills
- interests
- learning preferences
- current learning state
- roadmap/topic relevance
- why a topic was recommended
- why a recommendation is relevant
- previous learning context available in persistent memory
- resource/recommendation reasoning when supporting context exists

For decision explanations, it uses available evidence from:

- learner profile
- skill analysis
- learning path
- current orchestration state
- resource metadata
- persistent memories

It must not invent learner history or expose hidden chain-of-thought/internal reasoning.

If an exact historical rationale is unavailable, it should distinguish a recorded rationale from an explanation inferred from available learner context.

---

## 5. Error behavior

### `/ai/orchestrate`

- Success → HTTP `200`
- Unexpected orchestration failure → HTTP `500`

### `/ai/assistant/chat`

- Success → HTTP `200`
- Invalid input → HTTP `400`
- Unexpected assistant failure → HTTP `500`

Do not infer orchestration outcome from HTTP status alone. Inspect the response body's `status` and other fields.

---

## 6. Service topology

Both endpoints belong to the same Python FastAPI process:

```text
AI Service :8000
├── GET  /health
├── POST /ai/orchestrate
└── POST /ai/assistant/chat
```

There is no separate assistant server or assistant port.

```text
Scala Backend
      |
      | HTTP
      v
Python AI Service :8000
      |
      +--> Orchestrator
      +--> Learner Assistant
      +--> PostgreSQL + pgvector
      +--> Mistral
```

---

## 7. Recommended Scala integration

The Scala backend should remain the application-facing boundary:

```text
Frontend
   |
   v
Scala Backend
   |
   +---- POST /ai/orchestrate ------> Python AI Service
   |
   +---- POST /ai/assistant/chat ---> Python AI Service
```

The Scala backend should not communicate directly with Mistral or the AI service's PostgreSQL memory tables.

For assistant requests, forward the authenticated learner's external `learner_id`, the relevant `session_id` when available, and the user's message.

---

## 8. Container networking

When the AI service runs in Docker alongside PostgreSQL, PostgreSQL is reachable as:

`hcl-postgres:5432`

The AI service is exposed on:

`8000`

The project's `.dockerignore` excludes `.env`; environment variables should be injected at container runtime rather than baked into the image.

---

## 9. Verified status

Verified during integration testing:

- Dockerized AI service starts successfully.
- `/health` returns HTTP `200`.
- `/ai/orchestrate` returns HTTP `200` from the containerized service.
- `/ai/assistant/chat` returns HTTP `200` from the containerized service.
- PostgreSQL connectivity works from the container.
- Learner context retrieval works.
- Persistent memory retrieval uses PostgreSQL/pgvector.
- Assistant personalization works.
- Assistant decision-explanation behavior works.
- Both AI endpoints run on the same port/process.

## Stable integration boundary

```text
POST /ai/orchestrate
POST /ai/assistant/chat
```

These are the endpoints for Scala backend integration.

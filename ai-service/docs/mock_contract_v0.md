# Mock AI-Service Contract Specification (v0 — Temporary)

**Status:** Temporary / Mock Contract v0  
**Scope:** `POST /ai/generate-learning-path`  
**Purpose:** Internal development contract to unblock parallel development between the Scala Backend and the Python AI Reasoning Service. This is **NOT** the final production Scala ↔ Python contract.

---

## 1. Overview & Protocol Boundary

The Python AI service acts as a backend-to-backend reasoning engine. The Scala backend initiates calls on behalf of authenticated learners.

* **Endpoint:** `POST /ai/generate-learning-path`
* **Content-Type:** `application/json`
* **Protocol:** HTTP REST (Synchronous JSON Request / Response)

---

## 2. Request Schema

### 2.1 JSON Schema Specification (`GenerateLearningPathRequest`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "GenerateLearningPathRequest",
  "type": "object",
  "required": [
    "learner_id",
    "target_goal",
    "current_skills",
    "available_hours_per_week",
    "learning_preferences",
    "experience_level"
  ],
  "properties": {
    "learner_id": {
      "type": "string",
      "description": "Unique identifier of the learner in the Scala system."
    },
    "target_goal": {
      "type": "string",
      "description": "Primary learning goal or target competency."
    },
    "career_aspirations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional list of career titles or target roles."
    },
    "current_skills": {
      "type": "array",
      "description": "List of current competencies and proficiencies.",
      "items": {
        "type": "object",
        "required": ["skill_name", "level"],
        "properties": {
          "skill_name": { "type": "string" },
          "level": {
            "type": "string",
            "enum": ["beginner", "intermediate", "advanced"]
          },
          "years_of_experience": { "type": "number" }
        }
      }
    },
    "interests": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Domain or technical interests."
    },
    "available_hours_per_week": {
      "type": "number",
      "minimum": 1,
      "description": "Dedicated weekly learning hours."
    },
    "learning_preferences": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Preferred modalities (e.g., 'hands-on', 'video', 'project-based', 'reading')."
    },
    "experience_level": {
      "type": "string",
      "enum": ["beginner", "intermediate", "advanced"],
      "description": "Overall domain experience tier."
    }
  }
}
```

---

## 3. Response Schema

### 3.1 JSON Schema Specification (`LearningPathResponse`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "LearningPathResponse",
  "type": "object",
  "required": [
    "path_id",
    "learner_id",
    "target_goal",
    "title",
    "summary",
    "target_role",
    "estimated_total_weeks",
    "estimated_total_hours",
    "milestones",
    "skill_gap_analysis",
    "adaptation_rationale"
  ],
  "properties": {
    "path_id": {
      "type": "string",
      "description": "Unique identifier for the generated path."
    },
    "learner_id": {
      "type": "string",
      "description": "Learner identifier matching the request."
    },
    "target_goal": {
      "type": "string",
      "description": "Target goal as received in the request."
    },
    "title": {
      "type": "string",
      "description": "Descriptive title for the curated path."
    },
    "summary": {
      "type": "string",
      "description": "High-level summary of the journey."
    },
    "target_role": {
      "type": "string",
      "description": "Synthesized target role or outcome."
    },
    "estimated_total_weeks": {
      "type": "integer",
      "description": "Calculated total duration in weeks based on weekly pace."
    },
    "estimated_total_hours": {
      "type": "number",
      "description": "Aggregated estimated effort in hours."
    },
    "milestones": {
      "type": "array",
      "description": "Sequential milestones comprising the learning path.",
      "items": {
        "type": "object",
        "required": [
          "milestone_id",
          "order",
          "title",
          "objective",
          "prerequisite_skills",
          "modules",
          "estimated_hours"
        ],
        "properties": {
          "milestone_id": { "type": "string" },
          "order": { "type": "integer" },
          "title": { "type": "string" },
          "objective": { "type": "string" },
          "prerequisite_skills": {
            "type": "array",
            "items": { "type": "string" }
          },
          "modules": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "module_id",
                "title",
                "description",
                "topics",
                "estimated_hours",
                "learning_style",
                "key_deliverable"
              ],
              "properties": {
                "module_id": { "type": "string" },
                "title": { "type": "string" },
                "description": { "type": "string" },
                "topics": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "estimated_hours": { "type": "number" },
                "learning_style": { "type": "string" },
                "key_deliverable": { "type": "string" }
              }
            }
          },
          "estimated_hours": { "type": "number" }
        }
      }
    },
    "skill_gap_analysis": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Identified skill deficiencies between learner's current profile and target goal."
    },
    "adaptation_rationale": {
      "type": "string",
      "description": "Explanation of how current skills, time constraints, and preferences shaped this specific path."
    }
  }
}
```

---

## 4. Concrete Example Request & Response

### 4.1 Example Request Payload
```json
{
  "learner_id": "learner-1049",
  "target_goal": "Become a Backend Scala & Distributed Systems Engineer",
  "career_aspirations": [
    "Senior Distributed Systems Engineer",
    "Scala Backend Architect"
  ],
  "current_skills": [
    {
      "skill_name": "Python",
      "level": "intermediate",
      "years_of_experience": 2.5
    },
    {
      "skill_name": "SQL & Relational Databases",
      "level": "intermediate",
      "years_of_experience": 2.0
    },
    {
      "skill_name": "Git & CI/CD",
      "level": "beginner",
      "years_of_experience": 1.0
    }
  ],
  "interests": [
    "Functional Programming",
    "Event-Driven Architecture",
    "Akka/Pekko"
  ],
  "available_hours_per_week": 10,
  "learning_preferences": [
    "hands-on",
    "project-based",
    "code-walkthroughs"
  ],
  "experience_level": "intermediate"
}
```

### 4.2 Example Response Payload
```json
{
  "path_id": "path-mock-7890",
  "learner_id": "learner-1049",
  "target_goal": "Become a Backend Scala & Distributed Systems Engineer",
  "title": "Accelerated Scala & Distributed Systems Engineering Path",
  "summary": "Tailored progression path bridging intermediate Python/SQL knowledge into functional Scala, concurrency paradigms, and distributed data systems.",
  "target_role": "Backend Scala & Distributed Systems Engineer",
  "estimated_total_weeks": 14,
  "estimated_total_hours": 140,
  "milestones": [
    {
      "milestone_id": "ms-1",
      "order": 1,
      "title": "Scala Core & Functional Programming Foundations",
      "objective": "Establish mastery in Scala 3 syntax, immutable collections, higher-order functions, and typeclasses.",
      "prerequisite_skills": [
        "Object-Oriented Programming (Python)",
        "Basic Data Structures"
      ],
      "modules": [
        {
          "module_id": "mod-101",
          "title": "Scala 3 Syntax & Expressions",
          "description": "Transitioning from imperative to functional paradigms, val vs var, case classes, and pattern matching.",
          "topics": [
            "Immutability",
            "Pattern Matching",
            "Case Classes",
            "Traits & Typeclasses"
          ],
          "estimated_hours": 15,
          "learning_style": "hands-on",
          "key_deliverable": "Build an immutable CSV data transformer CLI tool in Scala 3"
        },
        {
          "module_id": "mod-102",
          "title": "Functional Collections & Error Handling",
          "description": "Working idiomatically with List, Vector, Option, Either, and Try.",
          "topics": [
            "Higher-Order Functions (map/flatMap/filter)",
            "Monadic Error Handling with Either and Try",
            "Tail Recursion"
          ],
          "estimated_hours": 20,
          "learning_style": "project-based",
          "key_deliverable": "Implement a resilient JSON configuration validator and parser"
        }
      ],
      "estimated_hours": 35
    },
    {
      "milestone_id": "ms-2",
      "order": 2,
      "title": "Concurrency & The Actor Model with Pekko/Akka",
      "objective": "Build concurrent, fault-tolerant message-driven backend services.",
      "prerequisite_skills": [
        "Scala Core & Functional Collections"
      ],
      "modules": [
        {
          "module_id": "mod-201",
          "title": "Actor Systems and Message Passing",
          "description": "Designing stateful actors, mailboxes, supervision trees, and asynchronous messaging.",
          "topics": [
            "Actor Lifecycle",
            "Supervision Strategies",
            "Ask Pattern vs Tell Pattern",
            "Pekko Streams basics"
          ],
          "estimated_hours": 30,
          "learning_style": "hands-on",
          "key_deliverable": "Construct a distributed in-memory order-processing actor pipeline"
        }
      ],
      "estimated_hours": 30
    },
    {
      "milestone_id": "ms-3",
      "order": 3,
      "title": "Distributed Systems, Event Streaming & Persistence",
      "objective": "Integrate Scala backend microservices with Kafka, event sourcing, and PostgreSQL.",
      "prerequisite_skills": [
        "SQL & Relational Databases",
        "Actor Model Basics"
      ],
      "modules": [
        {
          "module_id": "mod-301",
          "title": "Event-Driven Microservices & CQRS",
          "description": "Connecting Pekko/Akka services to Kafka event streams and persistent PostgreSQL read/write models.",
          "topics": [
            "Kafka Consumer & Producer in Scala",
            "CQRS & Event Sourcing",
            "Distributed Transactions & Idempotency"
          ],
          "estimated_hours": 40,
          "learning_style": "project-based",
          "key_deliverable": "Deploy an end-to-end event-sourced banking transaction simulator"
        }
      ],
      "estimated_hours": 40
    },
    {
      "milestone_id": "ms-4",
      "order": 4,
      "title": "Production Engineering, Observability & Performance",
      "objective": "Profile, test, and optimize Scala backend systems for enterprise production readiness.",
      "prerequisite_skills": [
        "Event-Driven Microservices"
      ],
      "modules": [
        {
          "module_id": "mod-401",
          "title": "Profiling, Metrics & Resilience Patterns",
          "description": "Applying circuit breakers, rate limiters, OpenTelemetry tracing, and JVM tuning.",
          "topics": [
            "Circuit Breakers & Retries",
            "Micrometer & Prometheus Metrics",
            "JVM Memory Profiling"
          ],
          "estimated_hours": 35,
          "learning_style": "hands-on",
          "key_deliverable": "Benchmark and harden the transaction service under high synthetic load"
        }
      ],
      "estimated_hours": 35
    }
  ],
  "skill_gap_analysis": [
    "Functional Programming paradigms in Scala 3",
    "Typeclass derivation and pattern matching",
    "Actor-based concurrency and supervision (Pekko/Akka)",
    "Distributed event streaming with Kafka & event sourcing",
    "JVM profiling and backend resilience patterns"
  ],
  "adaptation_rationale": "Leveraged 2.5 years of Python background and relational SQL skills to bypass entry-level algorithmic tutorials, allocating maximum time to functional immutability, Actor concurrency, and event-driven distributed architectures at a 10 hour/week pace."
}
```

---

## 5. Field Definitions & Semantics

### 5.1 Request Field Definitions

| Field Name | Type | Requirement | Purpose / Semantics |
| :--- | :--- | :--- | :--- |
| `learner_id` | `string` | **Required** | Scala backend identifier of the learner. Correlates logs and learner profiles. |
| `target_goal` | `string` | **Required** | Explicit target goal stated by the learner (e.g., career transition, new skill stack). |
| `career_aspirations` | `array[string]` | *Optional* | List of target job titles or roles the learner aims to attain. |
| `current_skills` | `array[object]` | **Required** | Current competencies. Each item contains `skill_name` (`string`), `level` (`"beginner"` \| `"intermediate"` \| `"advanced"`), and optional `years_of_experience` (`number`). |
| `interests` | `array[string]` | *Optional* | Sub-domains or specific frameworks the learner wants emphasized. |
| `available_hours_per_week` | `number` | **Required** | Weekly learning budget (hours/week). Governs module pace and total duration calculations. |
| `learning_preferences` | `array[string]` | **Required** | Preferred modalities (e.g., `"hands-on"`, `"project-based"`, `"reading"`, `"video"`). Guides module project formats. |
| `experience_level` | `string` | **Required** | Overall software/engineering tier (`"beginner"` \| `"intermediate"` \| `"advanced"`). |

### 5.2 Response Field Definitions

| Field Name | Type | Requirement | Purpose / Semantics |
| :--- | :--- | :--- | :--- |
| `path_id` | `string` | **Required** | Generated unique identifier for the learning path instance. |
| `learner_id` | `string` | **Required** | Echoed learner ID to guarantee correlation. |
| `target_goal` | `string` | **Required** | Target goal addressed by the generated path. |
| `title` | `string` | **Required** | Human-readable title for the generated curriculum. |
| `summary` | `string` | **Required** | Concise summary of the learning progression. |
| `target_role` | `string` | **Required** | Target career role aligned with the goal. |
| `estimated_total_weeks` | `integer` | **Required** | `ceil(estimated_total_hours / available_hours_per_week)`. |
| `estimated_total_hours` | `number` | **Required** | Sum of estimated hours across all milestones and modules. |
| `milestones` | `array[object]` | **Required** | Ordered learning phases. |
| ↳ `milestone_id` | `string` | **Required** | Unique identifier for the milestone (e.g. `ms-1`). |
| ↳ `order` | `integer` | **Required** | 1-based sequential ordering index. |
| ↳ `title` | `string` | **Required** | Milestone headline. |
| ↳ `objective` | `string` | **Required** | Specific capability unlocked upon completing this milestone. |
| ↳ `prerequisite_skills`| `array[string]` | **Required** | Skills or prior milestones required before starting this milestone. |
| ↳ `modules` | `array[object]` | **Required** | Actionable study/practice units inside the milestone. |
| ↳↳ `module_id` | `string` | **Required** | Unique module identifier. |
| ↳↳ `title` | `string` | **Required** | Module title. |
| ↳↳ `description` | `string` | **Required** | Detailed description of what is learned. |
| ↳↳ `topics` | `array[string]` | **Required** | List of granular concepts covered. |
| ↳↳ `estimated_hours` | `number` | **Required** | Hours needed to complete the module. |
| ↳↳ `learning_style` | `string` | **Required** | Modality applied (e.g. `hands-on`, `reading`). |
| ↳↳ `key_deliverable` | `string` | **Required** | Tangible project or artifact proving competency. |
| ↳ `estimated_hours` | `number` | **Required** | Sum of module hours within this milestone. |
| `skill_gap_analysis` | `array[string]` | **Required** | Explicit list of gaps identified between current skills and the target goal. |
| `adaptation_rationale` | `string` | **Required** | Narrative explaining why this specific sequence and time distribution was chosen. |

---

## 6. Assumptions

1. **Synchronous REST Communication:** The mock contract assumes synchronous HTTP POST exchange between the Scala backend and the AI service for Milestone 1.
2. **Simplified Skill Representation:** In this initial mock stage, skills are represented by human-readable names and categorical levels (`beginner`, `intermediate`, `advanced`) rather than complex taxonomy ontology IDs.
3. **No Direct External Resource Links Yet:** Specific external URL discovery and ranking (e.g., YouTube videos, Coursera courses, documentation links) belong to Milestone 2 (Resource Discovery/Ranking) and are intentionally excluded from this initial path structure.
4. **Calculated Pacing:** Total weeks are derived strictly from total required hours divided by the learner's weekly available hours.

---

## 7. Explicitly Unresolved Items (To Discuss with Scala Developer)

These items are deliberately kept open until the Scala backend team is ready to formalize the production contract:

1. **Skill Taxonomy & Identifiers:** Will Scala pass standardized UUIDs/ontology slugs (e.g., `skill_id: "sk-scala-3-fp"`) or arbitrary text strings?
2. **Persistence Ownership:** Will the Python service generate the definitive UUIDs for `path_id`, `milestone_id`, `module_id`, or will Scala assign/remap database primary keys upon persistence?
3. **Partial Updates / Path Adaptation:** How will path adaptation payloads be shaped when a learner completes a milestone or updates weekly hours (e.g., `POST /ai/adapt-learning-path` delta schema)?
4. **Error Payloads & Validation Failures:** Standardized error response contract format (RFC 7807 Problem Details vs customized error envelope) when input parameters fail domain validation.
5. **Async / Event-Driven Generation:** If deep reasoning over large skill graphs takes >5 seconds, should the contract remain synchronous HTTP or migrate to an asynchronous callback/polling/queue pattern?

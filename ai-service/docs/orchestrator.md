# HADES AI Workflow & Orchestrator Architecture (Agno 2.0)

## 1. Overview
The HADES AI Service employs the **Agno Workflow 2.0** architecture to orchestrate multi-agent reasoning, database persistence, and external discovery streams.

The architecture strictly distinguishes:
* **Agents:** Focused units of intelligence, reasoning, and tool execution (`LearnerSkillAnalysisAgent`, `LearningPathRecommendationAgent`, `ResourceDiscoveryAgent`).
* **Workflows:** Application-level stateful and parallel orchestration coordinating agents, database repositories, and external APIs (`LearningPathWorkflow`, `TopicResourceDiscoveryWorkflow`).
* **Orchestrator Facade:** Top-level interface (`AIOrchestrator` in `orchestrator.py`) exposing the domain workflows.

---

## 2. Workflows Implemented

### 2.1 Learning Path Workflow (`LearningPathWorkflow`)
Orchestrates end-to-end personalized curriculum generation:
```
PostgreSQL Context (get_learner_context)
       │
       ▼
Skill Analysis Agent (deterministic gap & prerequisite calculation)
       │
       ▼
Learning Path Agent (RoadmapAdapter / Mistral Large generation)
       │
       ▼
Persistent Memory (save_memory)
       │
       ▼
Validated LearningPathResponse
```

### 2.2 Topic Resource Discovery Workflow (`TopicResourceDiscoveryWorkflow`)
Orchestrates on-demand parallel resource discovery for an active topic:
```
Active Topic Request
       │
Prepare Context Step (QueryBuilder)
       │
┌──────┴───────────────────────────┐
│ Parallel Execution (Agno Parallel)│
│  ├── YouTube Tavily Search       │
│  └── General Docs Tavily Search  │
└──────┬───────────────────────────┘
       │
Merge & Deterministic Rank Step
       │
Synthesize Summary Step
       │
       ▼
TopicResourceDiscoveryResponse
```

---


## 3. Mock Contract Specification (Milestone 1)

### Request Schema (`GenerateLearningPathRequest`)
```json
{
  "learner_id": "learner-123",
  "target_goal": "Become a Backend Scala & Distributed Systems Engineer",
  "career_aspirations": ["Senior Backend Engineer"],
  "current_skills": [
    { "skill_name": "Python", "level": "intermediate", "years_of_experience": 2.0 },
    { "skill_name": "SQL", "level": "beginner", "years_of_experience": 0.5 }
  ],
  "interests": ["Functional Programming", "Akka", "Distributed Systems"],
  "available_hours_per_week": 10,
  "learning_preferences": ["hands-on", "project-based"],
  "experience_level": "intermediate"
}
```

### Response Schema (`LearningPathResponse`)
```json
{
  "path_id": "path-a1b2c3d4",
  "learner_id": "learner-123",
  "target_goal": "Become a Backend Scala & Distributed Systems Engineer",
  "title": "Tailored Scala & Distributed Systems Roadmap",
  "summary": "Progressive path bridging Python foundations to functional Scala and distributed architectures.",
  "target_role": "Backend Scala Engineer",
  "estimated_total_weeks": 14,
  "estimated_total_hours": 140,
  "milestones": [
    {
      "milestone_id": "ms-1",
      "order": 1,
      "title": "Scala Foundations & Functional Paradigms",
      "objective": "Master Scala syntax, immutability, pattern matching, and typeclasses.",
      "prerequisite_skills": ["Object-Oriented Programming basics"],
      "modules": [
        {
          "module_id": "mod-1",
          "title": "Scala 3 Syntax and Idiomatic Constructs",
          "description": "Deep dive into case classes, traits, and functional collections.",
          "topics": ["Immutability", "Pattern Matching", "Higher-Order Functions"],
          "estimated_hours": 20,
          "learning_style": "hands-on",
          "key_deliverable": "Build a functional CLI data processor in Scala"
        }
      ],
      "estimated_hours": 35
    }
  ],
  "skill_gap_analysis": [
    "Functional Programming in Scala",
    "Actor Model & Concurrency (Akka/Pekko)",
    "Distributed Consensus & Event Streaming"
  ],
  "adaptation_rationale": "Leveraged intermediate Python background to accelerate general programming concepts and focused hours on Scala functional paradigms and distributed systems patterns."
}
```

---

## 4. Running and Testing the AI Service

### Starting the FastAPI Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Endpoints
* `GET /health` — Service health check and active model info.
* `POST /ai/generate-learning-path` — Generate a personalized learning path.
* `GET /ai/docs` — Interactive Swagger UI documentation.

### Running Automated Tests
```bash
python -m pytest tests/ -v
```
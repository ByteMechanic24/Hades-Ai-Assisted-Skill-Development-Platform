# Learner / Skill Analysis Agent Documentation (Step 3A — Simplified Live Agent-Driven Architecture)

**Status:** Step 3A Refactored & Live (Agno 2.x + Mistral Structured Output)  
**Role:** Dynamic, agent-driven skill requirement determination, prerequisite reasoning, and already-learned skill matching.  
**Location:** [`ai-service/app/agents/skill_analysis_agent.py`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/agents/skill_analysis_agent.py)

---

## 1. Overview & Core Principles

The **Skill Analysis Agent** answers the core question:
> *"For this learner's target goal, what knowledge/skills/topics are genuinely required, what logical prerequisite sequence should be followed, and which topics has the learner already learned?"*

### Key Architectural Tenets:
* **Dynamic Agent-Driven Analysis:** The Skill Analysis Agent dynamically determines goal-relevant skills for **ANY** arbitrary learner-defined goal using the real LLM (Agno + Mistral).
* **No Static Goal Catalog:** No hardcoded goal-to-skills lookup table is used in runtime.
* **No Static Prerequisite Catalog:** Prerequisite reasoning is performed by the LLM as part of its cognitive reasoning about the learning sequence.
* **Learner Skills as Already-Learned Indicators:** Recorded learner skills from PostgreSQL are used strictly as indicators of what the learner has already learned, without proficiency ranking or scoring (no beginner/intermediate/advanced thresholding).
* **Lightweight Normalization:** Deterministic logic is limited to lightweight normalization and matching in [`match_learner_skills`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/tools/analysis_tools.py).
* **Live Runtime Only:** No fallback to `"mock-key"` or mock catalogs; missing credentials fail cleanly.

---

## 2. Agent Workflow & Execution Pipeline

```
                [Learner ID / external_id]
                            │
                            ▼
              ┌───────────────────────────┐
              │   PostgreSQL Database     │
              │  (learners, goals, skills)│
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   get_learner_context()   │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │      LearnerProfile       │
              └─────────────┬─────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      LearnerSkillAnalysisAgent        │
        │      (Agno 2.x + Mistral Model)       │
        │   -> Structured GoalSkillReasoning    │
        └───────────────────┬───────────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │    match_learner_skills   │
              │  (Lightweight Normalizer) │
              └─────────────┬─────────────┘
                            │
                            ▼
           [ Structured SkillAnalysis Output ]
             - learner_id
             - target_goal
             - required_skills
             - already_learned
             - skills_to_learn
             - prerequisite_sequence
             - analysis_summary
```

---

## 3. Data Contracts & Schemas

### GoalSkillReasoning (Agent Structured Output)
```python
class GoalSkillReasoning(BaseModel):
    required_skills: List[str]
    prerequisite_sequence: List[str]
    reasoning_summary: str
```

### SkillAnalysis (Step 3A Output Model)
```python
class SkillAnalysis(BaseModel):
    learner_id: str
    target_goal: str
    current_skills: List[SkillItem]
    required_skills: List[str]
    already_learned: List[str]
    skills_to_learn: List[str]
    prerequisite_sequence: List[str]
    analysis_summary: str
    
    # Backward compatibility aliases
    covered_skills: List[str]
    missing_skills: List[str]
    insufficient_skills: List[str]
    prerequisite_gaps: List[str]
```

---

## 4. Implementation Status & Scope Boundaries

| Capability | Status | Implementation Details |
|---|---|---|
| PostgreSQL Connection & Pool | **IMPLEMENTED (Step 4A.1)** | `app.db.connection.DatabaseManager` with `psycopg-pool` |
| Learner Context Repository | **IMPLEMENTED (Step 4A.2)** | `app.db.learner_context.get_learner_context` |
| Real DB Context in Skill Agent | **IMPLEMENTED (Step 4A.4)** | `LearnerSkillAnalysisAgent.analyze_learner` calls `get_learner_context` |
| Dynamic LLM Skill Reasoning | **IMPLEMENTED (Step 3A)** | `Agno` + `MistralChat` with `output_schema=GoalSkillReasoning` |
| Lightweight Matching & Normalization | **IMPLEMENTED (Step 3A)** | `app.tools.analysis_tools.match_learner_skills` |
| Isolated Mock Tools (Test-Only) | **ISOLATED** | `app.tools.mock_tools` preserved for legacy/isolated unit tests only |
| Learning Path Agent | **IMPLEMENTED (Step 3B)** | Downstream roadmap integration consuming `SkillAnalysis` |

---

## 5. Verification & Testing

All unit and live integration tests pass:
* `tests/test_skill_analysis_agent.py` — Verifies missing credentials fail clearly (`ConfigurationError`), skill matching normalization without proficiency scoring, arbitrary novel goal analysis with injected agent, unknown learner handling (`LearnerNotFoundError`), and live PostgreSQL + Mistral integration on `psychology-demo-001` and `learner-1049`.
* `tests/test_learner_context.py` — Repository unit and live PostgreSQL integration tests.
* `tests/test_db_connection.py` — Database connectivity, health checks, and pooling tests.
* `tests/test_analysis_tools.py` — Deterministic skill matching and legacy utility tests.
* `tests/test_learning_path_agent.py` — Step 3B recommendation agent tests.



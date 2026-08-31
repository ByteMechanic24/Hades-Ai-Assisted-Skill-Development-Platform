# Learning Path Recommendation Agent Documentation (Step 3B)

**Status:** Step 3B Complete  
**Framework:** Agno + Mistral AI (Small & Large) + Roadmap.sh Hybrid Ingestion  
**Role:** Generates/curates structured learning roadmaps via roadmap.sh (Branch A) or custom LLM generation (Branch B).  
**Location:** [`ai-service/app/agents/learning_path_agent.py`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/agents/learning_path_agent.py)

---

## 1. Overview & Core Decision Flow

The **Learning Path Recommendation Agent** turns a learner's profile, target goal, prerequisite graph, and Step 3A skill analysis into a validated, structured [`LearningPathResponse`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/schemas/models.py).

```
                      [Learner Profile + Skill Analysis]
                                      │
                                      ▼
                        search_roadmaps(target_goal)
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼ (Match found >= 0.7)                    ▼ (No roadmap found)
      [ Branch A: Roadmap.sh ]                  [ Branch B: Custom Fallback ]
                 │                                         │
                 ▼                                         ▼
      get_roadmap(identifier)                   Mistral Large Generator
  (Preserve sequence & content)             (Topic-by-topic prerequisite path)
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
                           validate_learning_path
                                      │
                                      ▼
                       [ Validated LearningPathResponse ]
```

---

## 2. Roadmap.sh Hybrid Architecture

Implemented via [`app/adapters/roadmap_adapter.py`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/adapters/roadmap_adapter.py):
1. **GitHub Source Primary:** Ingests official JSON/canonical definitions from roadmap.sh.
2. **Website Fallback:** Ingests public web structure if GitHub source is unreachable.
3. **Sequence Preservation:** Preserves canonical topic order without rewriting or altering educational sequences.

---

## 3. Two-Branch Execution Strategy

### Branch A: Existing Roadmap.sh Curriculum
* **Condition:** A matching roadmap exists with `match_score >= 0.7` (e.g. `"Become a Data Engineer"`, `"Full Stack Web Developer"`).
* **Behavior:**
  * Transforms roadmap nodes faithfully into `milestones` and sub-nodes into `modules`.
  * Computes total weeks based on `available_hours_per_week`.
  * Injects `skill_gap_analysis` and `adaptation_rationale`.
  * Does **not** invoke Mistral Large, minimizing LLM latency and cost.

### Branch B: Custom Fallback Generation
* **Condition:** No direct roadmap.sh template exists (e.g. niche or composite stacks like `"Become a Backend Scala & Distributed Systems Engineer"`).
* **Behavior:**
  * Uses Mistral Large reasoning to generate a custom, topic-by-topic curriculum.
  * Organizes prerequisite gaps into progressive milestone phases.
  * Formulates actionable modules with learning style deliverables and estimated hours.

---

## 4. Deterministic Validation

Implemented in [`app/tools/roadmap_tools.py`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/tools/roadmap_tools.py) via `validate_learning_path`:
* Verifies non-empty IDs, titles, summaries, and deliverables.
* Verifies sequential 1-based milestone ordering.
* Verifies that milestone hours equal sum of module hours.
* Verifies that total path hours equal sum of milestone hours.
* Verifies positive weekly duration calculation.

---

## 5. Test Verification

41 automated tests passing via `pytest`:
* `tests/test_analysis_tools.py` (10 tests)
* `tests/test_mock_tools.py` (14 tests)
* `tests/test_skill_analysis_agent.py` (5 tests)
* `tests/test_roadmap_adapter.py` (9 tests)
* `tests/test_learning_path_agent.py` (3 tests)

# Tool Layer Documentation (Step 2 — Mock Data Adapters)

**Status:** Step 2 Complete (Deterministic Mock Layer)  
**Consumer:** Agno Learning Path Agent (Step 3)  
**Location:** [`ai-service/app/tools/`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/tools)

---

## 1. Overview & Purpose

The Tool Layer provides typed, deterministic data access capabilities for the Hades AI reasoning pipeline. 

In this development phase (Step 2), the tools return isolated, in-memory mock data conforming to the [Step 1 Contract Specification](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/docs/mock_contract_v0.md). 

### Key Architectural Characteristics:
* **Separation of Concerns:** Tools only perform data retrieval and validation. They do **not** perform LLM reasoning, curriculum design, or path generation.
* **Deterministic & Offline:** No external databases (PostgreSQL, pgvector, Redis), LLM providers (Mistral), or Scala services are required.
* **Replaceable Interfaces:** The tool signatures and return models are decoupled from the underlying storage mechanism. When production Scala/PostgreSQL integrations are ready, only the internal retrieval logic inside the tools needs to be updated.
* **Agent-Ready:** In Step 3, these tool functions will be bound to the **Agno Learning Path Agent** to provide context during autonomous reasoning.

---

## 2. Implemented Tools

### 2.1 `get_learner_profile`
* **Function Signature:** `get_learner_profile(learner_id: str) -> LearnerProfile`
* **Purpose:** Retrieves the learner's declared goals, weekly time commitments, interests, learning preferences, and current skill summary.
* **Inputs:**
  * `learner_id` (`str`): Unique learner identifier in the system (e.g. `"learner-1049"`).
* **Outputs (`LearnerProfile`):**
  * `learner_id`: `str`
  * `target_goal`: `str`
  * `career_aspirations`: `List[str]`
  * `current_skills`: `List[SkillItem]`
  * `interests`: `List[str]`
  * `available_hours_per_week`: `float`
  * `learning_preferences`: `List[str]`
  * `experience_level`: `Literal["beginner", "intermediate", "advanced"]`
* **Error Handling:** Raises `LearnerNotFoundError` if the learner ID is unknown or empty.

---

### 2.2 `get_learner_skills`
* **Function Signature:** `get_learner_skills(learner_id: str) -> List[SkillItem]`
* **Purpose:** Extracts just the existing competencies and proficiency levels for the learner.
* **Inputs:**
  * `learner_id` (`str`): Unique learner identifier.
* **Outputs (`List[SkillItem]`):**
  * List of items with `skill_name` (`str`), `level` (`beginner|intermediate|advanced`), and `years_of_experience` (`Optional[float]`).
* **Error Handling:** Raises `LearnerNotFoundError` if the learner ID is unknown.

---

### 2.3 `get_goal_requirements`
* **Function Signature:** `get_goal_requirements(goal: str) -> GoalRequirements`
* **Purpose:** Retrieves the standard required competencies, recommended baseline experience level, and domain category for a targeted career or learning goal.
* **Inputs:**
  * `goal` (`str`): Goal description or career target (e.g. `"Become a Backend Scala & Distributed Systems Engineer"`). Lookup is normalized and case-insensitive.
* **Outputs (`GoalRequirements`):**
  * `goal`: `str`
  * `required_skills`: `List[str]`
  * `recommended_experience_level`: `str`
  * `domain`: `str`
* **Error Handling:** Raises `GoalNotFoundError` if the goal is unrecognized in the knowledge base.

---

### 2.4 `get_skill_prerequisites`
* **Function Signature:** `get_skill_prerequisites(skill_name: str) -> SkillPrerequisites`
* **Purpose:** Traverses the prerequisite graph for a specified skill to identify direct dependencies.
* **Inputs:**
  * `skill_name` (`str`): Name of the skill to query (e.g. `"Scala 3"`, `"Git & CI/CD"`). Lookup is normalized and case-insensitive.
* **Outputs (`SkillPrerequisites`):**
  * `skill_name`: `str`
  * `prerequisites`: `List[str]` (empty list `[]` for foundational skills with no prerequisites).
  * `category`: `str` (e.g., `"Programming Languages"`, `"Foundations"`).
* **Error Handling:** Raises `SkillNotFoundError` if the skill is not in the knowledge graph.

---

## 3. Custom Domain Exceptions

Defined in [`app/tools/exceptions.py`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/tools/exceptions.py):

* **`ToolError`**: Base exception class.
* **`LearnerNotFoundError`**: Raised on non-existent learner IDs.
* **`GoalNotFoundError`**: Raised on unsupported goals.
* **`SkillNotFoundError`**: Raised on unrecognized skills.

---

## 4. Consumption in Next Steps (Step 3: Learning Path Agent)

In Step 3, the Agno `Agent` will be configured with these 4 Python functions as native tools:

```python
# Conceptual Step 3 Agent binding (Do NOT implement yet)
agent = Agent(
    model=...,
    tools=[
        get_learner_profile,
        get_learner_skills,
        get_goal_requirements,
        get_skill_prerequisites,
    ],
    ...
)
```

The agent will invoke these tools to inspect learner capabilities, retrieve prerequisite trees, compute skill gaps, and assemble the structured `LearningPathResponse`.

# Step 1 Complete: Mock AI-Service Contracts Defined Response

**Author:** Assistant  
**Task:** Step 1 — Contract Design Report

---

### Step 1 Complete: Mock AI-Service Contracts Defined

In strict accordance with the Step 1 scope and project constraints, the temporary mock data contract for the first AI-service capability (`POST /ai/generate-learning-path`) has been defined and documented. No application logic, agents, tools, or endpoints have been implemented yet.

---

### 1. Contract Documentation Created
* **Document:** `ai-service/docs/mock_contract_v0.md`
* **Initial Dependency Manifest:** `requirements.txt`

---

### 2. Request & Response Structures Defined

#### A. Request Structure (`GenerateLearningPathRequest`)
* **`learner_id`** (`string`, Required): Unique learner identifier in the Scala backend.
* **`target_goal`** (`string`, Required): Primary career or learning target.
* **`career_aspirations`** (`array[string]`, Optional): Specific target roles (e.g., `"Senior Backend Engineer"`).
* **`current_skills`** (`array[object]`, Required): List of existing competencies (`skill_name`, `level` (`beginner|intermediate|advanced`), optional `years_of_experience`).
* **`interests`** (`array[string]`, Optional): Domain preferences or specific tech stacks.
* **`available_hours_per_week`** (`number`, Required): Weekly available study hours (controls pacing).
* **`learning_preferences`** (`array[string]`, Required): Preferred modalities (e.g., `hands-on`, `project-based`, `reading`).
* **`experience_level`** (`string`, Required): Overall engineering tier (`beginner|intermediate|advanced`).

#### B. Response Structure (`LearningPathResponse`)
* **`path_id`** (`string`, Required): Unique generated path identifier.
* **`learner_id`** (`string`, Required): Echoed learner identifier for correlation.
* **`target_goal`** (`string`, Required): Echoed target goal.
* **`title`** (`string`, Required): Human-readable curriculum title.
* **`summary`** (`string`, Required): Narrative overview of the journey.
* **`target_role`** (`string`, Required): Synthesized target job profile.
* **`estimated_total_weeks`** (`integer`, Required): Calculated total duration based on pace.
* **`estimated_total_hours`** (`number`, Required): Total cumulative effort in hours.
* **`milestones`** (`array[object]`, Required): Ordered learning phases containing:
  * `milestone_id`, `order`, `title`, `objective`, `estimated_hours`
  * `prerequisite_skills`: Array of skills required before beginning the milestone
  * `modules`: Array of granular actionable units (`module_id`, `title`, `description`, `topics`, `estimated_hours`, `learning_style`, `key_deliverable`)
* **`skill_gap_analysis`** (`array[string]`, Required): Deficiencies identified between current profile and target goal.
* **`adaptation_rationale`** (`string`, Required): Explanation of why this specific sequence and timeline was chosen.

*(A complete, concrete example request/response payload with technical engineering milestones is included in `ai-service/docs/mock_contract_v0.md`).*

---

### 3. Assumptions Made
1. **Synchronous HTTP Communication:** For this initial mock milestone, the Scala backend and AI service communicate via standard synchronous REST (`POST /ai/generate-learning-path`).
2. **Simplified Skill Representation:** Competencies use plain strings and standard level tiers (`beginner`, `intermediate`, `advanced`) rather than complex external taxonomy IDs.
3. **No Direct External Resource URLs Yet:** External resource discovery (videos, articles, courses) belongs to Milestone 2 and is intentionally decoupled from this initial path structure.
4. **Deterministic Pace Derivation:** `estimated_total_weeks` is calculated as `ceil(estimated_total_hours / available_hours_per_week)`.

---

### 4. Unresolved Decisions (For Discussion with Scala Developer)
1. **Taxonomy Identifiers:** Will the Scala backend supply standardized taxonomy IDs (e.g. `sk_scala_3_fp`) or arbitrary strings?
2. **Entity ID Ownership:** Should the AI service produce definitive UUIDs for `path_id`/`milestone_id`/`module_id`, or will Scala assign/map database primary keys during persistence?
3. **Adaptation Contract Format:** When adapting an active path (Milestone 3+), will Scala send the existing `path_id` with progress delta, or the entire path object?
4. **Async vs Sync SLA:** If skill graph traversal and LLM generation take >5s, should the production API remain synchronous or transition to an async task/polling mechanism?

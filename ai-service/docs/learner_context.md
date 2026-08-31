# Learner Context Repository Documentation (Step 4A.2)

## 1. Overview

The `get_learner_context(external_id: str)` function acts as the dedicated repository/context retrieval layer in the Python AI service. It executes parameterized SQL queries against PostgreSQL to retrieve and assemble the persistent state of a learner into the application's domain model (`LearnerProfile`).

---

## 2. Function Signature & Location

- **Module**: `app.db.learner_context` (also exported from `app.db`)
- **Signature**:
  ```python
  def get_learner_context(
      external_id: str,
      manager: Optional[DatabaseManager] = None,
  ) -> LearnerProfile:
      ...
  ```

---

## 3. Database Tables & Relationships Read

The function queries the following relational schema tables:

1. **`learners`**:
   - Filter: `WHERE external_id = %s`
   - Fields: `id` (UUID), `external_id`, `experience_level`, `available_hours_per_week`.
2. **`learner_goals`**:
   - Filter: `WHERE learner_id = %s AND status = 'active'` (fallback: most recent goal)
   - Fields: `raw_goal`.
3. **`learner_career_aspirations`**:
   - Filter: `WHERE learner_id = %s`
   - Fields: `aspiration` (ordered by `created_at ASC`).
4. **`learner_interests`**:
   - Filter: `WHERE learner_id = %s`
   - Fields: `interest` (ordered by `created_at ASC`).
5. **`learner_learning_preferences`**:
   - Filter: `WHERE learner_id = %s`
   - Fields: `preference` (ordered by `created_at ASC`).
6. **`learner_skills` JOIN `skills`**:
   - Join: `learner_skills ls JOIN skills s ON s.id = ls.skill_id`
   - Filter: `WHERE ls.learner_id = %s`
   - Fields: `s.name`, `ls.level`, `ls.years_of_experience` (ordered by `s.name ASC`).

---

## 4. Database Row to Domain Model Mapping

| Database Entity / Column | Python `LearnerProfile` Field | Type / Representation |
|---|---|---|
| `learners.external_id` | `learner_id` | `str` |
| `learner_goals.raw_goal` | `target_goal` | `str` |
| `learner_career_aspirations.aspiration` | `career_aspirations` | `List[str]` |
| `learner_interests.interest` | `interests` | `List[str]` |
| `learner_learning_preferences.preference` | `learning_preferences` | `List[str]` |
| `learners.available_hours_per_week` | `available_hours_per_week` | `float` (converted from `Decimal`) |
| `learners.experience_level` | `experience_level` | `Literal["beginner", "intermediate", "advanced"]` |
| `learner_skills` + `skills` | `current_skills` | `List[SkillItem]` (`skill_name`, `level`, `years_of_experience: float`) |

---

## 5. Error Handling

- **Invalid / Empty `external_id`**: Raises `ValueError("external_id must be a non-empty string.")`.
- **Learner Not Found**: If no row matches `external_id` in `learners`, raises `LearnerNotFoundError` (inherits from `app.db.exceptions.DatabaseError`).
- **Connection / DB Errors**: Wrap underlying `psycopg` operational and query exceptions in sanitized `DatabaseConnectionError` and `DatabaseError`.

---

## 6. How to Run Tests

### Run Full Test Suite:
```bash
pytest -v
```

### Run Unit Tests (Mock DB / No live PostgreSQL required):
```bash
pytest -m "not integration" -v
```

### Run Database Integration Tests (Requires live PostgreSQL):
```bash
pytest -m "integration" -v
```

---

## 7. Explicit Architecture Boundaries

- **Skill Analysis Agent NOT Connected Yet:** The `LearnerSkillAnalysisAgent` (Step 3A) still uses mock input data. Connecting real DB learner context to the agent is scheduled for Step 4A.4.
- **No Embeddings / Memory:** Embeddings, vector tables, and pgvector queries are not part of this step.
- **No FastAPI Endpoints:** No REST endpoints have been implemented for DB learner retrieval.
- **No Schema / Migration Changes:** Schema `V001__initial_schema.sql` remains the single source of truth.

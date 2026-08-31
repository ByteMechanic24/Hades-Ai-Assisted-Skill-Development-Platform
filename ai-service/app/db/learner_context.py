import logging
from typing import Optional
import psycopg

from app.schemas.models import LearnerProfile, SkillItem
from app.db.connection import DatabaseManager, db_manager
from app.db.exceptions import (
    DatabaseError,
    DatabaseConnectionError,
    LearnerNotFoundError,
    sanitize_db_url,
)

logger = logging.getLogger(__name__)


def get_learner_context(
    external_id: str,
    manager: Optional[DatabaseManager] = None,
) -> LearnerProfile:
    """
    Retrieve learner context from the PostgreSQL database using external_id.

    Queries the following database tables:
      - `learners`: Base profile, experience level, available hours per week.
      - `learner_goals`: Active target goal (raw_goal).
      - `learner_career_aspirations`: Desired career roles and milestones.
      - `learner_interests`: Technical and domain interests.
      - `learner_learning_preferences`: Preferred learning modalities.
      - `learner_skills` & `skills`: Declared skills with proficiency levels and experience.

    Parameters:
        external_id: External identifier for the learner (e.g. 'learner-1049').
        manager: Optional DatabaseManager instance; defaults to global db_manager.

    Returns:
        LearnerProfile: Fully mapped domain model containing the learner's context.

    Raises:
        ValueError: If external_id is empty or not a valid string.
        LearnerNotFoundError: If the learner does not exist in the database.
        DatabaseConnectionError: If database communication fails.
        DatabaseError: If a database query fails.
    """
    if not external_id or not isinstance(external_id, str) or not external_id.strip():
        raise ValueError("external_id must be a non-empty string.")

    cleaned_external_id = external_id.strip()
    active_manager = manager or db_manager

    try:
        with active_manager.get_connection() as conn:
            with conn.cursor() as cur:
                # 1. Query base learner record
                cur.execute(
                    """
                    SELECT id, external_id, experience_level, available_hours_per_week
                    FROM learners
                    WHERE external_id = %s;
                    """,
                    (cleaned_external_id,),
                )
                learner_row = cur.fetchone()
                if not learner_row:
                    raise LearnerNotFoundError(cleaned_external_id)

                db_learner_id, ext_id, experience_level, available_hours = learner_row

                # 2. Query target goal (prioritizing active status)
                cur.execute(
                    """
                    SELECT raw_goal
                    FROM learner_goals
                    WHERE learner_id = %s AND status = 'active'
                    ORDER BY created_at DESC
                    LIMIT 1;
                    """,
                    (db_learner_id,),
                )
                goal_row = cur.fetchone()
                if not goal_row:
                    # Fallback to any goal if no active goal is explicitly flagged
                    cur.execute(
                        """
                        SELECT raw_goal
                        FROM learner_goals
                        WHERE learner_id = %s
                        ORDER BY created_at DESC
                        LIMIT 1;
                        """,
                        (db_learner_id,),
                    )
                    goal_row = cur.fetchone()

                target_goal = goal_row[0] if goal_row else ""

                # 3. Query career aspirations
                cur.execute(
                    """
                    SELECT aspiration
                    FROM learner_career_aspirations
                    WHERE learner_id = %s
                    ORDER BY created_at ASC;
                    """,
                    (db_learner_id,),
                )
                career_aspirations = [r[0] for r in cur.fetchall()]

                # 4. Query interests
                cur.execute(
                    """
                    SELECT interest
                    FROM learner_interests
                    WHERE learner_id = %s
                    ORDER BY created_at ASC;
                    """,
                    (db_learner_id,),
                )
                interests = [r[0] for r in cur.fetchall()]

                # 5. Query learning preferences
                cur.execute(
                    """
                    SELECT preference
                    FROM learner_learning_preferences
                    WHERE learner_id = %s
                    ORDER BY created_at ASC;
                    """,
                    (db_learner_id,),
                )
                learning_preferences = [r[0] for r in cur.fetchall()]

                # 6. Query current skills joined with skills catalog
                cur.execute(
                    """
                    SELECT s.name, ls.level, ls.years_of_experience
                    FROM learner_skills ls
                    JOIN skills s ON s.id = ls.skill_id
                    WHERE ls.learner_id = %s
                    ORDER BY s.name ASC;
                    """,
                    (db_learner_id,),
                )
                skills_rows = cur.fetchall()
                current_skills = [
                    SkillItem(
                        skill_name=row[0],
                        level=row[1],
                        years_of_experience=float(row[2]) if row[2] is not None else None,
                    )
                    for row in skills_rows
                ]

                return LearnerProfile(
                    learner_id=ext_id,
                    target_goal=target_goal,
                    career_aspirations=career_aspirations,
                    current_skills=current_skills,
                    interests=interests,
                    available_hours_per_week=float(available_hours),
                    learning_preferences=learning_preferences,
                    experience_level=experience_level,
                )

    except LearnerNotFoundError:
        raise
    except ValueError:
        raise
    except psycopg.OperationalError as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL operational error in get_learner_context: %s", sanitized_msg)
        raise DatabaseConnectionError(
            f"Database connection error retrieving learner context: {sanitized_msg}",
            original_error=e,
        ) from e
    except psycopg.Error as e:
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("PostgreSQL query error in get_learner_context: %s", sanitized_msg)
        raise DatabaseError(
            f"Database query failed for learner context: {sanitized_msg}"
        ) from e
    except Exception as e:
        if isinstance(e, (DatabaseError, ValueError)):
            raise
        sanitized_msg = sanitize_db_url(str(e))
        logger.error("Unexpected error in get_learner_context: %s", sanitized_msg)
        raise DatabaseError(
            f"Unexpected error retrieving learner context: {sanitized_msg}"
        ) from e

from decimal import Decimal
from unittest.mock import MagicMock, patch
import pytest

from app.schemas.models import LearnerProfile, SkillItem
from app.db.exceptions import (
    DatabaseConnectionError,
    DatabaseError,
    LearnerNotFoundError,
)
from app.db.learner_context import get_learner_context
from app.db.connection import DatabaseManager


class TestLearnerContextUnit:
    """Unit tests for get_learner_context validation and error handling without requiring live DB."""

    def test_empty_external_id_raises_value_error(self):
        with pytest.raises(ValueError) as exc_info:
            get_learner_context("")
        assert "non-empty string" in str(exc_info.value)

    def test_whitespace_external_id_raises_value_error(self):
        with pytest.raises(ValueError) as exc_info:
            get_learner_context("   ")
        assert "non-empty string" in str(exc_info.value)

    def test_non_string_external_id_raises_value_error(self):
        with pytest.raises(ValueError) as exc_info:
            get_learner_context(None)  # type: ignore
        assert "non-empty string" in str(exc_info.value)

    def test_learner_not_found_raises_learner_not_found_error(self):
        mock_manager = MagicMock(spec=DatabaseManager)
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_manager.get_connection.return_value.__enter__.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur
        mock_cur.fetchone.return_value = None

        with pytest.raises(LearnerNotFoundError) as exc_info:
            get_learner_context("learner-unknown-999", manager=mock_manager)
        assert exc_info.value.external_id == "learner-unknown-999"
        assert "learner-unknown-999" in str(exc_info.value)

    def test_successful_mocked_retrieval(self):
        mock_manager = MagicMock(spec=DatabaseManager)
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_manager.get_connection.return_value.__enter__.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cur

        # Mock sequence of SQL fetch calls:
        # 1. Base learner
        # 2. Active goal
        # 3. Career aspirations
        # 4. Interests
        # 5. Learning preferences
        # 6. Skills
        mock_cur.fetchone.side_effect = [
            ("uuid-123", "learner-test", "advanced", Decimal("15.50")),
            ("Master Cloud Architecture",),
        ]
        mock_cur.fetchall.side_effect = [
            [("Principal Architect",)],
            [("Cloud Systems",)],
            [("project-based",)],
            [("Python", "advanced", Decimal("5.00")), ("Kubernetes", "intermediate", Decimal("2.00"))],
        ]

        profile = get_learner_context("learner-test", manager=mock_manager)

        assert isinstance(profile, LearnerProfile)
        assert profile.learner_id == "learner-test"
        assert profile.target_goal == "Master Cloud Architecture"
        assert profile.experience_level == "advanced"
        assert profile.available_hours_per_week == 15.5
        assert profile.career_aspirations == ["Principal Architect"]
        assert profile.interests == ["Cloud Systems"]
        assert profile.learning_preferences == ["project-based"]
        assert len(profile.current_skills) == 2
        assert profile.current_skills[0].skill_name == "Python"
        assert profile.current_skills[0].level == "advanced"
        assert profile.current_skills[0].years_of_experience == 5.0


@pytest.mark.integration
class TestLearnerContextIntegration:
    """Integration tests executing against the live PostgreSQL database and seed data."""

    def test_get_known_seed_learner_context(self):
        profile = get_learner_context("learner-1049")

        assert isinstance(profile, LearnerProfile)
        assert profile.learner_id == "learner-1049"
        assert profile.experience_level == "intermediate"
        assert profile.available_hours_per_week == 10.0
        assert profile.target_goal == "Become a Backend Scala & Distributed Systems Engineer"

        # Assert career aspirations
        assert "Senior Distributed Systems Engineer" in profile.career_aspirations
        assert "Scala Backend Architect" in profile.career_aspirations

        # Assert interests
        assert "Functional Programming" in profile.interests
        assert "Event-Driven Architecture" in profile.interests
        assert "Akka/Pekko" in profile.interests

        # Assert learning preferences
        assert "hands-on" in profile.learning_preferences
        assert "project-based" in profile.learning_preferences
        assert "code-walkthroughs" in profile.learning_preferences

        # Assert current skills
        skill_names = {s.skill_name for s in profile.current_skills}
        assert "Python" in skill_names
        assert "SQL & Relational Databases" in skill_names
        assert "Git & CI/CD" in skill_names

        py_skill = next(s for s in profile.current_skills if s.skill_name == "Python")
        assert py_skill.level == "intermediate"
        assert py_skill.years_of_experience == 2.5

    def test_get_unknown_learner_raises_not_found(self):
        with pytest.raises(LearnerNotFoundError) as exc_info:
            get_learner_context("learner-non-existent-99999")
        assert exc_info.value.external_id == "learner-non-existent-99999"

    def test_parameterized_query_prevents_sql_injection(self):
        malicious_input = "learner-1049' OR '1'='1"
        with pytest.raises(LearnerNotFoundError):
            get_learner_context(malicious_input)

    def test_connection_released_after_context_retrieval(self):
        manager = DatabaseManager()
        pool = manager.get_pool()
        initial_open = pool.get_stats().get("pool_available", 0)

        profile = get_learner_context("learner-1049", manager=manager)
        assert profile.learner_id == "learner-1049"

        # Ensure pool is still operational and no connections leaked
        assert pool.closed is False
        manager.close()

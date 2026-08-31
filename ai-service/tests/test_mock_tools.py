import pytest
from app.tools.mock_tools import (
    get_learner_profile,
    get_learner_skills,
    get_goal_requirements,
    get_skill_prerequisites,
)
from app.tools.exceptions import (
    LearnerNotFoundError,
    GoalNotFoundError,
    SkillNotFoundError,
)
from app.schemas.models import (
    LearnerProfile,
    SkillItem,
    GoalRequirements,
    SkillPrerequisites,
)


class TestLearnerProfileTool:
    """Unit tests for get_learner_profile."""

    def test_get_valid_learner_profile(self):
        profile = get_learner_profile("learner-1049")
        assert isinstance(profile, LearnerProfile)
        assert profile.learner_id == "learner-1049"
        assert profile.target_goal == "Become a Backend Scala & Distributed Systems Engineer"
        assert profile.available_hours_per_week == 10.0
        assert profile.experience_level == "intermediate"
        assert len(profile.current_skills) == 3

    def test_get_unknown_learner_profile_raises_error(self):
        with pytest.raises(LearnerNotFoundError) as exc_info:
            get_learner_profile("non-existent-learner-999")
        assert "non-existent-learner-999" in str(exc_info.value)

    def test_get_empty_learner_id_raises_error(self):
        with pytest.raises(LearnerNotFoundError):
            get_learner_profile("")


class TestLearnerSkillsTool:
    """Unit tests for get_learner_skills."""

    def test_get_valid_learner_skills(self):
        skills = get_learner_skills("learner-1049")
        assert isinstance(skills, list)
        assert len(skills) > 0
        assert all(isinstance(s, SkillItem) for s in skills)
        skill_names = [s.skill_name for s in skills]
        assert "Python" in skill_names
        assert "SQL & Relational Databases" in skill_names

    def test_get_unknown_learner_skills_raises_error(self):
        with pytest.raises(LearnerNotFoundError):
            get_learner_skills("unknown-learner-000")


class TestGoalRequirementsTool:
    """Unit tests for get_goal_requirements."""

    def test_get_known_goal_requirements(self):
        reqs = get_goal_requirements("Become a Backend Scala & Distributed Systems Engineer")
        assert isinstance(reqs, GoalRequirements)
        assert reqs.goal == "Become a Backend Scala & Distributed Systems Engineer"
        assert "Scala 3" in reqs.required_skills
        assert "Akka / Pekko Concurrency" in reqs.required_skills
        assert reqs.recommended_experience_level == "intermediate"

    def test_get_known_goal_case_insensitive(self):
        reqs = get_goal_requirements("become a data engineer")
        assert isinstance(reqs, GoalRequirements)
        assert "PySpark" in reqs.required_skills

    def test_get_unknown_goal_raises_error(self):
        with pytest.raises(GoalNotFoundError) as exc_info:
            get_goal_requirements("Become an Astronaut Chef")
        assert "Become an Astronaut Chef" in str(exc_info.value)

    def test_get_empty_goal_raises_error(self):
        with pytest.raises(GoalNotFoundError):
            get_goal_requirements("")


class TestSkillPrerequisitesTool:
    """Unit tests for get_skill_prerequisites."""

    def test_get_known_skill_with_prerequisites(self):
        prereqs = get_skill_prerequisites("Scala 3")
        assert isinstance(prereqs, SkillPrerequisites)
        assert prereqs.skill_name == "Scala 3"
        assert len(prereqs.prerequisites) > 0
        assert "Basic Programming Concepts" in prereqs.prerequisites
        assert "Object-Oriented Programming" in prereqs.prerequisites

    def test_get_known_skill_with_no_prerequisites(self):
        prereqs = get_skill_prerequisites("Basic Programming Concepts")
        assert isinstance(prereqs, SkillPrerequisites)
        assert prereqs.skill_name == "Basic Programming Concepts"
        assert prereqs.prerequisites == []

    def test_get_foundation_skill_git_no_prerequisites(self):
        prereqs = get_skill_prerequisites("Git & CI/CD")
        assert isinstance(prereqs, SkillPrerequisites)
        assert prereqs.prerequisites == []

    def test_get_unknown_skill_raises_error(self):
        with pytest.raises(SkillNotFoundError) as exc_info:
            get_skill_prerequisites("NonExistentLanguage9000")
        assert "NonExistentLanguage9000" in str(exc_info.value)

    def test_get_empty_skill_raises_error(self):
        with pytest.raises(SkillNotFoundError):
            get_skill_prerequisites("")

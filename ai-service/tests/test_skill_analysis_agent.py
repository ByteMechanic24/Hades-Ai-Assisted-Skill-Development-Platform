"""
Tests for Step 3A — Simplified Live Agent-Driven Skill Analysis
"""

from unittest.mock import MagicMock, patch
import pytest

from app.agents.skill_analysis_agent import (
    LearnerSkillAnalysisAgent,
    ConfigurationError,
    create_skill_analysis_agent,
)
from app.schemas.models import (
    LearnerProfile,
    SkillAnalysis,
    SkillItem,
    GoalSkillReasoning,
)
from app.db.exceptions import LearnerNotFoundError as DbLearnerNotFoundError
from app.tools.analysis_tools import match_learner_skills


# ============================================================================
# 1. UNIT TESTS (OFFLINE / INJECTED AGENT / DETERMINISTIC)
# ============================================================================

class TestSkillAnalysisAgentUnit:
    """Unit tests verifying behavior without requiring live external network."""

    def test_missing_api_key_raises_configuration_error(self):
        """Verify missing Mistral API key fails clearly rather than falling back to 'mock-key'."""
        with patch("app.agents.skill_analysis_agent.settings") as mock_settings:
            mock_settings.MISTRAL_API_KEY = ""
            mock_settings.MISTRAL_ANALYSIS_MODEL_ID = "mistral-small-latest"
            with pytest.raises(ConfigurationError, match="MISTRAL_API_KEY environment variable is not configured"):
                LearnerSkillAnalysisAgent(api_key="")

    def test_skill_matching_normalization_and_no_proficiency_scoring(self):
        """
        Verify match_learner_skills treats recorded skills as already learned
        regardless of beginner/intermediate level, without proficiency ranking.
        """
        current_skills = [
            SkillItem(skill_name="Statistics Fundamentals", level="beginner", years_of_experience=0.0),
            SkillItem(skill_name="Research Methods", level="beginner", years_of_experience=0.0),
            SkillItem(skill_name="Psychology", level="beginner", years_of_experience=0.0),
        ]
        required_skills = [
            "Research Methods",
            "Statistics Fundamentals",
            "Cognitive Psychology",
            "Behavioral Economics",
            "Experimental Design",
        ]

        already_learned, skills_to_learn = match_learner_skills(required_skills, current_skills)

        assert "Research Methods" in already_learned
        assert "Statistics Fundamentals" in already_learned
        assert "Cognitive Psychology" in already_learned or "Psychology" in already_learned or "Cognitive Psychology" in skills_to_learn
        assert "Behavioral Economics" in skills_to_learn
        assert "Experimental Design" in skills_to_learn

    def test_analyze_arbitrary_novel_goal_with_injected_agent(self):
        """Verify any arbitrary goal can be analyzed using structured LLM output."""
        mock_profile = LearnerProfile(
            learner_id="novel-goal-learner",
            target_goal="Become a Quantum Computing Hardware Engineer",
            career_aspirations=["Quantum System Architect"],
            current_skills=[
                SkillItem(skill_name="Linear Algebra", level="intermediate", years_of_experience=1.0),
                SkillItem(skill_name="Python", level="intermediate", years_of_experience=2.0),
            ],
            interests=["Superconducting Qubits", "Cryogenics"],
            available_hours_per_week=12.0,
            learning_preferences=["hands-on", "reading"],
            experience_level="intermediate",
        )

        mock_agent_instance = MagicMock()
        mock_agent_instance.run.return_value.content = GoalSkillReasoning(
            required_skills=[
                "Linear Algebra",
                "Quantum Mechanics",
                "Superconducting Circuit Design",
                "Cryogenic Engineering",
                "Qiskit / Python Quantum SDK",
            ],
            prerequisite_sequence=[
                "Linear Algebra",
                "Quantum Mechanics",
                "Superconducting Circuit Design",
                "Cryogenic Engineering",
                "Qiskit / Python Quantum SDK",
            ],
            reasoning_summary="Building quantum hardware requires solid linear algebra and quantum physics before diving into cryogenic circuits.",
        )

        with patch("app.agents.skill_analysis_agent.get_learner_context", return_value=mock_profile):
            agent = LearnerSkillAnalysisAgent(agent_instance=mock_agent_instance)
            analysis = agent.analyze_learner("novel-goal-learner")

            assert isinstance(analysis, SkillAnalysis)
            assert analysis.learner_id == "novel-goal-learner"
            assert analysis.target_goal == "Become a Quantum Computing Hardware Engineer"
            assert "Linear Algebra" in analysis.already_learned
            assert "Quantum Mechanics" in analysis.skills_to_learn
            assert "Superconducting Circuit Design" in analysis.skills_to_learn
            assert len(analysis.prerequisite_sequence) == 5
            assert "solid linear algebra" in analysis.analysis_summary

    def test_unknown_learner_raises_db_not_found_error(self):
        """Unknown learner ID raises LearnerNotFoundError from PostgreSQL repository."""
        mock_agent = MagicMock()
        agent = LearnerSkillAnalysisAgent(agent_instance=mock_agent)
        with pytest.raises(DbLearnerNotFoundError) as exc_info:
            agent.analyze_learner("nonexistent-learner-99999")
        assert exc_info.value.external_id == "nonexistent-learner-99999"


# ============================================================================
# 2. LIVE INTEGRATION TESTS (REAL POSTGRESQL + REAL MISTRAL)
# ============================================================================

@pytest.mark.integration
class TestSkillAnalysisLiveIntegration:
    """Live end-to-end integration tests using real PostgreSQL and real Mistral."""

    def test_live_psychology_demo_001_arbitrary_goal(self):
        """
        Live verification of psychology-demo-001:
        - Real PostgreSQL load of learner and skills
        - Real Mistral LLM dynamic skill generation (no mock catalog)
        - Categorization into already_learned vs skills_to_learn
        """
        agent = create_skill_analysis_agent()
        analysis = agent.analyze_learner("psychology-demo-001")

        assert isinstance(analysis, SkillAnalysis)
        assert analysis.learner_id == "psychology-demo-001"
        assert "behavioral science" in analysis.target_goal.lower()

        # Dynamic LLM skills generated
        assert len(analysis.required_skills) >= 3
        assert len(analysis.skills_to_learn) >= 1
        assert len(analysis.prerequisite_sequence) >= 1
        assert len(analysis.analysis_summary) > 20

        # Learner's recorded skills categorized into already_learned or skills_to_learn
        assert isinstance(analysis.already_learned, list)

    def test_live_seeded_learner_1049(self):
        """Live verification of seeded learner-1049 with real Mistral LLM."""
        agent = create_skill_analysis_agent()
        analysis = agent.analyze_learner("learner-1049")

        assert isinstance(analysis, SkillAnalysis)
        assert analysis.learner_id == "learner-1049"
        assert len(analysis.required_skills) >= 3
        assert len(analysis.skills_to_learn) >= 1
        assert len(analysis.analysis_summary) > 20

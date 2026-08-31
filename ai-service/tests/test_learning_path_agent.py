from unittest.mock import patch
import pytest
from app.agents.skill_analysis_agent import create_skill_analysis_agent
from app.agents.learning_path_agent import (
    LearningPathRecommendationAgent,
    create_learning_path_agent,
)
from app.tools.mock_tools import get_learner_profile
from app.schemas.models import LearningPathResponse


class TestLearningPathRecommendationAgent:
    """Unit tests for LearningPathRecommendationAgent."""

    def test_agent_initialization(self):
        from app.core.config import settings
        agent = create_learning_path_agent()
        assert agent is not None
        assert agent.large_model_id == settings.MISTRAL_REASONING_MODEL_ID

    def test_branch_a_roadmap_sh_generation(self):
        """
        Learner 123 wants to 'Become a Data Engineer'.
        A suitable roadmap.sh roadmap ('data-engineer') exists.
        Verify Branch A is selected, sequence is preserved, and response is valid.
        """
        skill_agent = create_skill_analysis_agent()
        path_agent = create_learning_path_agent()

        profile = get_learner_profile("learner-123")
        with patch("app.agents.skill_analysis_agent.get_learner_context", return_value=profile):
            skill_analysis = skill_agent.analyze_learner("learner-123")

        response = path_agent.recommend_learning_path(profile, skill_analysis)


        assert isinstance(response, LearningPathResponse)
        assert response.learner_id == "learner-123"
        assert response.target_goal == "Become a Data Engineer"
        assert "Data Engineer" in response.title
        assert len(response.milestones) == 3
        # Check that milestone titles match roadmap.sh faithfully
        assert "Foundations & Programming" in response.milestones[0].title
        assert "Data Warehousing" in response.milestones[1].title
        assert "Distributed Computing" in response.milestones[2].title

        # Check total weeks calculation (hours / 8.0h available)
        assert response.estimated_total_hours == 90.0
        assert response.estimated_total_weeks == 12  # ceil(90 / 8) = 12

    def test_branch_b_fallback_generation(self):
        """
        Learner 1049 wants 'Become a Backend Scala & Distributed Systems Engineer'.
        No direct roadmap.sh roadmap exists.
        Verify Branch B fallback creates a tailored topic-by-topic roadmap.
        """
        skill_agent = create_skill_analysis_agent()
        path_agent = create_learning_path_agent()

        profile = get_learner_profile("learner-1049")
        with patch("app.agents.skill_analysis_agent.get_learner_context", return_value=profile):
            skill_analysis = skill_agent.analyze_learner("learner-1049")

        response = path_agent.recommend_learning_path(profile, skill_analysis)

        assert isinstance(response, LearningPathResponse)
        assert response.learner_id == "learner-1049"
        assert response.target_goal == "Become a Backend Scala & Distributed Systems Engineer"
        assert len(response.milestones) >= 1
        assert response.estimated_total_hours > 0
        assert response.estimated_total_weeks >= 1
        assert len(response.skill_gap_analysis) > 0
        assert "No direct roadmap.sh template found" in response.adaptation_rationale

        # Verify all modules have deliverables, learning style, and topics
        for ms in response.milestones:
            for mod in ms.modules:
                assert mod.learning_style == "hands-on"
                assert len(mod.topics) > 0
                assert mod.key_deliverable is not None

"""
Learner / Skill Analysis Agent (Step 3A)

Live, agent-driven skill requirement determination and prerequisite reasoning
using Agno + Mistral for arbitrary learner-defined career/learning goals.
"""

import logging
from typing import Optional, List
from agno.agent import Agent
from agno.models.mistral import MistralChat

from app.core.config import settings
from app.schemas.models import (
    LearnerProfile,
    SkillItem,
    GoalSkillReasoning,
    SkillAnalysis,
)
from app.db.learner_context import get_learner_context
from app.db.exceptions import DatabaseError, LearnerNotFoundError
from app.tools.analysis_tools import match_learner_skills

logger = logging.getLogger(__name__)


class ConfigurationError(RuntimeError):
    """Raised when mandatory credentials or settings are unconfigured."""
    pass


class LearnerSkillAnalysisAgent:
    """
    Agno-based agent responsible for dynamically analyzing any learner-defined goal,
    determining required knowledge/skills, evaluating prerequisite sequences,
    and categorizing competencies against the learner's recorded skills.
    """

    def __init__(
        self,
        model_id: Optional[str] = None,
        api_key: Optional[str] = None,
        agent_instance: Optional[Agent] = None,
    ):
        self.model_id = model_id or settings.MISTRAL_ANALYSIS_MODEL_ID
        self.api_key = api_key or settings.MISTRAL_API_KEY

        # Initialize underlying Agno agent if not injected
        if agent_instance is not None:
            self._agent = agent_instance
        else:
            if not self.api_key or not self.api_key.strip():
                raise ConfigurationError(
                    "MISTRAL_API_KEY environment variable is not configured. "
                    "Live agent reasoning requires a valid Mistral API key."
                )

            mistral_model = MistralChat(
                id=self.model_id,
                api_key=self.api_key.strip(),
            )
            self._agent = Agent(
                name="LearnerSkillAnalysisAgent",
                model=mistral_model,
                output_schema=GoalSkillReasoning,
                description="Expert skills analyst that determines requirements and prerequisite sequences for arbitrary learning goals.",
                instructions=[
                    "You are an expert curriculum designer and career skills analyst.",
                    "Analyze the learner's goal and determine the core knowledge domains, technical skills, and topics genuinely relevant to achieving it.",
                    "Do NOT assume a predefined career catalog; reason dynamically for ANY goal (technical, academic, scientific, or practical).",
                    "Do NOT evaluate or score proficiency levels (beginner/intermediate/advanced); focus on concrete topic requirements.",
                    "Formulate a logical prerequisite and learning sequence, ordering topics from foundational to advanced.",
                    "Provide a clear, concise analytical summary explaining the rationale for the selected skills and sequence.",
                    "Output must strictly conform to the GoalSkillReasoning structured schema.",
                ],
            )

    def analyze_learner(
        self,
        learner_id: str,
        target_goal: Optional[str] = None,
    ) -> SkillAnalysis:
        """
        Executes live skill analysis for a learner from PostgreSQL context.

        Steps:
        1. Retrieve learner profile and recorded skills from PostgreSQL.
        2. Identify effective target goal.
        3. Execute Agno/Mistral agent to determine required skills and prerequisite sequence.
        4. Categorize skills into already_learned vs skills_to_learn via lightweight normalization.
        5. Return typed, structured SkillAnalysis.
        """
        # 1. Fetch profile & skills from PostgreSQL repository
        profile: LearnerProfile = get_learner_context(learner_id)
        effective_goal = (target_goal or profile.target_goal or "").strip()

        if not effective_goal:
            raise ValueError(f"Learner '{learner_id}' has no specified target goal.")

        # 2. Build structured prompt for the LLM
        prompt = (
            f"Target Goal: {effective_goal}\n"
            f"Learner Interests: {', '.join(profile.interests) if profile.interests else 'None specified'}\n"
            f"Weekly Available Hours: {profile.available_hours_per_week} hours/week\n"
            f"Learning Preferences: {', '.join(profile.learning_preferences) if profile.learning_preferences else 'General'}\n\n"
            f"Determine the comprehensive required skills/topics and the logical prerequisite learning sequence for this goal."
        )

        # 3. Execute live Agno agent reasoning
        agent_response = self._agent.run(prompt)
        reasoning: GoalSkillReasoning
        if isinstance(agent_response.content, GoalSkillReasoning):
            reasoning = agent_response.content
        elif isinstance(agent_response.content, dict):
            reasoning = GoalSkillReasoning.model_validate(agent_response.content)
        else:
            raise ValueError(f"Unexpected response type from skill analysis agent: {type(agent_response.content)}")

        # 4. Compare required skills against learner's recorded skills
        already_learned, skills_to_learn = match_learner_skills(
            required_skills=reasoning.required_skills,
            current_skills=profile.current_skills,
        )

        # 5. Assemble structured SkillAnalysis
        return SkillAnalysis(
            learner_id=profile.learner_id,
            target_goal=effective_goal,
            current_skills=profile.current_skills,
            required_skills=reasoning.required_skills,
            already_learned=already_learned,
            skills_to_learn=skills_to_learn,
            prerequisite_sequence=reasoning.prerequisite_sequence,
            analysis_summary=reasoning.reasoning_summary,
            # Backward-compatible fields
            covered_skills=already_learned,
            missing_skills=skills_to_learn,
            insufficient_skills=[],
            prerequisite_gaps=reasoning.prerequisite_sequence,
        )


def create_skill_analysis_agent(
    model_id: Optional[str] = None,
    api_key: Optional[str] = None,
) -> LearnerSkillAnalysisAgent:
    """Factory helper to instantiate the LearnerSkillAnalysisAgent."""
    return LearnerSkillAnalysisAgent(model_id=model_id, api_key=api_key)

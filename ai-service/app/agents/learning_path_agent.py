"""
Learning Path Recommendation Agent (Step 3B)

Coordinates roadmap.sh discovery and ingestion (Branch A) or invokes Mistral Large
to generate personalized, topic-by-topic learning paths from scratch (Branch B).
"""

import math
import uuid
from typing import Optional, List
from agno.agent import Agent
from agno.models.mistral import MistralChat

from app.core.config import settings
from app.schemas.models import (
    LearnerProfile,
    SkillAnalysis,
    Roadmap,
    RoadmapSearchResult,
    LearningPathModule,
    LearningPathMilestone,
    LearningPathResponse,
)
from app.tools.roadmap_tools import (
    search_roadmaps,
    get_roadmap,
    validate_learning_path,
)
from app.adapters.roadmap_adapter import RoadmapAdapter


class LearningPathRecommendationAgent:
    """
    Agno-based recommendation agent that converts learner profiles and skill-gap analyses
    into structured LearningPathResponse instances.
    """

    def __init__(
        self,
        small_model_id: Optional[str] = None,
        large_model_id: Optional[str] = None,
        api_key: Optional[str] = None,
        agent_instance: Optional[Agent] = None,
    ):
        self.small_model_id = small_model_id or settings.MISTRAL_ANALYSIS_MODEL_ID
        self.large_model_id = large_model_id or settings.MISTRAL_REASONING_MODEL_ID
        self.api_key = api_key or settings.MISTRAL_API_KEY

        if agent_instance is not None:
            self._agent = agent_instance
        else:
            if not self.api_key or not self.api_key.strip():
                raise RuntimeError(
                    "MISTRAL_API_KEY environment variable is not configured."
                )

            mistral_model = MistralChat(
                id=self.large_model_id,
                api_key=self.api_key.strip(),
            )
            self._agent = Agent(
                name="LearningPathRecommendationAgent",
                model=mistral_model,
                output_schema=LearningPathResponse,
                description="Expert personalized learning path curator and curriculum designer.",
                instructions=[
                    "You are an expert curriculum designer.",
                    "Generate a personalized learning path for the learner's exact target goal.",
                    "Use the supplied skill analysis as the primary curriculum context.",
                    "Do not invent skills that are unrelated to the learner's goal.",
                    "Do not include skills that the learner has already learned unless they are required as a short review.",
                    "Respect the prerequisite sequence supplied by the Skill Analysis Agent.",
                    "Turn the required learning into a coherent progression of milestones and granular modules.",
                    "Each module must contain concrete topics, a useful description, a realistic estimated time, a suitable learning style, and a tangible key deliverable.",
                    "Adapt the path to the learner's available hours per week and learning preferences.",
                    "Do not use generic templates such as 'Core', 'Architecture', or 'Best Practices' unless those are genuinely appropriate to the subject.",
                    "Do not create an artificially long roadmap just to cover every possible related subject.",
                    "Prioritize the core knowledge required to achieve the target goal.",
                    "Return ONLY data conforming to the LearningPathResponse schema.",
                ],
            )

    def recommend_learning_path(
        self,
        profile: LearnerProfile,
        skill_analysis: SkillAnalysis,
        roadmap_adapter: Optional[RoadmapAdapter] = None,
    ) -> LearningPathResponse:
        """
        Main recommendation entrypoint.

        Evaluates whether a suitable roadmap exists from roadmap.sh:
        - Branch A: Roadmap found -> Transform roadmap faithfully preserving sequence.
        - Branch B: No roadmap found -> Invoke Mistral Large generator.
        Finally runs deterministic validation.
        """
        # Step 1: Search roadmap catalog
        search_result = search_roadmaps(profile.target_goal, adapter=roadmap_adapter)

        if search_result and search_result.match_score >= 0.7:
            # Branch A: Use existing roadmap.sh curriculum
            raw_roadmap = get_roadmap(search_result.roadmap_id, adapter=roadmap_adapter)
            if raw_roadmap:
                raw_response = self._build_path_from_roadmap(
                    profile=profile,
                    skill_analysis=skill_analysis,
                    roadmap=raw_roadmap,
                )
                return validate_learning_path(raw_response)

        # Branch B: Fallback custom learning path generation
        fallback_response = self._generate_fallback_path(
            profile=profile,
            skill_analysis=skill_analysis,
        )
        return validate_learning_path(fallback_response)

    def _build_path_from_roadmap(
        self,
        profile: LearnerProfile,
        skill_analysis: SkillAnalysis,
        roadmap: Roadmap,
    ) -> LearningPathResponse:
        """
        Branch A: Transforms a roadmap.sh roadmap into a LearningPathResponse.
        Faithfully preserves the educational sequence, node titles, and topic hierarchies.
        """
        path_id = f"path-{uuid.uuid4().hex[:8]}"
        milestones: List[LearningPathMilestone] = []
        total_hours = 0.0

        primary_style = profile.learning_preferences[0] if profile.learning_preferences else "hands-on"

        for i, node in enumerate(roadmap.nodes, start=1):
            modules: List[LearningPathModule] = []
            ms_hours = 0.0

            if node.children:
                for j, child in enumerate(node.children, start=1):
                    mod_hours = child.estimated_hours or 15.0
                    ms_hours += mod_hours
                    modules.append(
                        LearningPathModule(
                            module_id=f"mod-{i}-{j}",
                            title=child.title,
                            description=child.description or f"Master concepts in {child.title}.",
                            topics=[child.title] + [c.title for c in child.children],
                            estimated_hours=mod_hours,
                            learning_style=primary_style,
                            key_deliverable=f"Implement practical project demonstrating {child.title}",
                        )
                    )
            else:
                mod_hours = node.estimated_hours or 25.0
                ms_hours += mod_hours
                modules.append(
                    LearningPathModule(
                        module_id=f"mod-{i}-1",
                        title=node.title,
                        description=node.description or f"Master concepts in {node.title}.",
                        topics=[node.title],
                        estimated_hours=mod_hours,
                        learning_style=primary_style,
                        key_deliverable=f"Build hands-on milestone project for {node.title}",
                    )
                )

            total_hours += ms_hours
            milestones.append(
                LearningPathMilestone(
                    milestone_id=f"ms-{i}",
                    order=i,
                    title=node.title,
                    objective=node.description or f"Complete {node.title} requirements.",
                    prerequisite_skills=[roadmap.nodes[i - 2].title] if i > 1 else [],
                    modules=modules,
                    estimated_hours=ms_hours,
                )
            )

        total_weeks = max(1, math.ceil(total_hours / profile.available_hours_per_week))

        skill_gaps = skill_analysis.missing_skills + skill_analysis.insufficient_skills
        if not skill_gaps:
            skill_gaps = ["Advanced domain mastery"]

        adaptation_rationale = (
            f"Mapped target goal '{profile.target_goal}' to standard '{roadmap.title}'. "
            f"Preserved official curriculum sequence while pacing across {total_weeks} weeks "
            f"based on {profile.available_hours_per_week}h/week availability."
        )

        return LearningPathResponse(
            path_id=path_id,
            learner_id=profile.learner_id,
            target_goal=profile.target_goal,
            title=f"{roadmap.title} (Personalized Track)",
            summary=roadmap.description or f"Personalized curriculum following {roadmap.title}.",
            target_role=profile.career_aspirations[0] if profile.career_aspirations else profile.target_goal,
            estimated_total_weeks=total_weeks,
            estimated_total_hours=total_hours,
            milestones=milestones,
            skill_gap_analysis=skill_gaps,
            adaptation_rationale=adaptation_rationale,
        )

    def _generate_fallback_path(
        self,
        profile: LearnerProfile,
        skill_analysis: SkillAnalysis,
    ) -> LearningPathResponse:
        """
        Branch B: Generate a personalized learning path using the real
        Mistral reasoning model through Agno.
        """
        prompt = f"""
Create a personalized learning path for this learner.

LEARNER
-------
Learner ID: {profile.learner_id}
Target Goal: {profile.target_goal}
Career Aspirations: {profile.career_aspirations}
Interests: {profile.interests}
Experience Level: {profile.experience_level}
Available Hours Per Week: {profile.available_hours_per_week}
Learning Preferences: {profile.learning_preferences}

CURRENT RECORDED SKILLS
-----------------------
{[skill.model_dump() for skill in profile.current_skills]}

SKILL ANALYSIS
--------------
Required Skills:
{skill_analysis.required_skills}

Already Learned:
{skill_analysis.already_learned}

Skills To Learn:
{skill_analysis.skills_to_learn}

Recommended Prerequisite Sequence:
{skill_analysis.prerequisite_sequence}

Skill Analysis Summary:
{skill_analysis.analysis_summary}

INSTRUCTIONS
------------
Build the actual learning roadmap needed to achieve the target goal.

1. Focus primarily on skills_to_learn.
2. Do not treat already_learned skills as missing.
3. Follow the prerequisite sequence where educationally appropriate.
4. Group related concepts into meaningful milestones and modules.
5. Make modules granular enough that individual roadmap topics can later
   be used by the topic-level resource-discovery system.
6. Do not create generic placeholder topics.
7. Do not add unrelated advanced subjects merely because they are interesting.
8. Adapt the path to the learner's available weekly time.
9. Respect the learner's learning preferences.
10. Every module must contain:
      - title
      - detailed description
      - granular topics
      - estimated_hours
      - learning_style
      - key_deliverable
11. Every milestone must contain:
      - logical order
      - objective
      - prerequisite_skills
      - modules
      - estimated_hours
12. Make the roadmap realistic and focused on achieving the stated goal.
13. Avoid artificially expanding the roadmap to cover every adjacent subject.
14. Return only a valid LearningPathResponse structure.
15.Do not state total hours or total weeks in summary or adaptation_rationale. Those values will be calculated by the application.
"""

        response = self._agent.run(prompt)

        if isinstance(response.content, LearningPathResponse):
            generated_path = response.content
        elif isinstance(response.content, dict):
            generated_path = LearningPathResponse.model_validate(response.content)
        else:
            raise ValueError(
                "Unexpected response type from Learning Path Agent: "
                f"{type(response.content)}"
            )

        # The service owns the path identity and learner/goal identity.
        generated_path.path_id = f"path-{uuid.uuid4().hex[:8]}"
        generated_path.learner_id = profile.learner_id
        generated_path.target_goal = profile.target_goal

        generated_path.estimated_total_hours = sum(
            milestone.estimated_hours
            for milestone in generated_path.milestones
        )

        generated_path.estimated_total_weeks = max(
            1,
            math.ceil(
                generated_path.estimated_total_weeks / profile.available_hours_per_week
            )
        )

        return generated_path


def create_learning_path_agent(
    small_model_id: Optional[str] = None,
    large_model_id: Optional[str] = None,
    api_key: Optional[str] = None,
) -> LearningPathRecommendationAgent:
    """Factory helper to instantiate the LearningPathRecommendationAgent."""
    return LearningPathRecommendationAgent(
        small_model_id=small_model_id,
        large_model_id=large_model_id,
        api_key=api_key,
    )
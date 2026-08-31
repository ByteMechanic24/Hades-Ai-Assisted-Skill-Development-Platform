"""
Orchestrator Tools (Step 4)

Execution tools used by the Autonomous Orchestrator.

Design principles:
- Tools execute actions; they do NOT decide which action should happen.
- The AutonomousOrchestratorAgent owns orchestration decisions.
- Roadmap generation is incremental and chunk-based.
- Resource discovery is performed for individual topics.
- Orchestration state is persisted after meaningful mutations.
- Existing Step 3B/3C agents remain reusable and unchanged.
"""

import logging
import uuid
from typing import Optional, List

from app.schemas.models import (
    LearnerProfile,
    SkillAnalysis,
    LearningPathResponse,
    RoadmapChunk,
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
)

from app.db.learner_context import get_learner_context

from app.agents.skill_analysis_agent import (
    LearnerSkillAnalysisAgent,
    create_skill_analysis_agent,
)

from app.agents.learning_path_agent import (
    LearningPathRecommendationAgent,
    create_learning_path_agent,
)

from app.agents.resource_discovery_agent import (
    ResourceDiscoveryAgent,
    create_resource_discovery_agent,
)

from app.db.orchestrator_state import (
    save_roadmap_chunk,
    get_saved_roadmap_chunks,
)

from app.adapters.roadmap_adapter import (
    RoadmapAdapter,
    default_roadmap_adapter,
)

logger = logging.getLogger(__name__)


class OrchestratorToolError(Exception):
    """Base exception for orchestrator execution tools."""
    pass


# ---------------------------------------------------------------------------
# Shared agent instances
# ---------------------------------------------------------------------------

_skill_agent: Optional[LearnerSkillAnalysisAgent] = None
_path_agent: Optional[LearningPathRecommendationAgent] = None
_resource_agent: Optional[ResourceDiscoveryAgent] = None


def _get_skill_agent() -> LearnerSkillAnalysisAgent:
    global _skill_agent

    if _skill_agent is None:
        _skill_agent = create_skill_analysis_agent()

    return _skill_agent


def _get_path_agent() -> LearningPathRecommendationAgent:
    global _path_agent

    if _path_agent is None:
        _path_agent = create_learning_path_agent()

    return _path_agent


def _get_resource_agent() -> ResourceDiscoveryAgent:
    global _resource_agent

    if _resource_agent is None:
        _resource_agent = create_resource_discovery_agent()

    return _resource_agent


# ---------------------------------------------------------------------------
# Skill Analysis
# ---------------------------------------------------------------------------

def analyze_learner_skills(
    learner_id: str,
    target_goal: Optional[str] = None,
) -> SkillAnalysis:
    """
    Execute the Skill Analysis Agent.

    IMPORTANT:
    This function performs analysis only.

    It does not decide whether skill analysis is necessary.
    The Autonomous Orchestrator decides that.
    """

    if not learner_id or not learner_id.strip():
        raise OrchestratorToolError(
            "learner_id must be provided."
        )

    try:
        agent = _get_skill_agent()

        logger.info(
            "[ORCHESTRATOR TOOL] Running skill analysis for learner=%s",
            learner_id,
        )

        return agent.analyze_learner(
            learner_id=learner_id.strip(),
            target_goal=target_goal,
        )

    except Exception as exc:
        logger.exception(
            "[ORCHESTRATOR TOOL] Skill analysis failed for learner=%s",
            learner_id,
        )

        raise OrchestratorToolError(
            f"Skill analysis failed: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# Master Curriculum
# ---------------------------------------------------------------------------

def generate_master_curriculum(
    learner_id: str,
    skill_analysis: SkillAnalysis,
    target_goal: Optional[str] = None,
    roadmap_adapter: Optional[RoadmapAdapter] = None,
) -> LearningPathResponse:
    """
    Generate the coherent master curriculum.

    This is intentionally separate from chunk delivery.

    The orchestrator may call this when it determines that a curriculum
    must first be established.

    This function does NOT decide whether it should be called.
    """

    if not learner_id or not learner_id.strip():
        raise OrchestratorToolError(
            "learner_id must be provided."
        )

    try:
        profile: LearnerProfile = get_learner_context(
            learner_id.strip()
        )

        if target_goal:
            profile_data = profile.model_dump()
            profile_data["target_goal"] = target_goal
            profile = LearnerProfile(**profile_data)

        agent = _get_path_agent()

        logger.info(
            "[ORCHESTRATOR TOOL] Generating master curriculum for learner=%s",
            learner_id,
        )

        return agent.recommend_learning_path(
            profile=profile,
            skill_analysis=skill_analysis,
            roadmap_adapter=(
                roadmap_adapter
                or default_roadmap_adapter
            ),
        )

    except Exception as exc:
        logger.exception(
            "[ORCHESTRATOR TOOL] Master curriculum generation failed "
            "for learner=%s",
            learner_id,
        )

        raise OrchestratorToolError(
            f"Master curriculum generation failed: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# Incremental Roadmap Chunk Generation
# ---------------------------------------------------------------------------

def generate_roadmap_chunk(
    learner_id: str,
    curriculum: LearningPathResponse,
    sequence_number: int,
    chunk_size: int = 3,
) -> RoadmapChunk:
    """
    Convert a portion of an already-generated curriculum into a RoadmapChunk.

    This function DOES NOT:
    - run skill analysis
    - generate another complete curriculum
    - make orchestration decisions
    - discover resources

    It only materializes the requested section of the existing curriculum.

    Args:
        learner_id:
            Learner owning the curriculum.

        curriculum:
            Existing coherent LearningPathResponse.

        sequence_number:
            1-based chunk sequence number.

        chunk_size:
            Number of roadmap milestones/topics represented by this chunk.

    Returns:
        RoadmapChunk
    """

    if not learner_id or not learner_id.strip():
        raise OrchestratorToolError(
            "learner_id must be provided."
        )

    if sequence_number < 1:
        raise OrchestratorToolError(
            "sequence_number must be >= 1."
        )

    if chunk_size < 1:
        raise OrchestratorToolError(
            "chunk_size must be >= 1."
        )

    milestones = curriculum.milestones

    start_index = (sequence_number - 1) * chunk_size

    if start_index >= len(milestones):
        raise OrchestratorToolError(
            f"Chunk {sequence_number} is beyond the available curriculum."
        )

    selected_milestones = milestones[
        start_index:start_index + chunk_size
    ]

    topics: List[str] = []

    for milestone in selected_milestones:
        for module in milestone.modules:
            topics.append(module.title)

    if not topics:
        raise OrchestratorToolError(
            f"Chunk {sequence_number} contains no topics."
        )

    has_more = (
        start_index + chunk_size < len(milestones)
    )

    chunk_id = (
        f"chunk-{uuid.uuid4().hex[:10]}"
    )

    chunk_title = (
        f"Roadmap Chunk {sequence_number}: "
        f"{selected_milestones[0].title}"
    )

    chunk = RoadmapChunk(
        chunk_id=chunk_id,
        roadmap_id=curriculum.path_id,
        sequence_number=sequence_number,
        title=chunk_title,
        topics=topics,
        has_more=has_more,
    )

    save_roadmap_chunk(
        learner_id=learner_id,
        chunk=chunk,
    )

    logger.info(
        "[ORCHESTRATOR TOOL] Generated roadmap chunk "
        "sequence=%s learner=%s topics=%s has_more=%s",
        sequence_number,
        learner_id,
        len(topics),
        has_more,
    )

    return chunk


# ---------------------------------------------------------------------------
# Existing Chunk Retrieval
# ---------------------------------------------------------------------------

def get_available_roadmap_chunks(
    learner_id: str,
) -> List[RoadmapChunk]:
    """
    Return chunks already generated for the learner.

    No generation occurs here.
    """

    if not learner_id or not learner_id.strip():
        raise OrchestratorToolError(
            "learner_id must be provided."
        )

    return get_saved_roadmap_chunks(
        learner_id.strip()
    )


# ---------------------------------------------------------------------------
# Topic Resource Discovery
# ---------------------------------------------------------------------------

def prepare_topic_resources(
    request: TopicResourceDiscoveryRequest,
) -> TopicResourceDiscoveryResponse:
    """
    Discover and rank learning resources for one roadmap topic.

    The resource discovery agent performs:
    - LLM search-query planning
    - Tavily retrieval
    - normalization
    - ranking
    - filtering

    The orchestrator decides WHEN this function should execute.
    """

    if not request.learner_id:
        raise OrchestratorToolError(
            "learner_id must be provided."
        )

    if not request.topic_id:
        raise OrchestratorToolError(
            "topic_id must be provided."
        )

    if not request.topic_title:
        raise OrchestratorToolError(
            "topic_title must be provided."
        )

    try:
        agent = _get_resource_agent()

        logger.info(
            "[ORCHESTRATOR TOOL] Discovering resources "
            "learner=%s topic=%s",
            request.learner_id,
            request.topic_id,
        )

        return agent.discover_topic_resources(
            request=request,
        )

    except Exception as exc:
        logger.exception(
            "[ORCHESTRATOR TOOL] Resource discovery failed "
            "for topic=%s",
            request.topic_id,
        )

        raise OrchestratorToolError(
            f"Topic resource discovery failed: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# Convenience: Build Topic Request From Curriculum
# ---------------------------------------------------------------------------

def build_topic_resource_request(
    profile: LearnerProfile,
    curriculum: LearningPathResponse,
    topic_index: int,
) -> TopicResourceDiscoveryRequest:
    """
    Build a TopicResourceDiscoveryRequest for a topic in the curriculum.

    topic_index is zero-based.
    """

    flattened_topics = []

    for milestone in curriculum.milestones:
        for module in milestone.modules:
            flattened_topics.append(
                {
                    "milestone_id": milestone.milestone_id,
                    "milestone_title": milestone.title,
                    "milestone_objective": milestone.objective,
                    "module": module,
                }
            )

    if topic_index < 0 or topic_index >= len(flattened_topics):
        raise OrchestratorToolError(
            f"topic_index {topic_index} is outside curriculum range."
        )

    selected = flattened_topics[topic_index]
    module = selected["module"]

    return TopicResourceDiscoveryRequest(
        learner_id=profile.learner_id,
        topic_id=module.module_id,
        topic_title=module.title,
        topic_description=module.description,
        target_goal=profile.target_goal,
        experience_level=profile.experience_level,
        current_skills=profile.current_skills,
        learning_preferences=profile.learning_preferences,
        milestone_title=selected["milestone_title"],
        milestone_objective=selected["milestone_objective"],
        key_deliverable=module.key_deliverable,
        max_youtube_resources=5,
        max_general_resources=5,
    )
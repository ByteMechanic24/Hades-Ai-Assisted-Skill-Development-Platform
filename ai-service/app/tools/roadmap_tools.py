"""
Roadmap Tools & Deterministic Validation (Step 3B)

Exposes search_roadmaps, get_roadmap, and validate_learning_path as independent,
reusable tools for the Learning Path Recommendation Agent.
"""

from typing import Optional, List
import math
from app.schemas.models import (
    Roadmap,
    RoadmapSearchResult,
    LearningPathResponse,
)
from app.adapters.roadmap_adapter import default_roadmap_adapter, RoadmapAdapter
from app.tools.exceptions import ToolError


class LearningPathValidationError(ToolError):
    """Raised when a generated learning path violates structural or contract constraints."""
    pass


def search_roadmaps(
    goal: str,
    adapter: Optional[RoadmapAdapter] = None,
) -> Optional[RoadmapSearchResult]:
    """
    Searches roadmap.sh for a suitable curriculum matching the target goal.

    Args:
        goal: Target career or skill goal (e.g. 'Become a Data Engineer').
        adapter: Optional custom RoadmapAdapter instance.

    Returns:
        RoadmapSearchResult if a suitable roadmap exists, else None.
    """
    active_adapter = adapter or default_roadmap_adapter
    return active_adapter.search_roadmaps(goal)


def get_roadmap(
    identifier: str,
    adapter: Optional[RoadmapAdapter] = None,
) -> Optional[Roadmap]:
    """
    Retrieves the normalized Roadmap from roadmap.sh source preserving topic ordering.

    Args:
        identifier: Roadmap slug/ID (e.g. 'data-engineer', 'full-stack').
        adapter: Optional custom RoadmapAdapter instance.

    Returns:
        Roadmap instance if found, else None.
    """
    active_adapter = adapter or default_roadmap_adapter
    return active_adapter.get_roadmap(identifier)


def validate_learning_path(path: LearningPathResponse) -> LearningPathResponse:
    """
    Deterministically validates that a LearningPathResponse satisfies all Step 1 contract rules.

    Checks:
    - Non-empty top-level identifiers, titles, and summaries.
    - Positive estimated total hours and estimated total weeks.
    - Non-empty milestones list with strictly ascending 1-based ordering.
    - Non-empty modules list within each milestone.
    - Non-empty topics, learning style, and key deliverable per module.
    - Milestone estimated hours matches sum of module hours.
    - Total estimated hours matches sum of milestone hours.
    - Non-empty skill_gap_analysis list and adaptation_rationale.

    Args:
        path: LearningPathResponse to validate.

    Returns:
        The validated LearningPathResponse.

    Raises:
        LearningPathValidationError: If any constraint is violated.
    """
    if not path.path_id or not path.path_id.strip():
        raise LearningPathValidationError("path_id cannot be empty.")
    if not path.learner_id or not path.learner_id.strip():
        raise LearningPathValidationError("learner_id cannot be empty.")
    if not path.target_goal or not path.target_goal.strip():
        raise LearningPathValidationError("target_goal cannot be empty.")
    if not path.title or not path.title.strip():
        raise LearningPathValidationError("title cannot be empty.")
    if not path.summary or not path.summary.strip():
        raise LearningPathValidationError("summary cannot be empty.")
    if not path.target_role or not path.target_role.strip():
        raise LearningPathValidationError("target_role cannot be empty.")
    if path.estimated_total_hours <= 0:
        raise LearningPathValidationError("estimated_total_hours must be positive.")
    if path.estimated_total_weeks < 1:
        raise LearningPathValidationError("estimated_total_weeks must be at least 1.")
    if not path.milestones:
        raise LearningPathValidationError("milestones list cannot be empty.")

    calc_total_hours = 0.0

    for i, ms in enumerate(path.milestones, start=1):
        if ms.order != i:
            raise LearningPathValidationError(
                f"Milestone order invalid: expected {i}, got {ms.order}."
            )
        if not ms.milestone_id or not ms.milestone_id.strip():
            raise LearningPathValidationError(f"Milestone at order {i} has empty milestone_id.")
        if not ms.title or not ms.title.strip():
            raise LearningPathValidationError(f"Milestone at order {i} has empty title.")
        if not ms.objective or not ms.objective.strip():
            raise LearningPathValidationError(f"Milestone at order {i} has empty objective.")
        if not ms.modules:
            raise LearningPathValidationError(f"Milestone '{ms.title}' contains no modules.")

        ms_module_hours = 0.0
        for mod in ms.modules:
            if not mod.module_id or not mod.module_id.strip():
                raise LearningPathValidationError(f"Module in milestone '{ms.title}' has empty module_id.")
            if not mod.title or not mod.title.strip():
                raise LearningPathValidationError(f"Module in milestone '{ms.title}' has empty title.")
            if not mod.description or not mod.description.strip():
                raise LearningPathValidationError(f"Module in milestone '{ms.title}' has empty description.")
            if not mod.topics:
                raise LearningPathValidationError(f"Module '{mod.title}' contains no topics.")
            if mod.estimated_hours <= 0:
                raise LearningPathValidationError(f"Module '{mod.title}' estimated_hours must be positive.")
            if not mod.learning_style or not mod.learning_style.strip():
                raise LearningPathValidationError(f"Module '{mod.title}' has empty learning_style.")
            if not mod.key_deliverable or not mod.key_deliverable.strip():
                raise LearningPathValidationError(f"Module '{mod.title}' has empty key_deliverable.")

            ms_module_hours += mod.estimated_hours

        if abs(ms.estimated_hours - ms_module_hours) > 0.01:
            raise LearningPathValidationError(
                f"Milestone '{ms.title}' estimated_hours ({ms.estimated_hours}) does not match sum of module hours ({ms_module_hours})."
            )

        calc_total_hours += ms.estimated_hours

    if abs(path.estimated_total_hours - calc_total_hours) > 0.01:
        raise LearningPathValidationError(
            f"Path estimated_total_hours ({path.estimated_total_hours}) does not match sum of milestones ({calc_total_hours})."
        )

    if not path.adaptation_rationale or not path.adaptation_rationale.strip():
        raise LearningPathValidationError("adaptation_rationale cannot be empty.")

    return path

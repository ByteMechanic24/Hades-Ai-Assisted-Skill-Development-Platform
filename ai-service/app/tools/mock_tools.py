"""
Mock Tools Layer for Hades AI Service (Step 2)

Provides deterministic retrieval capabilities for learner profiles, learner skills,
goal requirements, and skill prerequisites. These tools act as modular, replaceable
data adapters that will be consumed by the Agno Learning Path Agent in Step 3.
"""

from typing import List
from app.schemas.models import (
    LearnerProfile,
    SkillItem,
    GoalRequirements,
    SkillPrerequisites,
)
from app.tools.exceptions import (
    LearnerNotFoundError,
    GoalNotFoundError,
    SkillNotFoundError,
)
from app.tools.mock_data import (
    MOCK_LEARNERS_DB,
    MOCK_GOAL_REQUIREMENTS_DB,
    MOCK_SKILL_PREREQUISITES_DB,
)


def get_learner_profile(learner_id: str) -> LearnerProfile:
    """
    Retrieve the profile information for a specified learner.

    Args:
        learner_id: Unique identifier for the learner.

    Returns:
        LearnerProfile containing target goals, constraints, and learning preferences.

    Raises:
        LearnerNotFoundError: If the learner_id does not exist in the data store.
    """
    if not learner_id or not isinstance(learner_id, str):
        raise LearnerNotFoundError(str(learner_id))

    normalized_id = learner_id.strip()
    data = MOCK_LEARNERS_DB.get(normalized_id)
    if not data:
        raise LearnerNotFoundError(normalized_id)

    return LearnerProfile(**data)


def get_learner_skills(learner_id: str) -> List[SkillItem]:
    """
    Retrieve the current skills and proficiency levels for a specified learner.

    Args:
        learner_id: Unique identifier for the learner.

    Returns:
        List of SkillItem instances representing current competencies.

    Raises:
        LearnerNotFoundError: If the learner_id does not exist in the data store.
    """
    profile = get_learner_profile(learner_id)
    return profile.current_skills


def get_goal_requirements(goal: str) -> GoalRequirements:
    """
    Retrieve the requisite skills and domain requirements for a target career/learning goal.

    Args:
        goal: The title or description of the target goal (e.g., 'Become a Data Engineer').

    Returns:
        GoalRequirements containing the list of required competencies and domain metadata.

    Raises:
        GoalNotFoundError: If the goal is unknown or unsupported in the knowledge store.
    """
    if not goal or not isinstance(goal, str):
        raise GoalNotFoundError(str(goal))

    normalized_key = goal.strip().lower()
    data = MOCK_GOAL_REQUIREMENTS_DB.get(normalized_key)
    if not data:
        raise GoalNotFoundError(goal)

    return GoalRequirements(**data)


def get_skill_prerequisites(skill_name: str) -> SkillPrerequisites:
    """
    Retrieve foundational prerequisite skills for a given skill or technology.

    Args:
        skill_name: The name of the skill to query (e.g., 'Scala 3', 'React').

    Returns:
        SkillPrerequisites containing the list of prerequisite skills and category.
        If a skill has no prerequisites, the prerequisites list is empty.

    Raises:
        SkillNotFoundError: If the skill is not present in the prerequisite graph.
    """
    if not skill_name or not isinstance(skill_name, str):
        raise SkillNotFoundError(str(skill_name))

    normalized_key = skill_name.strip().lower()
    data = MOCK_SKILL_PREREQUISITES_DB.get(normalized_key)
    if not data:
        raise SkillNotFoundError(skill_name)

    return SkillPrerequisites(**data)

import re
from typing import List, Dict, Set, Union, Optional, Tuple
from app.schemas.models import SkillItem, SkillGapResult
from app.tools.mock_tools import get_skill_prerequisites
from app.tools.exceptions import SkillNotFoundError


def normalize_text(text: str) -> str:
    """Normalizes string for comparison by removing punctuation and lowercasing."""
    if not text:
        return ""
    return re.sub(r"[^\w\s]", "", text.lower()).strip()


def match_learner_skills(
    required_skills: List[str],
    current_skills: List[SkillItem],
) -> Tuple[List[str], List[str]]:
    """
    Compares agent-determined required skills against skills explicitly
    recorded by the learner.

    A skill is considered already learned ONLY when its normalized name
    exactly matches a normalized learner skill name.

    No proficiency assessment or semantic inference is performed.
    """

    learned_names = {
        normalize_text(skill.skill_name)
        for skill in current_skills
        if skill.skill_name
    }

    already_learned: List[str] = []
    skills_to_learn: List[str] = []

    for required_skill in required_skills:
        normalized_required = normalize_text(required_skill)

        if not normalized_required:
            continue

        if normalized_required in learned_names:
            already_learned.append(required_skill)
        else:
            skills_to_learn.append(required_skill)

    return already_learned, skills_to_learn


# Standard proficiency hierarchy ranking (legacy fallback for standalone tests)
PROFICIENCY_RANK: Dict[str, int] = {
    "beginner": 1,
    "intermediate": 2,
    "advanced": 3,
}


def calculate_skill_gaps(
    current_skills: List[SkillItem],
    required_skills: List[str],
    target_level: str = "intermediate",
) -> SkillGapResult:

    """
    Deterministically compares current learner skills against required skills for a target goal.

    Categorizes each required skill into:
    - covered_skills: present in current skills with proficiency >= target_level.
    - insufficient_skills: present in current skills but proficiency < target_level.
    - missing_skills: completely absent from current skills.

    Args:
        current_skills: List of current skills and proficiencies held by the learner.
        required_skills: List of skill names mandated by the goal.
        target_level: Baseline proficiency level required ('beginner', 'intermediate', 'advanced').

    Returns:
        SkillGapResult with covered, missing, and insufficient skill lists.
    """
    if not required_skills:
        return SkillGapResult(covered_skills=[], missing_skills=[], insufficient_skills=[])

    target_rank = PROFICIENCY_RANK.get(target_level.lower(), 2)

    # Build normalized lookup map of current skills (keyed by lowercased skill_name)
    current_map: Dict[str, SkillItem] = {}
    for item in current_skills:
        if item.skill_name:
            current_map[item.skill_name.strip().lower()] = item

    covered: List[str] = []
    insufficient: List[str] = []
    missing: List[str] = []

    for req in required_skills:
        norm_req = req.strip().lower()
        if norm_req in current_map:
            curr_item = current_map[norm_req]
            curr_rank = PROFICIENCY_RANK.get(curr_item.level.lower(), 1)
            if curr_rank >= target_rank:
                covered.append(req)
            else:
                insufficient.append(req)
        else:
            missing.append(req)

    return SkillGapResult(
        covered_skills=covered,
        missing_skills=missing,
        insufficient_skills=insufficient,
    )


def resolve_prerequisite_chain(
    skills: Union[str, List[str]],
    known_skills: Optional[List[str]] = None,
) -> List[str]:
    """
    Deterministically traverses the prerequisite graph for a set of target/missing skills.

    Features:
    - Performs depth-first dependency resolution.
    - Preserves topological ordering (foundational prerequisites appear before dependents).
    - Detects and handles cycles safely without infinite recursion.
    - Handles foundational skills with no prerequisites cleanly.
    - Filters out skills that are already mastered if known_skills is provided.
    - Guarantees deterministic, de-duplicated output.

    Args:
        skills: A skill name or list of skill names to resolve prerequisites for.
        known_skills: Optional list of skill names the learner already possesses (to omit).

    Returns:
        Ordered list of prerequisite skill names required to unlock the target skills.
    """
    if isinstance(skills, str):
        skill_list = [skills]
    else:
        skill_list = list(skills)

    known_set: Set[str] = set()
    if known_skills:
        known_set = {k.strip().lower() for k in known_skills if k}

    resolved_order: List[str] = []
    visited: Set[str] = set()
    rec_stack: Set[str] = set()

    def _traverse(skill_name: str):
        norm_name = skill_name.strip().lower()
        if norm_name in rec_stack:
            # Cycle detected — break cycle safely
            return
        if norm_name in visited:
            return

        rec_stack.add(norm_name)

        try:
            prereq_info = get_skill_prerequisites(skill_name)
            for prereq in prereq_info.prerequisites:
                _traverse(prereq)
        except SkillNotFoundError:
            # If skill not in graph, treat as having no further known prerequisites
            pass

        rec_stack.remove(norm_name)
        visited.add(norm_name)

        # Include in prerequisite chain if not already known and not in resolved list
        if norm_name not in known_set:
            if skill_name not in resolved_order:
                resolved_order.append(skill_name)

    for s in skill_list:
        if s and s.strip():
            _traverse(s)

    return resolved_order

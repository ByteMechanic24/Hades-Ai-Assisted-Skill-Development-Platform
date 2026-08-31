import pytest
from app.adapters.roadmap_adapter import RoadmapAdapter, default_roadmap_adapter
from app.schemas.models import (
    Roadmap,
    RoadmapSearchResult,
    LearningPathResponse,
    LearningPathMilestone,
    LearningPathModule,
)
from app.tools.roadmap_tools import (
    search_roadmaps,
    get_roadmap,
    validate_learning_path,
    LearningPathValidationError,
)


class TestRoadmapAdapter:
    """Unit tests for RoadmapAdapter discovery and retrieval."""

    def test_search_roadmaps_exact_match(self):
        result = search_roadmaps("Become a Data Engineer")
        assert result is not None
        assert isinstance(result, RoadmapSearchResult)
        assert result.roadmap_id == "data-engineer"
        assert result.match_score >= 0.7
        assert "Data Engineer" in result.title

    def test_search_roadmaps_alias_match(self):
        result = search_roadmaps("full stack web developer")
        assert result is not None
        assert result.roadmap_id == "full-stack"

    def test_search_roadmaps_unknown_goal_returns_none(self):
        result = search_roadmaps("Become a Specialized Quantum Cryptozoologist")
        assert result is None

    def test_search_roadmaps_empty_goal_returns_none(self):
        assert search_roadmaps("") is None

    def test_get_roadmap_success_preserves_ordering(self):
        roadmap = get_roadmap("data-engineer")
        assert roadmap is not None
        assert isinstance(roadmap, Roadmap)
        assert roadmap.source_identifier == "data-engineer"
        assert len(roadmap.nodes) > 0

        # Check strict ordering of nodes
        for i, node in enumerate(roadmap.nodes, start=1):
            assert node.order == i
            if node.children:
                for j, child in enumerate(node.children, start=1):
                    assert child.order == j

    def test_get_roadmap_unknown_id_returns_none(self):
        assert get_roadmap("non-existent-roadmap") is None


class TestValidateLearningPath:
    """Unit tests for validate_learning_path."""

    def test_valid_path_passes_validation(self):
        valid_response = LearningPathResponse(
            path_id="path-123",
            learner_id="learner-1",
            target_goal="Test Goal",
            title="Test Path",
            summary="A comprehensive summary",
            target_role="Software Engineer",
            estimated_total_weeks=4,
            estimated_total_hours=40.0,
            milestones=[
                LearningPathMilestone(
                    milestone_id="ms-1",
                    order=1,
                    title="Milestone 1",
                    objective="Learn fundamentals",
                    prerequisite_skills=[],
                    modules=[
                        LearningPathModule(
                            module_id="mod-1-1",
                            title="Module 1",
                            description="Module overview",
                            topics=["Topic 1", "Topic 2"],
                            estimated_hours=40.0,
                            learning_style="hands-on",
                            key_deliverable="Deliverable 1",
                        )
                    ],
                    estimated_hours=40.0,
                )
            ],
            skill_gap_analysis=["Topic 1"],
            adaptation_rationale="Paced over 4 weeks.",
        )
        validated = validate_learning_path(valid_response)
        assert validated.path_id == "path-123"

    def test_empty_milestone_id_fails_validation(self):
        invalid_response = LearningPathResponse(
            path_id="path-123",
            learner_id="learner-1",
            target_goal="Test Goal",
            title="Test Path",
            summary="Summary",
            target_role="Engineer",
            estimated_total_weeks=2,
            estimated_total_hours=20.0,
            milestones=[
                LearningPathMilestone(
                    milestone_id="",
                    order=1,
                    title="Milestone 1",
                    objective="Objective",
                    modules=[
                        LearningPathModule(
                            module_id="mod-1",
                            title="Mod 1",
                            description="Desc",
                            topics=["T1"],
                            estimated_hours=20.0,
                            learning_style="hands-on",
                            key_deliverable="Proj",
                        )
                    ],
                    estimated_hours=20.0,
                )
            ],
            skill_gap_analysis=["T1"],
            adaptation_rationale="Rationale",
        )
        with pytest.raises(LearningPathValidationError) as exc_info:
            validate_learning_path(invalid_response)
        assert "empty milestone_id" in str(exc_info.value)

    def test_mismatched_hours_fails_validation(self):
        invalid_response = LearningPathResponse(
            path_id="path-123",
            learner_id="learner-1",
            target_goal="Test Goal",
            title="Test Path",
            summary="Summary",
            target_role="Engineer",
            estimated_total_weeks=2,
            estimated_total_hours=50.0,  # Mismatch with milestone (20.0)
            milestones=[
                LearningPathMilestone(
                    milestone_id="ms-1",
                    order=1,
                    title="Milestone 1",
                    objective="Objective",
                    modules=[
                        LearningPathModule(
                            module_id="mod-1",
                            title="Mod 1",
                            description="Desc",
                            topics=["T1"],
                            estimated_hours=20.0,
                            learning_style="hands-on",
                            key_deliverable="Proj",
                        )
                    ],
                    estimated_hours=20.0,
                )
            ],
            skill_gap_analysis=["T1"],
            adaptation_rationale="Rationale",
        )
        with pytest.raises(LearningPathValidationError) as exc_info:
            validate_learning_path(invalid_response)
        assert "does not match sum of milestones" in str(exc_info.value)

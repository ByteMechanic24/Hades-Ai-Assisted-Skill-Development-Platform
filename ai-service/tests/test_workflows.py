"""
Comprehensive Tests for Agno 2.0 Workflows & Orchestrator
"""

from unittest.mock import MagicMock
import pytest
from app.schemas.models import (
    LearnerProfile,
    SkillItem,
    SkillAnalysis,
    LearningPathResponse,
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
    SearchQueryPlan,
)
from app.workflows.learning_path_workflow import (
    LearningPathWorkflow,
    create_learning_path_workflow,
)
from app.workflows.topic_resource_workflow import (
    TopicResourceDiscoveryWorkflow,
    create_topic_resource_workflow,
)
from app.agents.resource_discovery_agent import create_resource_discovery_agent
from orchestrator import AIOrchestrator, create_orchestrator
from app.tools.resource_tools import FakeTavilySearchClient, is_valid_youtube_url
from app.db.exceptions import LearnerNotFoundError


@pytest.fixture
def mock_resource_agent():
    mock_agent_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.content = SearchQueryPlan(
        youtube_query="Scala 3 fundamentals tutorial",
        general_query="Scala 3 official documentation guide",
        search_intent="Learn Scala 3 core fundamentals and FP concepts.",
    )
    mock_agent_instance.run.return_value = mock_response
    return create_resource_discovery_agent(
        search_provider=FakeTavilySearchClient(),
        agent_instance=mock_agent_instance,
    )


# ============================================================================
# 1. TOPIC RESOURCE DISCOVERY WORKFLOW TESTS
# ============================================================================

class TestTopicResourceDiscoveryWorkflow:
    """Verifies the parallel Agno 2.0 workflow for topic resource discovery."""


    def test_workflow_parallel_discovery_success(self, mock_resource_agent):
        fake_client = FakeTavilySearchClient()
        wf = create_topic_resource_workflow(
            search_provider=fake_client,
            resource_agent=mock_resource_agent,
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-scala-fp",
            topic_title="Scala 3 fundamentals",
            target_goal="Scala Backend Engineer",
            experience_level="intermediate",
            current_skills=[SkillItem(skill_name="Scala", level="intermediate")],
            learning_preferences=["hands-on", "video"],
            max_youtube_resources=2,
            max_general_resources=2,
        )

        resp: TopicResourceDiscoveryResponse = wf.run(req, provider=fake_client)
        assert isinstance(resp, TopicResourceDiscoveryResponse)
        assert resp.learner_id == "learner-1049"
        assert resp.topic_id == "top-scala-fp"
        assert len(resp.youtube_resources) >= 1
        assert len(resp.general_resources) >= 1
        assert "Curated" in resp.summary

        for yt in resp.youtube_resources:
            assert is_valid_youtube_url(yt.url)
            assert yt.resource_type == "video"
            assert yt.source == "YouTube"

    def test_workflow_parallel_fault_tolerance(self, mock_resource_agent):
        """When General search branch fails in parallel, YouTube results still return cleanly."""
        failing_client = FakeTavilySearchClient(simulate_general_error=True)
        wf = create_topic_resource_workflow(
            search_provider=failing_client,
            resource_agent=mock_resource_agent,
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-akka-actors",
            topic_title="Akka & Pekko Typed Actors",
            target_goal="Distributed Systems Engineer",
        )

        resp = wf.run(req, provider=failing_client)
        assert len(resp.youtube_resources) >= 1
        assert len(resp.general_resources) == 0
        assert "Secondary documentation search was unavailable" in resp.summary

    def test_workflow_invalid_input_raises_error(self, mock_resource_agent):
        wf = create_topic_resource_workflow(
            search_provider=FakeTavilySearchClient(),
            resource_agent=mock_resource_agent,
        )
        with pytest.raises(ValueError, match="topic_title cannot be empty"):
            wf.run(
                TopicResourceDiscoveryRequest(
                    learner_id="learner-1049",
                    topic_id="top-1",
                    topic_title="",
                    target_goal="Goal",
                )
            )



# ============================================================================
# 2. ORCHESTRATOR TESTS
# ============================================================================

class TestAIOrchestrator:
    """Verifies top-level AIOrchestrator coordination."""

    def test_orchestrator_initialization_and_methods(self, mock_resource_agent):
        fake_client = FakeTavilySearchClient()
        orch = AIOrchestrator(
            topic_resource_workflow=create_topic_resource_workflow(
                search_provider=fake_client,
                resource_agent=mock_resource_agent,
            )
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-fastapi",
            topic_title="FastAPI REST API Authentication",
            target_goal="Python Backend Engineer",
        )

        resp = orch.discover_topic_resources(req, provider=fake_client)
        assert resp.topic_id == "top-fastapi"
        assert len(resp.youtube_resources) >= 1



# ============================================================================
# 3. LIVE INTEGRATION TESTS (REAL POSTGRESQL & WORKFLOWS)
# ============================================================================

@pytest.mark.integration
class TestWorkflowPostgresIntegration:
    """Verifies real PostgreSQL execution through LearningPathWorkflow."""

    def test_learning_path_workflow_seeded_learner_1049(self):
        wf = create_learning_path_workflow()
        path_resp: LearningPathResponse = wf.run(learner_id="learner-1049")

        assert isinstance(path_resp, LearningPathResponse)
        assert path_resp.learner_id == "learner-1049"
        assert path_resp.estimated_total_hours > 0
        assert len(path_resp.milestones) >= 1

    def test_learning_path_workflow_unknown_learner_raises_not_found(self):
        wf = create_learning_path_workflow()
        with pytest.raises(LearnerNotFoundError):
            wf.run(learner_id="nonexistent-learner-99999")

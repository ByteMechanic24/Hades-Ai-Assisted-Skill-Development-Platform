"""
Tests for Central Autonomous AI Orchestrator (Step 4)

Verifies autonomous decision-making, incremental roadmap chunking,
next-topic prefetching, failure tolerance, and Pydantic response contracts.
"""

from unittest.mock import MagicMock, patch
import pytest

from app.schemas.models import (
    LearnerProfile,
    SkillAnalysis,
    SkillItem,
    RoadmapChunk,
    LearningPathMilestone,
    LearningPathModule,
    LearningPathResponse,
    TopicResourceDiscoveryResponse,
    LearningResource,
    OrchestrationRequest,
    OrchestrationResponse,
    OrchestratorDecision,
    OrchestrationState,
)
from app.agents.orchestrator_agent import (
    AutonomousOrchestratorAgent,
    create_orchestrator_agent,
)
from app.tools.orchestrator_tools import (
    OrchestratorTools,
    create_orchestrator_tools,
)
from app.tools.resource_tools import FakeTavilySearchClient
from orchestrator import AIOrchestrator, create_orchestrator
from app.db.orchestrator_state import clear_state_cache


@pytest.fixture(autouse=True)
def clean_cache():
    clear_state_cache()
    yield
    clear_state_cache()


@pytest.fixture
def mock_learner_profile():
    return LearnerProfile(
        learner_id="test-learner-999",
        target_goal="Become a Distributed Systems Architect",
        career_aspirations=["Principal Architect"],
        current_skills=[
            SkillItem(skill_name="Java", level="intermediate", years_of_experience=3.0),
        ],
        interests=["Distributed Logs", "Actors"],
        available_hours_per_week=10.0,
        learning_preferences=["hands-on", "video"],
        experience_level="intermediate",
    )


# ============================================================================
# 1. AUTONOMOUS DECISION-MAKING SCENARIO TESTS
# ============================================================================

class TestAutonomousOrchestrationScenarios:
    """Verifies that Orchestrator makes contextual decisions across different states."""

    def test_scenario_1_fresh_learner_triggers_skill_analysis(self, mock_learner_profile):
        """
        TEST 1: New learner with no analysis.
        Orchestrator Agent decides that skill analysis is required.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="ANALYZE_SKILLS",
            rationale="Learner has no prior skill analysis for target goal.",
            should_continue=True,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        mock_tools.run_skill_analysis.return_value = {
            "success": True,
            "target_goal": "Become a Distributed Systems Architect",
            "required_skills": ["Scala 3", "Distributed Consensus", "Kafka"],
            "already_learned": ["Java"],
            "skills_to_learn": ["Scala 3", "Distributed Consensus"],
            "reasoning_summary": "Java skills give strong OOP foundations, need FP and distributed theory.",
        }

        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(
            learner_id="test-learner-999",
            event="SESSION_START",
            target_goal="Become a Distributed Systems Architect",
        )

        resp = orch.orchestrate(req)
        assert isinstance(resp, OrchestrationResponse)
        assert resp.next_recommended_action == "ANALYZE_SKILLS"
        assert "no prior skill analysis" in resp.rationale
        mock_tools.run_skill_analysis.assert_called_once()

    def test_scenario_2_analysis_present_triggers_roadmap_chunk(self, mock_learner_profile):
        """
        TEST 2: Skill analysis exists but roadmap does not.
        Orchestrator Agent decides to generate the first roadmap chunk.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="GENERATE_ROADMAP_CHUNK",
            rationale="Skill analysis completed; generating initial roadmap chunk.",
            should_continue=True,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        mock_tools.generate_roadmap_chunk.return_value = {
            "success": True,
            "chunk": {
                "chunk_id": "chunk-101",
                "roadmap_id": "road-999",
                "sequence_number": 1,
                "title": "Core Foundations",
                "milestones": [],
                "topics": ["Scala 3 Basics", "Actor Concurrency"],
                "has_more": True,
                "next_generation_hint": "Distributed Storage",
            },
            "topics": ["Scala 3 Basics", "Actor Concurrency"],
            "has_more": True,
            "sequence_number": 1,
            "roadmap_id": "road-999",
        }

        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(learner_id="test-learner-999", event="GENERATE_ROADMAP")
        resp = orch.orchestrate(req)

        assert resp.next_recommended_action == "GENERATE_ROADMAP_CHUNK"
        assert resp.current_chunk is not None
        assert resp.current_chunk.title == "Core Foundations"
        assert "Scala 3 Basics" in resp.available_topics
        mock_tools.generate_roadmap_chunk.assert_called_once()

    def test_scenario_3_active_topic_triggers_next_topic_prefetch(self):
        """
        TEST 3: Roadmap exists, learner is on Topic 1.
        Orchestrator Agent proactively decides to prefetch Topic 2.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="PREFETCH_NEXT_TOPIC",
            target_topic="Actor Concurrency",
            rationale="Prefetching Topic 2 while learner studies Topic 1 to eliminate downstream latency.",
            should_continue=False,
        )

        fake_resource_resp = {
            "learner_id": "test-learner-999",
            "topic_id": "top-actor-2",
            "topic_title": "Actor Concurrency",
            "youtube_resources": [
                {
                    "resource_id": "res-yt-1",
                    "title": "Actor Model in Scala Tutorial",
                    "url": "https://www.youtube.com/watch?v=actor123",
                    "resource_type": "video",
                    "source": "YouTube",
                    "relevance_score": 0.92,
                    "why_recommended": ["Matches topic"],
                }
            ],
            "general_resources": [],
            "summary": "Curated actor model tutorials.",
        }

        mock_tools = MagicMock(spec=OrchestratorTools)
        mock_tools.prefetch_topic_resources.return_value = {
            "success": True,
            "topic_title": "Actor Concurrency",
            "youtube_count": 1,
            "general_count": 0,
            "response": fake_resource_resp,
            "summary": "Curated actor model tutorials.",
        }

        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(
            learner_id="test-learner-999",
            event="TOPIC_STUDY",
            current_topic_id="Scala 3 Basics",
        )
        resp = orch.orchestrate(req)

        assert resp.next_recommended_action == "PREFETCH_NEXT_TOPIC"
        assert "Actor Concurrency" in resp.prefetched_topics
        assert "eliminate downstream latency" in resp.rationale
        mock_tools.prefetch_topic_resources.assert_called_once()

    def test_scenario_4_chunk_nearly_exhausted_triggers_next_chunk(self):
        """
        TEST 4: Current chunk is nearly exhausted.
        Orchestrator Agent decides to generate the next roadmap chunk.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="GENERATE_ROADMAP_CHUNK",
            rationale="Current chunk topics completed; generating chunk #2.",
            should_continue=True,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        mock_tools.generate_roadmap_chunk.return_value = {
            "success": True,
            "chunk": {
                "chunk_id": "chunk-102",
                "roadmap_id": "road-999",
                "sequence_number": 2,
                "title": "Distributed Storage & Streams",
                "milestones": [],
                "topics": ["Kafka Streaming", "Raft Consensus"],
                "has_more": False,
            },
            "topics": ["Kafka Streaming", "Raft Consensus"],
            "has_more": False,
            "sequence_number": 2,
            "roadmap_id": "road-999",
        }

        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(
            learner_id="test-learner-999",
            event="NEXT_CHUNK",
        )
        resp = orch.orchestrate(req)

        assert resp.next_recommended_action == "GENERATE_ROADMAP_CHUNK"
        assert resp.current_chunk.sequence_number == 2
        mock_tools.generate_roadmap_chunk.assert_called_once()

    def test_scenario_5_cached_resources_avoids_duplicate_search(self):
        """
        TEST 5: Resources for topic already exist.
        Orchestrator Agent returns current state without re-invoking search tools.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="RETURN_CURRENT_STATE",
            rationale="All materials for active and upcoming topics are ready in cache.",
            should_continue=False,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(
            learner_id="test-learner-999",
            event="STATUS_CHECK",
        )
        resp = orch.orchestrate(req)

        assert resp.next_recommended_action == "RETURN_CURRENT_STATE"
        mock_tools.discover_topic_resources.assert_not_called()
        mock_tools.prefetch_topic_resources.assert_not_called()

    def test_scenario_6_tool_failure_handled_gracefully(self):
        """
        TEST 6: Tool failure does not crash the session.
        Orchestrator handles error recovery gracefully.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="PREPARE_TOPIC_RESOURCES",
            target_topic="Experimental Methodology",
            rationale="Attempting resource discovery for active topic.",
            should_continue=False,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        mock_tools.discover_topic_resources.return_value = {
            "success": False,
            "error": "Tavily rate limit exceeded",
            "topic_title": "Experimental Methodology",
        }

        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(
            learner_id="test-learner-999",
            event="TOPIC_OPEN",
            current_topic_id="Experimental Methodology",
        )
        resp = orch.orchestrate(req)

        assert isinstance(resp, OrchestrationResponse)
        assert resp.learner_id == "test-learner-999"

    def test_scenario_7_ready_state_yields_immediately(self):
        """
        TEST 7: When everything is ready, Orchestrator returns state without extra agent calls.
        """
        mock_agent = MagicMock()
        mock_agent.run.return_value.content = OrchestratorDecision(
            action="WAIT_FOR_LEARNER",
            rationale="Active topic is ready with full resources. Waiting for learner completion.",
            should_continue=False,
        )

        mock_tools = MagicMock(spec=OrchestratorTools)
        agent = create_orchestrator_agent(agent_instance=mock_agent)
        orch = AIOrchestrator(orchestrator_agent=agent, tools=mock_tools, max_steps=1)

        req = OrchestrationRequest(learner_id="test-learner-999", event="POLL_STATUS")
        resp = orch.orchestrate(req)

        assert resp.next_recommended_action == "WAIT_FOR_LEARNER"
        assert resp.can_continue is True

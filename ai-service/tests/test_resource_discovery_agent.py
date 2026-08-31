"""
Comprehensive Test Suite for Step 3C: Topic-Level Resource Discovery Agent
"""

from unittest.mock import MagicMock
import pytest
from pydantic import ValidationError

from app.schemas.models import (
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
    SearchQueryPlan,
    LearningResource,
    SkillItem,
)
from app.tools.resource_tools import (
    QueryBuilder,
    ResourceSearchProvider,
    FakeTavilySearchClient,
    TavilySearchClient,
    is_valid_youtube_url,
    normalize_and_rank_resources,
    RESOURCE_SEARCH_CANDIDATE_COUNT,
    ResourceProviderError,
)
from app.agents.resource_discovery_agent import (
    ResourceDiscoveryAgent,
    create_resource_discovery_agent,
)


# ============================================================================
# 1. SCHEMA VALIDATION TESTS
# ============================================================================

class TestResourceDiscoverySchemas:
    """Validates Pydantic schema constraints and bounds for Step 3C models."""

    def test_valid_search_query_plan(self):
        plan = SearchQueryPlan(
            youtube_query="Scala 3 pattern matching tutorial",
            general_query="Scala 3 pattern matching documentation guide",
            required_concepts=["pattern matching", "sealed traits"],
            excluded_concepts=["scala 2", "legacy syntax"],
            preferred_domains=["docs.scala-lang.org"],
            excluded_domains=["w3schools.com"],
            search_intent="Learn modern pattern matching and guard clauses in Scala 3.",
        )
        assert plan.youtube_query == "Scala 3 pattern matching tutorial"
        assert len(plan.required_concepts) == 2
        assert plan.preferred_domains == ["docs.scala-lang.org"]

    def test_valid_learning_resource(self):
        res = LearningResource(
            resource_id="res-1",
            title="Scala 3 Masterclass",
            url="https://www.youtube.com/watch?v=scala123",
            resource_type="video",
            source="YouTube",
            description="Complete Scala tutorial",
            relevance_score=0.95,
            difficulty="intermediate",
            estimated_time="30 mins",
            why_recommended=["Direct topic match"],
        )
        assert res.resource_id == "res-1"
        assert res.relevance_score == 0.95
        assert res.resource_type == "video"

    def test_invalid_relevance_score_raises_validation_error(self):
        with pytest.raises(ValidationError):
            LearningResource(
                resource_id="res-1",
                title="Invalid Score Resource",
                url="https://www.youtube.com/watch?v=test",
                resource_type="video",
                source="YouTube",
                relevance_score=1.5,  # Exceeds max 1.0
            )

        with pytest.raises(ValidationError):
            LearningResource(
                resource_id="res-1",
                title="Invalid Score Resource",
                url="https://www.youtube.com/watch?v=test",
                resource_type="video",
                source="YouTube",
                relevance_score=-0.1,  # Below min 0.0
            )

    def test_invalid_resource_type_raises_validation_error(self):
        with pytest.raises(ValidationError):
            LearningResource(
                resource_id="res-1",
                title="Invalid Type",
                url="https://www.youtube.com/watch?v=test",
                resource_type="unknown_type",  # Not in Literal
                source="YouTube",
            )

    def test_valid_discovery_request_and_response(self):
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-scala-fp",
            topic_title="Immutability & Pattern Matching",
            target_goal="Become a Senior Backend Scala Engineer",
            experience_level="intermediate",
            current_skills=[SkillItem(skill_name="Scala", level="intermediate")],
            learning_preferences=["hands-on", "video"],
        )
        assert req.topic_id == "top-scala-fp"
        assert req.max_youtube_resources == 5
        assert req.max_general_resources == 5

        resp = TopicResourceDiscoveryResponse(
            learner_id=req.learner_id,
            topic_id=req.topic_id,
            topic_title=req.topic_title,
            youtube_resources=[],
            general_resources=[],
            summary="Test summary",
        )
        assert resp.learner_id == "learner-1049"


# ============================================================================
# 2. QUERY BUILDER TESTS
# ============================================================================

class TestQueryBuilder:
    """Verifies that QueryBuilder deterministically maps SearchQueryPlan to Tavily parameters."""

    def test_youtube_search_parameters_construction(self):
        plan = SearchQueryPlan(
            youtube_query="FastAPI OAuth2 JWT authentication tutorial",
            general_query="FastAPI security authentication documentation",
            search_intent="Learn FastAPI JWT authentication implementation",
        )
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-1",
            topic_title="REST API Authentication",
            target_goal="Backend Python Engineer",
        )
        params = QueryBuilder.build_youtube_search_parameters(plan, req)
        assert params["query"] == "FastAPI OAuth2 JWT authentication tutorial"
        assert params["include_domains"] == ["youtube.com"]
        assert params["max_results"] == RESOURCE_SEARCH_CANDIDATE_COUNT
        assert params["search_depth"] == "advanced"

    def test_general_search_parameters_construction_with_domains(self):
        plan = SearchQueryPlan(
            youtube_query="Kafka event sourcing tutorial",
            general_query="Event Sourcing CQRS Kafka architectural patterns",
            preferred_domains=["martinfowler.com", "https://docs.confluent.io/guide"],
            excluded_domains=["pinterest.com", "youtube.com"],
            search_intent="Authoritative patterns on Event Sourcing with Kafka",
        )
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-3",
            topic_title="Event Sourcing with Kafka",
            target_goal="Data Architect",
        )
        params = QueryBuilder.build_general_search_parameters(plan, req)
        assert params["query"] == "Event Sourcing CQRS Kafka architectural patterns"
        assert params["max_results"] == RESOURCE_SEARCH_CANDIDATE_COUNT
        assert params["search_depth"] == "advanced"
        assert "pinterest.com" in params["exclude_domains"]


# ============================================================================
# 3. URL INTEGRITY & PROVIDER TESTS
# ============================================================================

class TestURLIntegrityAndProvider:
    """Validates URL verification, Tavily client abstractions, and error handling."""

    def test_youtube_url_validator(self):
        assert is_valid_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ") is True
        assert is_valid_youtube_url("https://youtu.be/dQw4w9WgXcQ") is True
        assert is_valid_youtube_url("https://youtube.com/playlist?list=PL123456789") is True
        assert is_valid_youtube_url("https://www.youtube.com/embed/dQw4w9WgXcQ") is True

        # Non-YouTube URLs rejected
        assert is_valid_youtube_url("https://medium.com/@dev/scala-tutorial") is False
        assert is_valid_youtube_url("https://vimeo.com/123456") is False
        assert is_valid_youtube_url("https://youtube.com.attacker.com/watch") is False
        assert is_valid_youtube_url("") is False
        assert is_valid_youtube_url(None) is False

    def test_fake_search_client_deterministic_results(self):
        client = FakeTavilySearchClient()
        yt_results = client.search_youtube("Scala 3 fundamentals")
        assert len(yt_results) >= 1
        assert "Scala 3" in yt_results[0]["title"]
        assert "youtube.com" in yt_results[0]["url"]

        gen_results = client.search_general("Scala 3 documentation")
        assert len(gen_results) >= 1
        assert "Scala 3" in gen_results[0]["title"]

    def test_fake_search_client_simulated_errors(self):
        yt_err_client = FakeTavilySearchClient(simulate_youtube_error=True)
        with pytest.raises(ResourceProviderError, match="Simulated Tavily YouTube search failure"):
            yt_err_client.search_youtube("FastAPI")

        gen_err_client = FakeTavilySearchClient(simulate_general_error=True)
        with pytest.raises(ResourceProviderError, match="Simulated Tavily General search failure"):
            gen_err_client.search_general("FastAPI")

    def test_tavily_client_missing_api_key_raises_error(self):
        client = TavilySearchClient(api_key="")
        with pytest.raises(ResourceProviderError, match="Tavily API key is not configured"):
            client.search_youtube("Python")

    def test_tavily_client_sanitizes_api_key(self):
        secret = "secret-key-12345"
        client = TavilySearchClient(api_key=secret)
        sanitized = client._sanitize(f"Error calling Tavily with key {secret} on endpoint.")
        assert secret not in sanitized
        assert "[REDACTED_API_KEY]" in sanitized


# ============================================================================
# 4. RANKING & NORMALIZATION TESTS
# ============================================================================

class TestRankingAndNormalization:
    """Verifies deterministic ranking, deduplication, and score bounds."""

    def test_normalize_and_rank_filters_non_youtube_urls(self):
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-1",
            topic_title="Scala 3",
            target_goal="Scala Engineer",
        )
        raw_items = [
            {"title": "Scala 3 YouTube", "url": "https://www.youtube.com/watch?v=123", "content": "Scala 3 tutorial", "score": 0.9},
            {"title": "Scala 3 Blog", "url": "https://medium.com/@dev/scala3", "content": "Scala 3 article", "score": 0.95},
        ]
        results = normalize_and_rank_resources(raw_items, req, is_youtube_stream=True)
        assert len(results) == 1
        assert results[0].url == "https://www.youtube.com/watch?v=123"
        assert results[0].resource_type == "video"
        assert results[0].source == "YouTube"

    def test_deduplication_by_url(self):
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-1",
            topic_title="Scala 3",
            target_goal="Scala Engineer",
        )
        raw_items = [
            {"title": "Scala 3 Guide", "url": "https://docs.scala-lang.org/scala3/", "content": "Scala 3 docs", "score": 0.9},
            {"title": "Scala 3 Guide Duplicate", "url": "https://docs.scala-lang.org/scala3", "content": "Duplicate url", "score": 0.9},
        ]
        results = normalize_and_rank_resources(raw_items, req, is_youtube_stream=False)
        assert len(results) == 1

    def test_ranking_is_deterministic_and_bounded(self):
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-1",
            topic_title="FastAPI REST API Authentication",
            target_goal="Backend Python Engineer",
            experience_level="intermediate",
            current_skills=[SkillItem(skill_name="FastAPI", level="intermediate")],
            learning_preferences=["video", "hands-on"],
        )
        raw_items = [
            {
                "title": "FastAPI REST API Authentication & JWT Step-by-Step",
                "url": "https://www.youtube.com/watch?v=fastapi1",
                "content": "FastAPI authentication with JWT and Python backend security.",
                "score": 0.95,
            },
            {
                "title": "General Introduction to Computer Networking",
                "url": "https://www.youtube.com/watch?v=networking1",
                "content": "Basics of IP addressing and subnets.",
                "score": 0.50,
            },
        ]
        results = normalize_and_rank_resources(raw_items, req, is_youtube_stream=True)
        assert len(results) == 2
        # Highest match must be ranked first
        assert "FastAPI" in results[0].title
        assert results[0].relevance_score > results[1].relevance_score
        assert 0.0 <= results[0].relevance_score <= 1.0
        assert 0.0 <= results[1].relevance_score <= 1.0
        assert len(results[0].why_recommended) >= 1


# ============================================================================
# 5. AGENT EXECUTION & FAULT TOLERANCE TESTS
# ============================================================================

class TestResourceDiscoveryAgent:
    """Verifies ResourceDiscoveryAgent on-demand workflow and fault tolerance."""

    @pytest.fixture
    def mock_agent_instance(self):
        """Creates a mock Agno Agent returning deterministic SearchQueryPlan."""
        mock_agent = MagicMock()
        mock_response = MagicMock()
        mock_response.content = SearchQueryPlan(
            youtube_query="Scala 3 fundamentals tutorial",
            general_query="Scala 3 official documentation guide",
            required_concepts=["immutability", "pattern matching"],
            search_intent="Learn Scala 3 core fundamentals and FP concepts.",
        )
        mock_agent.run.return_value = mock_response
        return mock_agent

    def test_discover_topic_resources_success(self, mock_agent_instance):
        fake_client = FakeTavilySearchClient()
        agent = create_resource_discovery_agent(
            search_provider=fake_client,
            agent_instance=mock_agent_instance,
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-scala-syntax",
            topic_title="Scala 3 fundamentals",
            target_goal="Scala Backend Engineer",
            experience_level="intermediate",
            current_skills=[SkillItem(skill_name="Scala", level="intermediate")],
            learning_preferences=["hands-on", "video"],
            max_youtube_resources=2,
            max_general_resources=2,
        )

        resp = agent.discover_topic_resources(req)
        assert isinstance(resp, TopicResourceDiscoveryResponse)
        assert resp.learner_id == "learner-1049"
        assert resp.topic_id == "top-scala-syntax"
        assert len(resp.youtube_resources) >= 1
        assert len(resp.general_resources) >= 1
        assert "Curated" in resp.summary

        # Check YouTube resource integrity
        for yt in resp.youtube_resources:
            assert is_valid_youtube_url(yt.url)
            assert yt.resource_type == "video"
            assert yt.source == "YouTube"

    def test_fault_tolerance_when_general_search_fails(self, mock_agent_instance):
        """If optional general search fails, YouTube results still return cleanly."""
        failing_client = FakeTavilySearchClient(simulate_general_error=True)
        agent = create_resource_discovery_agent(
            search_provider=failing_client,
            agent_instance=mock_agent_instance,
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-akka-actors",
            topic_title="Akka & Pekko Typed Actors",
            target_goal="Distributed Systems Engineer",
            include_general_resources=True,
        )

        resp = agent.discover_topic_resources(req)
        assert len(resp.youtube_resources) >= 1
        assert len(resp.general_resources) == 0
        assert "Secondary documentation search was unavailable" in resp.summary

    def test_standalone_youtube_discovery(self, mock_agent_instance):
        fake_client = FakeTavilySearchClient()
        agent = create_resource_discovery_agent(
            search_provider=fake_client,
            agent_instance=mock_agent_instance,
        )

        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-kafka",
            topic_title="Event Sourcing with Kafka",
            target_goal="Data Architect",
        )

        yt_resources = agent.discover_youtube_resources(req)
        assert len(yt_resources) >= 1
        assert is_valid_youtube_url(yt_resources[0].url)

    def test_empty_request_fields_raise_validation_error(self, mock_agent_instance):
        agent = create_resource_discovery_agent(
            search_provider=FakeTavilySearchClient(),
            agent_instance=mock_agent_instance,
        )

        with pytest.raises(ValueError, match="topic_id cannot be empty"):
            agent.discover_topic_resources(
                TopicResourceDiscoveryRequest(
                    learner_id="learner-1049",
                    topic_id="   ",
                    topic_title="Scala",
                    target_goal="Scala Engineer",
                )
            )

        with pytest.raises(ValueError, match="topic_title cannot be empty"):
            agent.discover_topic_resources(
                TopicResourceDiscoveryRequest(
                    learner_id="learner-1049",
                    topic_id="top-1",
                    topic_title="",
                    target_goal="Scala Engineer",
                )
            )


# ============================================================================
# 6. INTEGRATION WITH REAL POSTGRESQL LEARNER CONTEXT
# ============================================================================

@pytest.mark.integration
class TestResourceDiscoveryIntegration:
    """Verifies that ResourceDiscoveryAgent can hydrate context from real PostgreSQL."""

    def test_discover_with_postgresql_learner_hydration(self):
        mock_agent = MagicMock()
        mock_response = MagicMock()
        mock_response.content = SearchQueryPlan(
            youtube_query="Scala 3 fundamentals tutorial",
            general_query="Scala 3 language guide documentation",
            search_intent="Learn Scala 3 from beginner to intermediate",
        )
        mock_agent.run.return_value = mock_response

        fake_client = FakeTavilySearchClient()
        agent = create_resource_discovery_agent(
            search_provider=fake_client,
            agent_instance=mock_agent,
        )

        # learner-1049 is the seeded PostgreSQL learner
        req = TopicResourceDiscoveryRequest(
            learner_id="learner-1049",
            topic_id="top-seeded-test",
            topic_title="Scala 3 fundamentals",
            target_goal="Scala Backend Engineer",
            # Leave skills and preferences empty to verify hydration from DB
            current_skills=[],
            learning_preferences=[],
        )

        resp = agent.discover_topic_resources(req, hydrate_from_db=True)
        assert resp.learner_id == "learner-1049"
        assert len(resp.youtube_resources) >= 1


"""
Topic-Level Resource Discovery Agent (Step 3C)

Discovers, ranks, and filters tailored YouTube video tutorials and technical documentation
on-demand for an active roadmap topic using Tavily Search, Mistral, and real PostgreSQL learner context.
"""

import json
import logging
from typing import Optional, List
from agno.agent import Agent
from agno.models.mistral import MistralChat

from app.core.config import settings
from app.schemas.models import (
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
    SearchQueryPlan,
    LearningResource,
    LearnerProfile,
)
from app.db.learner_context import get_learner_context
from app.tools.resource_tools import (
    ResourceSearchProvider,
    TavilySearchClient,
    QueryBuilder,
    normalize_and_rank_resources,
    RESOURCE_SEARCH_CANDIDATE_COUNT,
    ResourceProviderError,
)

logger = logging.getLogger(__name__)


class ResourceDiscoveryAgent:
    """
    Agno-based agent responsible for discovering and ranking learning resources
    on demand for a single active roadmap topic.
    """

    def __init__(
        self,
        model_id: Optional[str] = None,
        api_key: Optional[str] = None,
        search_provider: Optional[ResourceSearchProvider] = None,
        agent_instance: Optional[Agent] = None,
    ):
        self.model_id = model_id or settings.MISTRAL_ANALYSIS_MODEL_ID
        self.api_key = api_key or settings.MISTRAL_API_KEY
        self.search_provider = search_provider or TavilySearchClient()

        if agent_instance is not None:
            self._agent = agent_instance
        else:
            mistral_model = MistralChat(
                id=self.model_id,
                api_key=self.api_key or "mock-key",
            )
            self._agent = Agent(
                name="ResourceDiscoveryAgent",
                model=mistral_model,
                output_schema=SearchQueryPlan,
                description="Expert search-intent specialist for educational resource discovery.",
                instructions=[
                    """ You are an expert educational search-query planner.

                        Generate exactly ONE YouTube search query and ONE general-web search query.

                        The ACTIVE ROADMAP TOPIC is the primary search intent.
                        The target career/goal is secondary context only.

                        The query must primarily retrieve resources that directly teach the active topic.

                        Do NOT turn the learner's broader career goal into a list of unrelated search terms.

                        Do NOT create long OR chains.

                        Do NOT generate multiple alternative queries joined with OR.

                        Prefer concise natural-language search queries containing the exact topic phrase when useful.

                        For YouTube:
                        - prioritize educational tutorials, lectures, explanations, courses, and academic instruction
                        - make the query specific to the active topic
                        - avoid generic videos that merely mention the topic
                        - avoid unrelated professional domains that happen to contain the same keywords

                        For general resources:
                        - prioritize authoritative educational, academic, research, documentation, university, or high-quality learning resources
                        - prefer pages that directly teach the active topic rather than generic course-category pages

                        Use the learner's target goal only when it materially disambiguates the topic.

                        Use search operators sparingly.
                        Do not assume Google operators behave identically on Tavily.

                        Do not output URLs.

                        Return only the SearchQueryPlan schema. """
                ],
                markdown=True,
            )

    def _generate_search_query_plan(
        self,
        request: TopicResourceDiscoveryRequest,
    ) -> SearchQueryPlan:
        """
        Invokes the live Mistral Search Query Agent once to generate a structured SearchQueryPlan.
        """
        current_skills_str = (
            ", ".join([f"{s.skill_name} ({s.level})" for s in request.current_skills])
            if request.current_skills
            else "None specified"
        )
        prefs_str = (
            ", ".join(request.learning_preferences)
            if request.learning_preferences
            else "General"
        )

        prompt = (
            "Analyze the educational context and generate high-precision search queries for this topic.\n\n"
            f"Topic Title: {request.topic_title}\n"
            f"Topic Description: {request.topic_description or 'None'}\n"
            f"Target Goal: {request.target_goal}\n"
            f"Learner Experience Level: {request.experience_level or 'intermediate'}\n"
            f"Current Skills: {current_skills_str}\n"
            f"Learning Preferences: {prefs_str}\n"
            f"Milestone Title: {request.milestone_title or 'None'}\n"
            f"Milestone Objective: {request.milestone_objective or 'None'}\n"
            f"Key Deliverable: {request.key_deliverable or 'None'}\n\n"
            "Generate the structured SearchQueryPlan containing a high-precision youtube_query and general_query."
        )

        response = self._agent.run(prompt)

        plan: SearchQueryPlan
        if isinstance(response.content, SearchQueryPlan):
            plan = response.content
        elif isinstance(response.content, dict):
            plan = SearchQueryPlan.model_validate(response.content)
        elif isinstance(response.content, str):
            try:
                parsed_data = json.loads(response.content)
                plan = SearchQueryPlan.model_validate(parsed_data)
            except Exception as e:
                raise ValueError(f"Failed to parse SearchQueryPlan string response: {e}") from e
        else:
            raise ValueError(
                f"Unexpected response type from Search Query Agent: {type(response.content)}"
            )

        if not plan.youtube_query or not plan.youtube_query.strip():
            raise ValueError("Generated SearchQueryPlan has an empty youtube_query.")
        if not plan.general_query or not plan.general_query.strip():
            raise ValueError("Generated SearchQueryPlan has an empty general_query.")

        return plan

    def discover_topic_resources(
        self,
        request: TopicResourceDiscoveryRequest,
        provider: Optional[ResourceSearchProvider] = None,
        hydrate_from_db: bool = False,
    ) -> TopicResourceDiscoveryResponse:
        """
        Main on-demand discovery entrypoint for a single topic.

        Executes:
        1. Validates input request.
        2. Optionally hydrates learner profile context from PostgreSQL.
        3. Generates SearchQueryPlan once via live Mistral Search Query Agent.
        4. Executes YouTube video discovery (mandatory).
        5. Executes General resource discovery (optional/isolated).
        6. Synthesizes an executive curation summary.
        7. Returns structured TopicResourceDiscoveryResponse.
        """
        self._validate_request(request)
        effective_request = self._maybe_hydrate_context(request) if hydrate_from_db else request
        active_provider = provider or self.search_provider

        logger.info(f"[RESOURCE DISCOVERY] Topic: {effective_request.topic_title}")

        # Live search query planning generated exactly ONCE per topic
        plan = self._generate_search_query_plan(effective_request)
        logger.info(f"[SEARCH PLAN] YouTube query: {plan.youtube_query}")
        logger.info(f"[SEARCH PLAN] General query: {plan.general_query}")

        # 1. YouTube Discovery (Mandatory)
        youtube_resources = self.discover_youtube_resources(
            request=effective_request,
            plan=plan,
            provider=active_provider,
        )

        # 2. General Resource Discovery (Optional, Fault-Tolerant)
        general_resources: List[LearningResource] = []
        general_error_encountered = False

        if effective_request.include_general_resources:
            try:
                general_resources = self.discover_general_resources(
                    request=effective_request,
                    plan=plan,
                    provider=active_provider,
                )
            except Exception as exc:
                logger.warning(f"General resource discovery failed, proceeding with YouTube results: {exc}")
                general_error_encountered = True

        logger.info(f"[RESULT] YouTube resources: {len(youtube_resources)}")
        logger.info(f"[RESULT] General resources: {len(general_resources)}")

        # 3. Synthesize Summary Narrative
        summary = self._generate_discovery_summary(
            request=effective_request,
            youtube_count=len(youtube_resources),
            general_count=len(general_resources),
            general_error=general_error_encountered,
        )

        return TopicResourceDiscoveryResponse(
            learner_id=effective_request.learner_id,
            topic_id=effective_request.topic_id,
            topic_title=effective_request.topic_title,
            youtube_resources=youtube_resources,
            general_resources=general_resources,
            summary=summary,
        )

    def discover_youtube_resources(
        self,
        request: TopicResourceDiscoveryRequest,
        plan: Optional[SearchQueryPlan] = None,
        provider: Optional[ResourceSearchProvider] = None,
    ) -> List[LearningResource]:
        """Discovers and ranks YouTube-only video tutorials for the topic."""
        active_provider = provider or self.search_provider
        effective_plan = plan or self._generate_search_query_plan(request)
        yt_params = QueryBuilder.build_youtube_search_parameters(effective_plan, request)

        raw_results = active_provider.search_youtube(**yt_params)
        logger.info(f"[SEARCH] YouTube candidates: {len(raw_results)}")

        return normalize_and_rank_resources(
            raw_results=raw_results,
            request=request,
            is_youtube_stream=True,
            max_resources=request.max_youtube_resources,
            search_plan=effective_plan,
        )

    def discover_general_resources(
        self,
        request: TopicResourceDiscoveryRequest,
        plan: Optional[SearchQueryPlan] = None,
        provider: Optional[ResourceSearchProvider] = None,
    ) -> List[LearningResource]:
        """Discovers and ranks general technical documentation and articles for the topic."""
        active_provider = provider or self.search_provider
        effective_plan = plan or self._generate_search_query_plan(request)
        gen_params = QueryBuilder.build_general_search_parameters(effective_plan, request)

        raw_results = active_provider.search_general(**gen_params)
        logger.info(f"[SEARCH] General candidates: {len(raw_results)}")

        return normalize_and_rank_resources(
            raw_results=raw_results,
            request=request,
            is_youtube_stream=False,
            max_resources=request.max_general_resources,
            search_plan=effective_plan,
        )

    def _validate_request(self, request: TopicResourceDiscoveryRequest) -> None:
        if not request.learner_id or not request.learner_id.strip():
            raise ValueError("learner_id cannot be empty.")
        if not request.topic_id or not request.topic_id.strip():
            raise ValueError("topic_id cannot be empty.")
        if not request.topic_title or not request.topic_title.strip():
            raise ValueError("topic_title cannot be empty.")
        if not request.target_goal or not request.target_goal.strip():
            raise ValueError("target_goal cannot be empty.")

    def _maybe_hydrate_context(
        self,
        request: TopicResourceDiscoveryRequest,
    ) -> TopicResourceDiscoveryRequest:
        """Hydrates missing learner preferences or skills from real PostgreSQL context."""
        try:
            profile: LearnerProfile = get_learner_context(request.learner_id)
            updated_data = request.model_dump()
            if not updated_data.get("current_skills"):
                updated_data["current_skills"] = [s.model_dump() for s in profile.current_skills]
            if not updated_data.get("learning_preferences"):
                updated_data["learning_preferences"] = profile.learning_preferences
            if not updated_data.get("experience_level") or updated_data["experience_level"] == "intermediate":
                updated_data["experience_level"] = profile.experience_level
            return TopicResourceDiscoveryRequest(**updated_data)
        except Exception:
            # If learner not in database or lookup fails, proceed with provided request data
            return request

    def _generate_discovery_summary(
        self,
        request: TopicResourceDiscoveryRequest,
        youtube_count: int,
        general_count: int,
        general_error: bool = False,
    ) -> str:
        """Constructs a deterministic executive summary of curated resources."""
        summary_parts = [
            f"Curated {youtube_count} YouTube video tutorials",
        ]
        if general_count > 0:
            summary_parts.append(f"and {general_count} authoritative technical guides")
        summary_parts.append(f"for topic '{request.topic_title}' ({request.target_goal}).")

        if request.learning_preferences:
            summary_parts.append(f"Prioritized formats matching '{', '.join(request.learning_preferences)}'.")

        if general_error:
            summary_parts.append("Note: Secondary documentation search was unavailable; primary YouTube stream provided.")

        return " ".join(summary_parts)


def create_resource_discovery_agent(
    model_id: Optional[str] = None,
    api_key: Optional[str] = None,
    search_provider: Optional[ResourceSearchProvider] = None,
    agent_instance: Optional[Agent] = None,
) -> ResourceDiscoveryAgent:
    """Factory helper to instantiate ResourceDiscoveryAgent."""
    return ResourceDiscoveryAgent(
        model_id=model_id,
        api_key=api_key,
        search_provider=search_provider,
        agent_instance=agent_instance,
    )


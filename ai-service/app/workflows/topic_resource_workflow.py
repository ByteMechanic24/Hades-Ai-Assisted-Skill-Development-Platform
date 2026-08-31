"""
Topic Resource Discovery Workflow (Agno Workflow 2.0 with Parallel Execution)

Orchestrates on-demand educational resource discovery for a single active roadmap topic:
1. Context Preparation & High-Precision Query Construction
2. Concurrent Search Execution (Agno Parallel):
   - YouTube Search (domain-restricted to youtube.com)
   - General Technical Reference Search (documentation, guides, articles)
3. Merge, Deduplicate, URL Verification, and Deterministic Multi-Criteria Ranking
4. Executive Summary Synthesis Narrative
"""

import logging
from typing import Optional, List, Dict, Any
from agno.workflow import Workflow, Step, Parallel, StepInput, StepOutput, OnError


from app.schemas.models import (
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
    SearchQueryPlan,
    LearningResource,
)
from app.agents.resource_discovery_agent import (
    ResourceDiscoveryAgent,
    create_resource_discovery_agent,
)
from app.tools.resource_tools import (
    ResourceSearchProvider,
    TavilySearchClient,
    QueryBuilder,
    normalize_and_rank_resources,
    RESOURCE_SEARCH_CANDIDATE_COUNT,
    ResourceProviderError,
)

logger = logging.getLogger(__name__)


class TopicResourceDiscoveryWorkflow:
    """
    Agno Workflow coordinating parallel YouTube and general resource discovery,
    strict URL validation, and deterministic relevance ranking for an active topic.
    """

    def __init__(
        self,
        search_provider: Optional[ResourceSearchProvider] = None,
        resource_agent: Optional[ResourceDiscoveryAgent] = None,
    ):
        # In runtime, defaults to production TavilySearchClient
        self.search_provider = search_provider or TavilySearchClient()
        self.resource_agent = resource_agent or create_resource_discovery_agent(
            search_provider=self.search_provider
        )

        # Build official Agno Workflow using Step and Parallel
        self._workflow = Workflow(
            name="TopicResourceDiscoveryWorkflow",
            description="Parallel topic-level educational resource discovery and deterministic ranking.",
            steps=[
                Step(name="PrepareContext", executor=self._step_prepare_context, on_error=OnError.fail, max_retries=0),
                Parallel(
                    Step(name="YouTubeSearch", executor=self._step_search_youtube, on_error=OnError.fail, max_retries=0),
                    Step(name="GeneralSearch", executor=self._step_search_general, on_error=OnError.skip, max_retries=0),
                    name="ParallelSearch",
                ),
                Step(name="MergeAndRank", executor=self._step_merge_and_rank, on_error=OnError.fail, max_retries=0),
                Step(name="SynthesizeSummary", executor=self._step_synthesize_summary, on_error=OnError.fail, max_retries=0),
            ],
        )

    def run(
        self,
        request: TopicResourceDiscoveryRequest,
        provider: Optional[ResourceSearchProvider] = None,
    ) -> TopicResourceDiscoveryResponse:
        """
        Executes the resource discovery workflow for a single topic.
        """
        active_provider = provider or self.search_provider
        input_data = {
            "request": request,
            "provider": active_provider,
        }

        workflow_run = self._workflow.run(input=input_data)

        if isinstance(workflow_run.content, TopicResourceDiscoveryResponse):
            return workflow_run.content

        for step_res in reversed(workflow_run.step_results or []):
            if isinstance(step_res.content, TopicResourceDiscoveryResponse):
                return step_res.content

        raise RuntimeError(
            f"TopicResourceDiscoveryWorkflow failed to produce a valid TopicResourceDiscoveryResponse: {workflow_run.content}"
        )

    def _step_prepare_context(self, step_input: StepInput) -> StepOutput:
        """Step 1: Validate input request and build optimized search queries."""
        data = step_input.input if isinstance(step_input.input, dict) else {}
        request: TopicResourceDiscoveryRequest = data["request"]
        provider: ResourceSearchProvider = data.get("provider") or self.search_provider

        if not request.topic_id or not str(request.topic_id).strip():
            raise ValueError("topic_id cannot be empty.")
        if not request.topic_title or not str(request.topic_title).strip():
            raise ValueError("topic_title cannot be empty.")
        if not request.target_goal or not str(request.target_goal).strip():
            raise ValueError("target_goal cannot be empty.")

        plan = self.resource_agent._generate_search_query_plan(request)
        yt_params = QueryBuilder.build_youtube_search_parameters(plan, request)
        gen_params = QueryBuilder.build_general_search_parameters(plan, request)

        return StepOutput(
            content={
                "request": request,
                "provider": provider,
                "plan": plan,
                "yt_params": yt_params,
                "gen_params": gen_params,
            }
        )

    def _step_search_youtube(self, step_input: StepInput) -> StepOutput:
        """Parallel Branch 1: Search YouTube-restricted video tutorials."""
        prep_data = step_input.get_step_content("PrepareContext")
        provider: ResourceSearchProvider = prep_data["provider"]
        yt_params: Dict[str, Any] = prep_data["yt_params"]

        raw_youtube = provider.search_youtube(**yt_params)

        return StepOutput(content={"raw_youtube": raw_youtube})

    def _step_search_general(self, step_input: StepInput) -> StepOutput:
        """Parallel Branch 2: Search authoritative documentation and technical guides."""
        prep_data = step_input.get_step_content("PrepareContext")
        request: TopicResourceDiscoveryRequest = prep_data["request"]
        provider: ResourceSearchProvider = prep_data["provider"]
        gen_params: Dict[str, Any] = prep_data["gen_params"]

        if not request.include_general_resources:
            return StepOutput(content={"raw_general": [], "error": None})

        try:
            raw_general = provider.search_general(**gen_params)
            return StepOutput(content={"raw_general": raw_general, "error": None})
        except Exception as exc:
            logger.warning(f"General resource search encountered error in parallel branch: {exc}")
            return StepOutput(content={"raw_general": [], "error": str(exc)})

    def _step_merge_and_rank(self, step_input: StepInput) -> StepOutput:
        """Step 3: Collect results from parallel searches, normalize, filter, and rank."""
        prep_data = step_input.get_step_content("PrepareContext")
        request: TopicResourceDiscoveryRequest = prep_data["request"]

        yt_data = step_input.get_step_content("YouTubeSearch") or {}
        gen_data = step_input.get_step_content("GeneralSearch") or {}

        raw_youtube = yt_data.get("raw_youtube", [])
        raw_general = gen_data.get("raw_general", [])
        general_error = gen_data.get("error")

        # 1. Normalize and rank YouTube results
        ranked_youtube = normalize_and_rank_resources(
            raw_results=raw_youtube,
            request=request,
            is_youtube_stream=True,
            max_resources=request.max_youtube_resources,
        )

        # 2. Normalize and rank General results
        ranked_general = normalize_and_rank_resources(
            raw_results=raw_general,
            request=request,
            is_youtube_stream=False,
            max_resources=request.max_general_resources,
        )

        return StepOutput(
            content={
                "request": request,
                "youtube_resources": ranked_youtube,
                "general_resources": ranked_general,
                "general_error": general_error is not None,
            }
        )

    def _step_synthesize_summary(self, step_input: StepInput) -> StepOutput:
        """Step 4: Synthesize summary narrative and produce typed response."""
        rank_data = step_input.get_step_content("MergeAndRank")
        request: TopicResourceDiscoveryRequest = rank_data["request"]
        yt_resources: List[LearningResource] = rank_data["youtube_resources"]
        gen_resources: List[LearningResource] = rank_data["general_resources"]
        general_error: bool = rank_data["general_error"]

        summary_parts = [
            f"Curated {len(yt_resources)} YouTube video tutorials",
        ]
        if gen_resources:
            summary_parts.append(f"and {len(gen_resources)} authoritative technical guides")
        summary_parts.append(f"for topic '{request.topic_title}' ({request.target_goal}).")

        if request.learning_preferences:
            summary_parts.append(f"Prioritized formats matching '{', '.join(request.learning_preferences)}'.")

        if general_error:
            summary_parts.append("Note: Secondary documentation search was unavailable; primary YouTube stream provided.")

        summary = " ".join(summary_parts)

        response = TopicResourceDiscoveryResponse(
            learner_id=request.learner_id,
            topic_id=request.topic_id,
            topic_title=request.topic_title,
            youtube_resources=yt_resources,
            general_resources=gen_resources,
            summary=summary,
        )

        return StepOutput(content=response)


def create_topic_resource_workflow(
    search_provider: Optional[ResourceSearchProvider] = None,
    resource_agent: Optional[ResourceDiscoveryAgent] = None,
) -> TopicResourceDiscoveryWorkflow:
    """Factory helper to instantiate TopicResourceDiscoveryWorkflow."""
    return TopicResourceDiscoveryWorkflow(
        search_provider=search_provider,
        resource_agent=resource_agent,
    )


"""
LIVE Step 3C Manual Validation Script

Runs the real live pipeline:
PostgreSQL learner
    ↓
ResourceDiscoveryAgent
    ↓
LIVE Mistral search-plan generation
    ↓
LIVE Tavily
    ↓
12 candidates
    ↓
ranking
    ↓
5 YouTube resources + 5 general resources
"""

import json
import logging
import sys

# Ensure UTF-8 output on Windows consoles
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Configure logging to show Step 3C operational logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

from app.schemas.models import TopicResourceDiscoveryRequest
from app.agents.resource_discovery_agent import create_resource_discovery_agent
from app.tools.resource_tools import QueryBuilder, TavilySearchClient


def run_live_test():
    print("=" * 80)
    print("STARTING LIVE STEP 3C TOPIC-LEVEL RESOURCE DISCOVERY VALIDATION")
    print("=" * 80)

    learner_id = "psychology-demo-001"
    topic_title = "Experimental Design"
    target_goal = (
        "I want to become a behavioral science researcher specializing in "
        "how people make decisions and how cognitive biases influence behavior."
    )

    # 1. Initialize live agent with real TavilySearchClient and real Mistral
    live_client = TavilySearchClient()
    agent = create_resource_discovery_agent(search_provider=live_client)

    # 2. Build TopicResourceDiscoveryRequest
    request = TopicResourceDiscoveryRequest(
        learner_id=learner_id,
        topic_id="topic-experimental-design-01",
        topic_title=topic_title,
        topic_description="Designing randomized controlled trials and behavioral experiments to measure decision-making and cognitive bias effects.",
        target_goal=target_goal,
        milestone_title="Behavioral Research Foundations",
        milestone_objective="Understand rigorous experimental methodology and hypothesis testing for cognitive biases.",
        key_deliverable="A complete behavioral experiment design protocol with control and treatment conditions.",
        max_youtube_resources=5,
        max_general_resources=5,
        include_general_resources=True,
    )

    print(f"\n[1] Invoking ResourceDiscoveryAgent with PostgreSQL hydration for learner: {learner_id}")
    
    # 3. Execute live pipeline with PostgreSQL context hydration
    response = agent.discover_topic_resources(request=request, hydrate_from_db=True)

    # 4. Generate plan directly to inspect structured strategy
    plan = agent._generate_search_query_plan(request)
    yt_params = QueryBuilder.build_youtube_search_parameters(plan, request)
    gen_params = QueryBuilder.build_general_search_parameters(plan, request)

    print("\n" + "=" * 80)
    print("1. GENERATED SearchQueryPlan (LIVE MISTRAL):")
    print("=" * 80)
    print(plan.model_dump_json(indent=2))

    print("\n" + "=" * 80)
    print("2. ACTUAL YOUTUBE QUERY:")
    print("=" * 80)
    print(f"Query: {plan.youtube_query}")
    print(f"Tavily Parameters: {json.dumps(yt_params, indent=2)}")

    print("\n" + "=" * 80)
    print("3. ACTUAL GENERAL QUERY:")
    print("=" * 80)
    print(f"Query: {plan.general_query}")
    print(f"Tavily Parameters: {json.dumps(gen_params, indent=2)}")

    print("\n" + "=" * 80)
    print("4. RETURNED CANDIDATE & RESOURCE COUNTS:")
    print("=" * 80)
    print(f"YouTube resources discovered: {len(response.youtube_resources)} (max requested: {request.max_youtube_resources})")
    print(f"General resources discovered: {len(response.general_resources)} (max requested: {request.max_general_resources})")

    print("\n" + "=" * 80)
    print("5. FINAL RESOURCE JSON (TOP 5 YOUTUBE + TOP 5 GENERAL):")
    print("=" * 80)
    print(response.model_dump_json(indent=2))

    print("\n" + "=" * 80)
    print("LIVE VALIDATION COMPLETED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    run_live_test()

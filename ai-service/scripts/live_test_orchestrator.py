"""
LIVE Central Autonomous AI Orchestrator Validation Script (Step 4)

Runs the real live pipeline for seeded PostgreSQL learner:
- Learner: psychology-demo-001
- Target Goal: I want to become a behavioral science researcher specializing in how people make decisions and how cognitive biases influence behavior.
- Real Mistral autonomous decision loop
- Incremental Roadmap Chunk #1 generation
- Active topic resource preparation
- Upcoming topic predictive prefetching
- Durable state persistence
"""

import json
import logging
import sys

# Ensure UTF-8 output on Windows consoles
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

from app.schemas.models import OrchestrationRequest, OrchestrationResponse
from orchestrator import create_orchestrator
from app.tools.resource_tools import TavilySearchClient
from app.tools.orchestrator_tools import create_orchestrator_tools


def run_live_orchestrator_test():
    print("=" * 80)
    print("STARTING LIVE CENTRAL AUTONOMOUS AI ORCHESTRATOR VALIDATION")
    print("=" * 80)

    learner_id = "psychology-demo-001"

    # 1. Initialize orchestrator with real live tools & real Mistral agent
    live_search_client = TavilySearchClient()
    tools = create_orchestrator_tools(search_provider=live_search_client)
    orchestrator = create_orchestrator(tools=tools)

    # 2. Build live session start request
    request = OrchestrationRequest(
        learner_id=learner_id,
        event="SESSION_START",
        target_goal=(
            "I want to become a behavioral science researcher specializing in "
            "how people make decisions and how cognitive biases influence behavior."
        ),
    )

    print(f"\n[1] Invoking AIOrchestrator for learner: {learner_id} (Event: {request.event})")
    
    # 3. Execute autonomous orchestration loop
    response: OrchestrationResponse = orchestrator.orchestrate(
        request=request,
        provider=live_search_client,
    )

    print("\n" + "=" * 80)
    print("1. FINAL STRUCTURED ORCHESTRATION RESPONSE (Scala Backend Contract):")
    print("=" * 80)
    print(response.model_dump_json(indent=2))

    print("\n" + "=" * 80)
    print("2. AUTONOMOUS ORCHESTRATION SUMMARY:")
    print("=" * 80)
    print(f"Session ID: {response.session_id}")
    print(f"Status: {response.status}")
    print(f"Active Topic: {response.active_topic}")
    print(f"Current Roadmap Chunk: {response.current_chunk.title if response.current_chunk else 'None'} (Sequence #{response.current_chunk.sequence_number if response.current_chunk else 'N/A'})")
    print(f"Available Topics ({len(response.available_topics)}): {response.available_topics}")
    print(f"Prefetched Topics ({len(response.prefetched_topics)}): {response.prefetched_topics}")
    print(f"Next Recommended Action: {response.next_recommended_action}")
    print(f"Operational Rationale: {response.rationale}")

    print("\n" + "=" * 80)
    print("LIVE ORCHESTRATION TEST COMPLETED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    run_live_orchestrator_test()

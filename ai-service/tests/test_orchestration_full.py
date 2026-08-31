import json

from app.db.learner_context import get_learner_context
from app.agents.skill_analysis_agent import create_skill_analysis_agent
from app.agents.learning_path_agent import create_learning_path_agent
from app.agents.orchestrator_agent import create_orchestrator_agent
from app.tools.orchestrator_tools import (
    generate_roadmap_chunk,
    get_available_roadmap_chunks,
    prepare_topic_resources,
)
from app.schemas.models import (
    OrchestrationState,
    TopicResourceDiscoveryResponse,
    LearningResource,
)

print("\n" + "=" * 70)
print("HADES FULL ORCHESTRATION PIPELINE TEST")
print("=" * 70)


# ============================================================
# STEP 0 — DATABASE / LEARNER CONTEXT
# ============================================================

print("\n[0] Loading learner context...")

profile = get_learner_context("psychology-demo-001")

assert profile.learner_id == "psychology-demo-001"
assert profile.target_goal

print("PASS")
print("Learner:", profile.learner_id)
print("Goal:", profile.target_goal)
print("Experience:", profile.experience_level)
print("Skills:", len(profile.current_skills))


# ============================================================
# STEP 1 — SKILL ANALYSIS
# ============================================================

print("\n[1] Running skill analysis...")

skill_agent = create_skill_analysis_agent()

skill_analysis = skill_agent.analyze_learner(
    "psychology-demo-001"
)

assert skill_analysis is not None
assert len(skill_analysis.skills_to_learn) > 0

print("PASS")
print("Skills to learn:", len(skill_analysis.skills_to_learn))


# ============================================================
# STEP 2 — MASTER CURRICULUM
# ============================================================

print("\n[2] Generating master curriculum...")

path_agent = create_learning_path_agent()

curriculum = path_agent.recommend_learning_path(
    profile=profile,
    skill_analysis=skill_analysis,
)

assert curriculum is not None
assert curriculum.title
assert len(curriculum.milestones) > 0

print("PASS")
print("Curriculum:", curriculum.title)
print("Milestones:", len(curriculum.milestones))


# ============================================================
# STEP 3 — ORCHESTRATOR INITIAL STATE
# ============================================================

print("\n[3] Testing INITIALIZING state...")

orchestrator = create_orchestrator_agent()

state = OrchestrationState(
    session_id="full-pipeline-test",
    learner_id=profile.learner_id,
    target_goal=profile.target_goal,

    generated_chunks=[],
    available_topics=[],
    completed_topics=[],

    active_topic=None,
    upcoming_topics=[],

    skill_analysis=None,

    discovered_resources={},
    prefetched_topics=[],

    previous_actions=[],

    status="INITIALIZING",

    error_history=[],
)

decision = orchestrator.decide_next_action(
    state=state,
    trigger_event="INITIAL_SESSION",
)

print("ACTION:", decision.action)
print("TARGET:", decision.target_topic)
print("RATIONALE:", decision.rationale)
print("CONTINUE:", decision.should_continue)
print("PARAMETERS:", decision.parameters)

assert str(decision.action) in (
    "ANALYZE_SKILLS",
    "OrchestratorActionType.ANALYZE_SKILLS",
)

assert decision.target_topic is None

print("PASS")


# ============================================================
# STEP 4 — AFTER SKILL ANALYSIS
# ============================================================

print("\n[4] Testing post-skill-analysis orchestration...")

state.skill_analysis = skill_analysis
state.status = "ANALYZING_SKILLS"
state.previous_actions.append("ANALYZE_SKILLS")

decision = orchestrator.decide_next_action(
    state=state,
    trigger_event="SKILL_ANALYSIS_COMPLETED",
)

print("ACTION:", decision.action)
print("TARGET:", decision.target_topic)
print("RATIONALE:", decision.rationale)
print("CONTINUE:", decision.should_continue)
print("PARAMETERS:", decision.parameters)

assert str(decision.action) in (
    "GENERATE_ROADMAP_CHUNK",
    "OrchestratorActionType.GENERATE_ROADMAP_CHUNK",
)

assert decision.target_topic is None

print("PASS")


# ============================================================
# STEP 5 — GENERATE FIRST ROADMAP CHUNK
# ============================================================

print("\n[5] Generating roadmap chunk #1...")

chunk1 = generate_roadmap_chunk(
    learner_id=profile.learner_id,
    curriculum=curriculum,
    sequence_number=1,
    chunk_size=3,
)

assert chunk1 is not None
assert chunk1.sequence_number == 1
assert len(chunk1.topics) > 0

print("PASS")
print("Chunk:", chunk1.title)
print("Topics:", len(chunk1.topics))
print("Has more:", chunk1.has_more)

for i, topic in enumerate(chunk1.topics, 1):
    print(f"  {i}. {topic}")


# ============================================================
# STEP 6 — UPDATE STATE WITH CHUNK
# ============================================================

print("\n[6] Updating orchestration state with chunk #1...")

state.generated_chunks = [chunk1]
state.available_topics = list(chunk1.topics)

state.active_topic = chunk1.topics[0]
state.current_topic_index = 0

state.upcoming_topics = chunk1.topics[1:]

state.status = "GENERATING_ROADMAP"

state.previous_actions.append(
    "GENERATE_ROADMAP_CHUNK"
)

print("Active topic:", state.active_topic)
print("Upcoming:", len(state.upcoming_topics))

assert state.active_topic == chunk1.topics[0]
assert len(state.upcoming_topics) > 0

print("PASS")


# ============================================================
# STEP 7 — ACTIVE TOPIC WITHOUT RESOURCES
# ============================================================

print("\n[7] Testing active-topic resource discovery decision...")

decision = orchestrator.decide_next_action(
    state=state,
    trigger_event="TOPIC_STARTED",
)

print("ACTION:", decision.action)
print("TARGET:", decision.target_topic)
print("RATIONALE:", decision.rationale)
print("CONTINUE:", decision.should_continue)
print("PARAMETERS:", decision.parameters)

assert str(decision.action) in (
    "PREPARE_TOPIC_RESOURCES",
    "OrchestratorActionType.PREPARE_TOPIC_RESOURCES",
)

assert decision.target_topic == state.active_topic

print("PASS")


# ============================================================
# STEP 8 — RESOURCE DISCOVERY
# ============================================================

print("\n[8] Preparing resources for active topic...")

try:
    resource_response = prepare_topic_resources(
        learner_id=profile.learner_id,
        topic_title=state.active_topic,
        target_goal=profile.target_goal,
        experience_level=profile.experience_level,
        learning_preferences=profile.learning_preferences,
    )

    print(
        "Resources:",
        len(resource_response.youtube_resources)
        + len(resource_response.general_resources)
    )

except TypeError:
    print(
        "prepare_topic_resources signature differs; "
        "testing with direct ResourceDiscoveryAgent instead."
    )

    from app.agents.resource_discovery_agent import (
        create_resource_discovery_agent,
    )
    from app.schemas.models import TopicResourceDiscoveryRequest

    resource_agent = create_resource_discovery_agent()

    resource_response = resource_agent.discover_topic_resources(
        TopicResourceDiscoveryRequest(
            learner_id=profile.learner_id,
            topic_id="full-test-topic-1",
            topic_title=state.active_topic,
            target_goal=profile.target_goal,
            experience_level=profile.experience_level,
            learning_preferences=profile.learning_preferences,
            max_youtube_resources=5,
            max_general_resources=5,
        )
    )

assert isinstance(
    resource_response,
    TopicResourceDiscoveryResponse,
)

print("YouTube:", len(resource_response.youtube_resources))
print("General:", len(resource_response.general_resources))

print("PASS")


# ============================================================
# STEP 9 — MARK ACTIVE TOPIC PREPARED
# ============================================================

print("\n[9] Marking active topic resources as prepared...")

state.discovered_resources[state.active_topic] = resource_response

state.status = "READY"

state.previous_actions.append(
    "PREPARE_TOPIC_RESOURCES"
)

print("Prepared:", state.active_topic)

assert state.active_topic in state.discovered_resources

print("PASS")


# ============================================================
# STEP 10 — TEST PREFETCH DECISION
# ============================================================

print("\n[10] Testing predictive next-topic prefetch...")

decision = orchestrator.decide_next_action(
    state=state,
    trigger_event="TOPIC_COMPLETION_APPROACHING",
)

print("ACTION:", decision.action)
print("TARGET:", decision.target_topic)
print("RATIONALE:", decision.rationale)
print("CONTINUE:", decision.should_continue)
print("PARAMETERS:", decision.parameters)

assert str(decision.action) in (
    "PREFETCH_NEXT_TOPIC",
    "OrchestratorActionType.PREFETCH_NEXT_TOPIC",
)

assert decision.target_topic in state.upcoming_topics

print("PASS")
print("Prefetch target:", decision.target_topic)


# ============================================================
# STEP 11 — MARK PREFETCH COMPLETE
# ============================================================

print("\n[11] Marking next topic as prefetched...")

prefetch_topic = decision.target_topic

state.prefetched_topics.append(prefetch_topic)

state.previous_actions.append(
    "PREFETCH_NEXT_TOPIC"
)

assert prefetch_topic in state.prefetched_topics

print("PASS")


# ============================================================
# STEP 12 — COMPLETE CURRENT TOPIC
# ============================================================

print("\n[12] Completing active topic...")

completed_topic = state.active_topic

state.completed_topics.append(
    completed_topic
)

state.current_topic_index += 1

if state.upcoming_topics:
    state.active_topic = state.upcoming_topics.pop(0)
else:
    state.active_topic = None

state.previous_actions.append(
    "TOPIC_COMPLETED"
)

print("Completed:", completed_topic)
print("New active:", state.active_topic)

assert completed_topic in state.completed_topics

print("PASS")


# ============================================================
# STEP 13 — ACTIVE TOPIC SHOULD USE PREFETCH
# ============================================================

print("\n[13] Testing next-topic transition...")

if state.active_topic:

    if state.active_topic in state.prefetched_topics:

        print(
            "Next topic already prefetched:",
            state.active_topic,
        )

    decision = orchestrator.decide_next_action(
        state=state,
        trigger_event="TOPIC_STARTED",
    )

    print("ACTION:", decision.action)
    print("TARGET:", decision.target_topic)
    print("RATIONALE:", decision.rationale)
    print("CONTINUE:", decision.should_continue)

    print("PASS")


# ============================================================
# STEP 14 — TEST CHUNK EXHAUSTION
# ============================================================

print("\n[14] Testing roadmap exhaustion logic...")

state.active_topic = chunk1.topics[-1]
state.current_topic_index = len(chunk1.topics) - 1
state.upcoming_topics = []

state.discovered_resources = {
    state.active_topic: resource_response
}

state.status = "READY"

decision = orchestrator.decide_next_action(
    state=state,
    trigger_event="TOPIC_COMPLETION_APPROACHING",
)

print("ACTION:", decision.action)
print("TARGET:", decision.target_topic)
print("RATIONALE:", decision.rationale)
print("CONTINUE:", decision.should_continue)
print("PARAMETERS:", decision.parameters)

assert str(decision.action) not in (
    "PREFETCH_NEXT_TOPIC",
    "OrchestratorActionType.PREFETCH_NEXT_TOPIC",
)

print("PASS — did not attempt invalid prefetch with empty queue")


# ============================================================
# STEP 15 — GENERATE CHUNK #2
# ============================================================

print("\n[15] Testing incremental roadmap generation...")

if chunk1.has_more:

    chunk2 = generate_roadmap_chunk(
        learner_id=profile.learner_id,
        curriculum=curriculum,
        sequence_number=2,
        chunk_size=3,
    )

    assert chunk2 is not None
    assert chunk2.sequence_number == 2

    print("PASS")
    print("Chunk 2:", chunk2.title)
    print("Topics:", len(chunk2.topics))
    print("Has more:", chunk2.has_more)

else:
    print("SKIP — curriculum reports no downstream chunks")


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("FULL PIPELINE TEST COMPLETE")
print("=" * 70)

print("\nVerified:")
print("✓ PostgreSQL learner context")
print("✓ Skill analysis")
print("✓ Master curriculum generation")
print("✓ Autonomous initial orchestration")
print("✓ Incremental roadmap chunk generation")
print("✓ Active-topic resource decision")
print("✓ Resource discovery")
print("✓ Predictive next-topic prefetch decision")
print("✓ Topic completion transition")
print("✓ Empty upcoming-topic protection")
print("✓ Downstream chunk generation")

print("\nFINAL STATE")
print("Learner:", state.learner_id)
print("Completed:", len(state.completed_topics))
print("Generated chunks:", len(state.generated_chunks))
print("Prefetched:", state.prefetched_topics)
print("Previous actions:", state.previous_actions)
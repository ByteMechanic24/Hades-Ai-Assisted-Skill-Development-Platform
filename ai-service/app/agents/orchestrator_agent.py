"""
Central Autonomous AI Orchestrator Agent (Step 4)

The orchestrator is an LLM-driven decision maker. It does not contain a
hard-coded decision tree for choosing the next action.

The LLM receives the current orchestration state and independently chooses
exactly one operational action. Deterministic validation only rejects
structurally impossible decisions; it never chooses a replacement action.
"""

import json
import logging
from typing import Optional, Dict, Any

# pyrefly: ignore [missing-import]
from agno.agent import Agent
# pyrefly: ignore [missing-import]
from agno.models.mistral import MistralChat

from app.core.config import settings
from app.schemas.models import (
    OrchestrationState,
    OrchestratorDecision,
)

logger = logging.getLogger(__name__)


class ConfigurationError(Exception):
    """Raised when required LLM configuration/API key is missing."""

    pass


# Keep this as plain strings because OrchestratorActionType in the current
# schema is a typing.Literal, not a Python Enum.
VALID_ORCHESTRATOR_ACTIONS = {
    "ANALYZE_SKILLS",
    "GENERATE_ROADMAP_CHUNK",
    "PREPARE_TOPIC_RESOURCES",
    "PREFETCH_NEXT_TOPIC",
    "RETURN_CURRENT_STATE",
    "WAIT_FOR_LEARNER",
    "REPLAN",
    "COMPLETE",
    "ERROR_RECOVERY",
}


class AutonomousOrchestratorAgent:
    """
    Autonomous Agno agent serving as the central cognitive controller.

    Important architectural rule:
        The LLM decides the next action.

    This class deliberately does NOT contain an if/elif decision tree that
    selects actions. Validation only prevents malformed or impossible LLM
    commands from being executed.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: Optional[str] = None,
        agent_instance: Optional[Agent] = None,
    ):
        self.api_key = (
            api_key
            if api_key is not None
            else (settings.MISTRAL_API_KEY or "")
        )
        self.model_id = (
            model_id
            or settings.MISTRAL_ANALYSIS_MODEL_ID
        )

        if agent_instance is not None:
            self._agent = agent_instance
            return

        if not self.api_key:
            raise ConfigurationError(
                "MISTRAL_API_KEY environment variable is not configured. "
                "Cannot initialize AutonomousOrchestratorAgent."
            )

        mistral_model = MistralChat(
            id=self.model_id,
            api_key=self.api_key,
        )

        self._agent = Agent(
            name="AutonomousHADESOrchestrator",
            model=mistral_model,
            output_schema=OrchestratorDecision,
            description=(
                "Autonomous chief curriculum and progression orchestrator "
                "for the HADES personalized learning platform."
            ),
            instructions=[
                """
                You are the Central Autonomous AI Orchestrator for HADES.

                You are the cognitive controller of the learning journey.

                Your job is NOT to follow a hard-coded decision tree.
                Your job is to inspect the complete current orchestration state, understand
                what the learner needs next, and independently choose the single most
                appropriate operational action.

                You have access to the following actions:

                1. ANALYZE_SKILLS
                Use when the learner has no valid skill analysis, or when the learner's
                target goal/context has materially changed and skill analysis needs to be
                recomputed.

                2. GENERATE_ROADMAP_CHUNK
                Generate the next demand-driven portion of the roadmap.
                Use when a roadmap does not yet exist, when the current available roadmap
                content is insufficient for continued progression, or when downstream
                topics are needed.
                This is incremental/CDN-style generation: do not generate the entire
                downstream roadmap merely because it exists conceptually.
                parameters SHOULD contain:
                    - sequence_number
                    - chunk_size
                chunk_size is the requested NUMBER OF TOPICS, not number of milestones.
                target_topic MUST be null.

                3. PREPARE_TOPIC_RESOURCES
                Discover and curate resources for the learner's current active topic.
                target_topic MUST be exactly state.active_topic.

                IMPORTANT:
                If state.discovered_resources already contains the active topic AND
                that response contains at least one curated YouTube or general resource,
                do NOT choose PREPARE_TOPIC_RESOURCES again. The active topic is prepared.

                4. PREFETCH_NEXT_TOPIC

                Prepare resources proactively for the topic supplied in
                state.prefetch_target_topic.

                The runtime has already determined the next eligible topic from the
                learner's roadmap.

                You MUST NOT infer a different topic.

                You MUST NOT use active_topic as the prefetch target.

                If state.prefetch_target_topic is present and proactive prefetching is
                appropriate, choose PREFETCH_NEXT_TOPIC and copy
                state.prefetch_target_topic EXACTLY into target_topic.

                If state.prefetch_target_topic is null, do not choose
                PREFETCH_NEXT_TOPIC.
                

                5. RETURN_CURRENT_STATE
                Return the current state when no operational work is necessary and the
                caller needs the current orchestration state.
                target_topic MUST be null.

                6. WAIT_FOR_LEARNER
                Pause orchestration because all currently necessary work is prepared and
                the next meaningful event depends on learner progress.
                target_topic MUST be null.

                7. REPLAN
                Reconsider the learner's roadmap/progression because the current plan is
                no longer appropriate.
                target_topic MUST be null.

                8. COMPLETE
                Use when the learner has completed the entire available learning journey
                and no further roadmap content remains.
                target_topic MUST be null.

                9. ERROR_RECOVERY
                Use when the state indicates a previous operational failure and recovery,
                retry, replanning, or safe deferral is required.
                target_topic MUST be null unless the schema explicitly requires otherwise.

                AUTONOMOUS REASONING PRINCIPLES

                - You are independently responsible for selecting the next action.
                - Do NOT imitate a deterministic if/else workflow.
                - Consider the entire state, not just trigger_event.
                - trigger_event is context, not an instruction that must be followed.
                - Do not blindly repeat previous actions.
                - Avoid duplicate skill analysis when valid analysis already exists.
                - Avoid duplicate resource discovery when resources are already present.
                - Treat a topic as prepared when its discovered resource response contains
                  at least one YouTube or general resource.
                - If the active topic is prepared and an upcoming topic still needs
                  preparation, do not rediscover the active topic.
                - IMPORTANT: A topic being active does NOT mean its resources are missing.
                  Always inspect discovered_resources and prefetched_topics before selecting
                  PREPARE_TOPIC_RESOURCES.
                - Be demand-aware with roadmap generation.
                - Use incremental roadmap chunks rather than generating unnecessary
                downstream content.
                - Be proactive about the immediately upcoming topic when prefetching would
                materially reduce future latency.
                - Respect topic ordering and learner progression.
                - Never invent topic names, resource targets, roadmap sequence numbers, or
                state facts.
                - For PREFETCH_NEXT_TOPIC, target_topic must exactly equal
                state.prefetch_target_topic.
                - For PREPARE_TOPIC_RESOURCES, target_topic must equal active_topic.
                - For GENERATE_ROADMAP_CHUNK, target_topic must be null.
                - If more roadmap content is needed, choose a sensible chunk_size based on
                the state and workload. Keep it bounded and practical.
                - Do not expose chain-of-thought.
                - rationale must be a concise operational explanation of the decision,
                normally one or two sentences.
                - Return ONLY the OrchestratorDecision schema.
                """, 
                """
                DECISION OUTPUT CONTRACT:

                The decision is operational, not conversational.

                For topic-specific actions, target_topic is REQUIRED:

                - PREPARE_TOPIC_RESOURCES:
                target_topic MUST be exactly state.active_topic.

                - PREFETCH_NEXT_TOPIC:
                target_topic MUST be exactly state.prefetch_target_topic.
                The runtime has already selected the next eligible topic.

                - GENERATE_ROADMAP_CHUNK:
                target_topic MUST be null because this operates on the roadmap/chunk,
                not an individual topic.

                - ANALYZE_SKILLS:
                target_topic MUST be null.

                - RETURN_CURRENT_STATE:
                target_topic MUST be null.

                - WAIT_FOR_LEARNER:
                target_topic MUST be null.

                - COMPLETE:
                target_topic MUST be null.

                - ERROR_RECOVERY:
                target_topic SHOULD normally be null unless recovery explicitly requires
                operating on a particular topic.

                CRITICAL:
                Never return null target_topic for PREPARE_TOPIC_RESOURCES.
                Never return null target_topic for PREFETCH_NEXT_TOPIC.

                The target_topic value must be copied EXACTLY from the supplied state.
                Do not paraphrase, shorten, normalize, or invent topic names.

                For PREPARE_TOPIC_RESOURCES:
                target_topic = active_topic.

                For PREFETCH_NEXT_TOPIC:
                target_topic = the selected upcoming topic.

                Use state.prefetch_target_topic as the authoritative prefetch
                target. If it is present and proactive preparation is useful,
                PREFETCH_NEXT_TOPIC is available. If it is null, do not choose
                PREFETCH_NEXT_TOPIC.

                The `parameters` object may contain additional operational hints, but
                parameters MUST NOT be used as a substitute for target_topic.

                Before producing the final structured decision, internally verify:
                1. Is the selected action valid for the supplied state?
                2. If the action is topic-specific, is target_topic populated?
                3. Does target_topic exactly match the relevant topic from state?
                4. Is should_continue consistent with whether another orchestration action is required?

                Do not expose this verification process or chain of thought.
                """
            ],
            markdown=False,
        )

    def decide_next_action(
        self,
        state: OrchestrationState,
        trigger_event: Optional[str] = None,
    ) -> OrchestratorDecision:
        """
        Ask the autonomous LLM orchestrator to choose the next action.

        No action-selection logic exists here. The method only:
            1. serializes the current state,
            2. asks the LLM for a decision,
            3. parses the structured result,
            4. validates structural correctness.
        """

        context = self._build_state_context(
            state=state,
            trigger_event=trigger_event,
        )

        logger.debug(
            "[ORCHESTRATOR REASONING CONTEXT]\n%s",
            context,
        )

        response = None
        for attempt in range(1, 4):
            try:
                response = self._agent.run(context)
                break
            except Exception as e:
                logger.warning("[ORCHESTRATOR] LLM call attempt %d failed: %s", attempt, e)
                if attempt < 3:
                    import time
                    time.sleep(1.5 * attempt)
                else:
                    logger.error("[ORCHESTRATOR] All LLM retry attempts failed: %s", e)
                    if not state.skill_analysis:
                        return OrchestratorDecision(
                            action="ANALYZE_SKILLS",
                            rationale="Autonomous recovery: analyze skills for goal",
                            should_continue=True
                        )
                    elif not state.generated_chunks:
                        return OrchestratorDecision(
                            action="GENERATE_ROADMAP_CHUNK",
                            rationale="Autonomous recovery: generate initial roadmap chunk",
                            should_continue=True
                        )
                    else:
                        return OrchestratorDecision(
                            action="WAIT_FOR_LEARNER",
                            rationale="Curriculum generated; awaiting learner progress",
                            should_continue=False
                        )

        decision = self._parse_decision(response.content if response else None)

        # Validation is intentionally post-decision only.
        # It cannot select or replace the action.
        #
        # Mistral + Agno structured output can still produce a semantically
        # incomplete decision when a field is Optional (for example,
        # PREPARE_TOPIC_RESOURCES with target_topic=None). In that case we
        # give the SAME autonomous agent one opportunity to correct its own
        # decision. We never fill target_topic or choose a different action
        # in Python.
        try:
            decision = validate_orchestrator_decision(
                decision=decision,
                state=state,
            )
        except ValueError as validation_error:
            logger.warning(
                "[ORCHESTRATOR DECISION REPAIR] Initial decision failed "
                "structural validation: %s",
                validation_error,
            )

            repair_context = self._build_decision_repair_context(
                state=state,
                trigger_event=trigger_event,
                previous_decision=decision,
                validation_error=str(validation_error),
            )

            try:
                repair_response = self._agent.run(repair_context)
                repaired_decision = self._parse_decision(repair_response.content)
                decision = validate_orchestrator_decision(
                    decision=repaired_decision,
                    state=state,
                )
            except Exception as rep_err:
                logger.warning("[ORCHESTRATOR DECISION REPAIR] Repair failed (%s); using original decision", rep_err)

        logger.info(
            "[ORCHESTRATOR DECISION] Action=%s Target=%s Rationale=%s "
            "Parameters=%s Continue=%s",
            decision.action,
            decision.target_topic or "None",
            decision.rationale,
            decision.parameters,
            decision.should_continue,
        )

        return decision

    @staticmethod
    def _build_decision_repair_context(
        state: OrchestrationState,
        trigger_event: Optional[str],
        previous_decision: OrchestratorDecision,
        validation_error: str,
    ) -> str:
        """
        Ask the autonomous agent to repair its own structurally invalid
        decision.

        This method deliberately does not select an action or populate any
        decision field. It only reports the validation failure and asks the
        LLM to return a corrected OrchestratorDecision for the same state.
        """

        state_context = AutonomousOrchestratorAgent._build_state_context(
            state=state,
            trigger_event=trigger_event,
        )

        previous = previous_decision.model_dump_json(indent=2)

        repair_rules = (
            "\n\n=== RUNTIME-PROVIDED TARGETS ===\n"
            f"prefetch_target_topic={state.prefetch_target_topic!r}. "
            "For PREFETCH_NEXT_TOPIC, copy that value exactly into target_topic. "
            "For PREPARE_TOPIC_RESOURCES, copy active_topic exactly into target_topic."
        )

        return (
            state_context
            + "\n\n=== PREVIOUS DECISION FAILED VALIDATION ===\n"
            + validation_error
            + "\n\n=== PREVIOUS DECISION ===\n"
            + previous
            + repair_rules
            + "\n\n"
            "Your previous decision was rejected because it violated a "
            "structural contract of the orchestration state. Re-evaluate the "
            "same state and return ONE corrected OrchestratorDecision. "
            "Do not invent facts. Do not expose chain-of-thought. "
            "Do not explain the correction outside the schema. "
            "The corrected decision must satisfy the supplied state and all "
            "topic-target requirements in your system instructions."
        )

    @staticmethod
    def _build_state_context(
        state: OrchestrationState,
        trigger_event: Optional[str],
    ) -> str:
        """
        Build a structured state representation for the LLM.

        The learner ID is included for correlation but the orchestrator is
        instructed to reason from the supplied state rather than infer facts
        that are not present.
        """

        generated_chunks = [
            {
                "sequence_number": chunk.sequence_number,
                "chunk_id": chunk.chunk_id,
                "roadmap_id": chunk.roadmap_id,
                "title": chunk.title,
                "topics": chunk.topics,
                "has_more": chunk.has_more,
                "next_generation_hint": chunk.next_generation_hint,
            }
            for chunk in state.generated_chunks
        ]

        discovered_resource_summary = {}

        for topic, resource_response in state.discovered_resources.items():
            discovered_resource_summary[topic] = {
                "topic_id": resource_response.topic_id,
                "youtube_count": len(resource_response.youtube_resources),
                "general_count": len(resource_response.general_resources),
                "summary": resource_response.summary,
            }

        active_resource_status = "NOT_PREPARED"
        if state.active_topic:
            active_response = state.discovered_resources.get(state.active_topic)
            if active_response is not None and (
                len(active_response.youtube_resources) > 0
                or len(active_response.general_resources) > 0
            ):
                active_resource_status = "PREPARED"

        state_payload = {
            "session_id": state.session_id,
            "learner_id": state.learner_id,
            "target_goal": state.target_goal,
            "current_topic_id": state.current_topic_id,
            "current_topic_index": state.current_topic_index,
            "roadmap_id": state.roadmap_id,
            "active_topic": state.active_topic,
            "available_topics": state.available_topics,
            "upcoming_topics": state.upcoming_topics,
            "prefetch_target_topic": state.prefetch_target_topic,
            "completed_topics": state.completed_topics,
            "generated_chunks": generated_chunks,
            "skill_analysis_available": state.skill_analysis is not None,
            "skill_analysis": (
                state.skill_analysis.model_dump()
                if state.skill_analysis
                else None
            ),
            "discovered_resources": discovered_resource_summary,
            "prefetched_topics": state.prefetched_topics,
            "derived_resource_state": {
                "active_topic_status": active_resource_status,
                "active_topic_is_prefetched": (
                    state.active_topic in state.prefetched_topics
                    if state.active_topic
                    else False
                ),
                "prefetch_target_topic": state.prefetch_target_topic,
                "resource_status_rule": (
                    "PREPARED means at least one YouTube or general resource exists."
                ),
            },
            "previous_actions": state.previous_actions[-10:],
            "status": state.status,
            "error_history": state.error_history[-5:],
            "trigger_event": (
                trigger_event
                or "PERIODIC_ORCHESTRATION_CHECK"
            ),
        }

        return (
            "=== HADES ORCHESTRATION STATE ===\n"
            + json.dumps(
                state_payload,
                indent=2,
                default=str,
            )
            + "\n\n"
            "=== ORCHESTRATION DECISION RULES ===\n"
            "The state contains two different topic concepts that must not be "
            "confused:\n"
            "1. active_topic = the topic the learner is currently studying.\n"
            "2. prefetch_target_topic = the next topic whose resources should be "
            "prepared proactively for future learner progression.\n\n"
            "When active_topic already has PREPARED resources, do NOT select "
            "PREPARE_TOPIC_RESOURCES for that active topic again.\n"
            "When prefetch_target_topic is present and has not already been "
            "prefetched or prepared, prefer PREFETCH_NEXT_TOPIC when proactive "
            "preparation is appropriate.\n"
            "For PREFETCH_NEXT_TOPIC, target_topic MUST be exactly "
            "prefetch_target_topic.\n"
            "For PREPARE_TOPIC_RESOURCES, target_topic MUST be exactly "
            "active_topic.\n"
            "Do not invent, rename, or infer a different topic target when the "
            "runtime has explicitly supplied one.\n\n"
            "The runtime supplies roadmap ordering and the explicit prefetch target. "
            "Your responsibility is to choose the appropriate operational action "
            "using the supplied state; do not replace the runtime's topic ordering "
            "with your own.\n\n"
            "Evaluate the state and select exactly ONE next operational action. "
            "Return only the OrchestratorDecision schema."
        )

    @staticmethod
    def _parse_decision(content: Any) -> OrchestratorDecision:
        """Normalize Agno structured output into OrchestratorDecision."""

        if isinstance(content, OrchestratorDecision):
            return content

        if isinstance(content, dict):
            return OrchestratorDecision.model_validate(content)

        if isinstance(content, str):
            clean_content = content.strip()
            if "503" in clean_content or "temporarily unavailable" in clean_content.lower() or "timeout" in clean_content.lower() or "connection error" in clean_content.lower() or "upstream connect error" in clean_content.lower():
                logger.warning("[ORCHESTRATOR] AI Provider returned service error: %s", clean_content)
                return OrchestratorDecision(
                    action="ERROR_RECOVERY",
                    rationale=f"AI Provider error: {clean_content[:150]}",
                    should_continue=False
                )

            if clean_content.startswith("```"):
                lines = clean_content.splitlines()
                if len(lines) >= 2 and lines[0].startswith("```"):
                    end_idx = -1 if lines[-1].strip().startswith("```") else len(lines)
                    clean_content = "\n".join(lines[1:end_idx]).strip()

            try:
                parsed = json.loads(clean_content)
            except json.JSONDecodeError as exc:
                if "API error occurred" in clean_content or "Status 5" in clean_content:
                    return OrchestratorDecision(
                        action="ERROR_RECOVERY",
                        rationale=f"AI Provider service unavailable: {clean_content[:150]}",
                        should_continue=False
                    )
                raise ValueError(
                    "AutonomousOrchestratorAgent returned a non-JSON "
                    f"decision string: {content}"
                ) from exc

            return OrchestratorDecision.model_validate(parsed)

        raise ValueError(
            "AutonomousOrchestratorAgent returned unsupported decision "
            f"content type: {type(content)}"
        )


def validate_orchestrator_decision(
    decision: OrchestratorDecision,
    state: OrchestrationState,
) -> OrchestratorDecision:
    """
    Validate and normalize an LLM orchestration decision.

    This function is not an orchestration policy engine.
    It enforces structural invariants required by the execution layer
    and fills runtime-owned topic targets when the LLM omits them.
    It does not select an alternative orchestration action.
    """


    action = str(decision.action)

    if action not in VALID_ORCHESTRATOR_ACTIONS:
        raise ValueError(
            f"Unknown orchestrator action returned by LLM: {action}"
        )

    # --------------------------------------------------------
    # Topic-targeted actions
    # --------------------------------------------------------

    if action == "PREPARE_TOPIC_RESOURCES":
        if not state.active_topic:
            raise ValueError(
                "PREPARE_TOPIC_RESOURCES requires an active topic."
            )

        if decision.target_topic is None:
            decision = decision.model_copy(
                update={
                    "target_topic": state.active_topic,
                }
            )
        elif decision.target_topic != state.active_topic:
            raise ValueError(
                "PREPARE_TOPIC_RESOURCES target_topic must exactly match "
                f"active_topic={state.active_topic!r}; "
                f"got {decision.target_topic!r}."
            )

        active_resources = state.discovered_resources.get(state.active_topic)
        if active_resources is not None:
            youtube_count = len(active_resources.youtube_resources)
            general_count = len(active_resources.general_resources)

            if youtube_count > 0 or general_count > 0:
                raise ValueError(
                    "PREPARE_TOPIC_RESOURCES is invalid because active_topic="
                    f"{state.active_topic!r} already has prepared resources "
                    f"(youtube={youtube_count}, general={general_count}). "
                    "Choose the next operational action instead."
                )

    elif action == "PREFETCH_NEXT_TOPIC":
        if not state.prefetch_target_topic:
            raise ValueError(
                "PREFETCH_NEXT_TOPIC is invalid because "
                "prefetch_target_topic is not available."
            )

        if decision.target_topic is None:
            decision = decision.model_copy(
                update={
                    "target_topic": state.prefetch_target_topic,
                }
            )
        elif decision.target_topic != state.prefetch_target_topic:
            raise ValueError(
                "PREFETCH_NEXT_TOPIC target_topic must exactly match "
                f"prefetch_target_topic={state.prefetch_target_topic!r}; "
                f"got {decision.target_topic!r}."
            )

        if decision.target_topic in state.prefetched_topics:
            raise ValueError(
                "PREFETCH_NEXT_TOPIC target is already prefetched: "
                f"{decision.target_topic!r}."
            )

        discovered = state.discovered_resources.get(decision.target_topic)
        if discovered is not None:
            youtube_count = len(discovered.youtube_resources)
            general_count = len(discovered.general_resources)

            if youtube_count > 0 or general_count > 0:
                raise ValueError(
                    "PREFETCH_NEXT_TOPIC target already has prepared "
                    f"resources: {decision.target_topic!r}."
                )

    # --------------------------------------------------------
    # Non-topic actions
    # --------------------------------------------------------

    elif action in {
        "ANALYZE_SKILLS",
        "GENERATE_ROADMAP_CHUNK",
        "RETURN_CURRENT_STATE",
        "WAIT_FOR_LEARNER",
        "REPLAN",
        "COMPLETE",
        "ERROR_RECOVERY",
    }:
        if decision.target_topic is not None:
            raise ValueError(
                f"{action} must not contain target_topic; "
                f"got {decision.target_topic!r}."
            )

    # --------------------------------------------------------
    # Incremental roadmap generation parameters
    # --------------------------------------------------------

    if action == "GENERATE_ROADMAP_CHUNK":
        parameters = decision.parameters or {}

        if "sequence_number" in parameters:
            sequence_number = parameters["sequence_number"]

            if (
                not isinstance(sequence_number, int)
                or isinstance(sequence_number, bool)
                or sequence_number < 1
            ):
                raise ValueError(
                    "GENERATE_ROADMAP_CHUNK sequence_number must be "
                    "an integer >= 1."
                )

        if "chunk_size" in parameters:
            chunk_size = parameters["chunk_size"]

            if (
                not isinstance(chunk_size, int)
                or isinstance(chunk_size, bool)
                or not 1 <= chunk_size <= 20
            ):
                raise ValueError(
                    "GENERATE_ROADMAP_CHUNK chunk_size must be "
                    "an integer between 1 and 20."
                )

    return decision


def create_orchestrator_agent(
    api_key: Optional[str] = None,
    model_id: Optional[str] = None,
    agent_instance: Optional[Agent] = None,
) -> AutonomousOrchestratorAgent:
    """Factory helper to instantiate the autonomous orchestrator."""

    return AutonomousOrchestratorAgent(
        api_key=api_key,
        model_id=model_id,
        agent_instance=agent_instance,
    )
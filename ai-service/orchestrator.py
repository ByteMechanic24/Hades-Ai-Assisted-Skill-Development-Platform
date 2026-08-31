"""
HADES Central Autonomous AI Orchestrator (Step 4)

The LLM is the decision-maker.

The runtime:
1. Builds/hydrates orchestration state.
2. Asks the autonomous orchestrator agent for the next action.
3. Executes exactly that action through the tool layer.
4. Updates and persists state.
5. Reports the completed action back to the LLM.
6. Repeats until the LLM stops, the workflow reaches a terminal state,
   or the runtime safety ceiling is reached.

IMPORTANT:
There is no hard-coded orchestration decision tree in this runtime.
The runtime provides execution and contract/safety plumbing only.
"""

import logging
import uuid
from typing import Optional, List, Any

from app.schemas.models import (
    LearnerProfile,
    LearningPathResponse,
    RoadmapChunk,
    TopicResourceDiscoveryRequest,
    TopicResourceDiscoveryResponse,
    OrchestrationRequest,
    OrchestrationResponse,
    OrchestrationState,
    OrchestratorDecision,
)

from app.agents.orchestrator_agent import (
    AutonomousOrchestratorAgent,
    create_orchestrator_agent,
)

from app.tools.orchestrator_tools import (
    OrchestratorToolError,
    analyze_learner_skills,
    generate_master_curriculum,
    generate_roadmap_chunk,
    prepare_topic_resources,
)

from app.tools.resource_tools import ResourceSearchProvider

from app.db.learner_context import get_learner_context

from app.db.orchestrator_state import (
    save_orchestration_state,
    get_orchestration_state,
    get_saved_roadmap_chunks,
)

from app.workflows import (
    LearningPathWorkflow,
    create_learning_path_workflow,
    TopicResourceDiscoveryWorkflow,
    create_topic_resource_workflow,
)

logger = logging.getLogger(__name__)

DEFAULT_MAX_ORCHESTRATION_STEPS = 6


class AIOrchestrator:
    """
    Central execution runtime for HADES.

    Decision authority:
        AutonomousOrchestratorAgent

    Execution authority:
        Orchestrator tool functions

    State authority:
        OrchestrationState + persistence layer

    The runtime does NOT choose the next action.
    """

    def __init__(
        self,
        orchestrator_agent: Optional[AutonomousOrchestratorAgent] = None,
        tools: Optional[Any] = None,
        learning_path_workflow: Optional[LearningPathWorkflow] = None,
        topic_resource_workflow: Optional[TopicResourceDiscoveryWorkflow] = None,
        max_steps: int = DEFAULT_MAX_ORCHESTRATION_STEPS,
    ):
        if max_steps < 1:
            raise ValueError("max_steps must be >= 1.")

        self.agent = orchestrator_agent or create_orchestrator_agent()

        self.tools = tools

        self.learning_path_wf = (
            learning_path_workflow
            or create_learning_path_workflow()
        )

        self.topic_resource_wf = (
            topic_resource_workflow
            or create_topic_resource_workflow()
        )

        self.max_steps = max_steps

        # Runtime-only curriculum cache.
        self._curriculum_cache = {}

    # ==================================================================
    # MAIN AUTONOMOUS LOOP
    # ==================================================================

    def orchestrate(
        self,
        request: OrchestrationRequest,
        provider: Optional[ResourceSearchProvider] = None,
    ) -> OrchestrationResponse:
        """
        Run one bounded autonomous orchestration cycle.

        The original request event is used only for the first decision.

        After every successful action, the runtime feeds the result back
        to the LLM using:

            ACTION_COMPLETED:<ACTION>
        """

        learner_id = request.learner_id.strip()

        if not learner_id:
            raise ValueError("learner_id must be provided.")

        session_id = self._resolve_session_id(
            request=request,
            learner_id=learner_id,
        )

        state = self._hydrate_initial_state(
            session_id=session_id,
            request=request,
        )

        latest_decision: Optional[OrchestratorDecision] = None

        current_trigger_event = (
            request.event or "INITIAL_SESSION"
        )

        executed_steps = 0

        for step_number in range(
            1,
            self.max_steps + 1,
        ):
            executed_steps = step_number

            logger.info(
                "[ORCHESTRATOR] step=%s/%s learner=%s event=%s",
                step_number,
                self.max_steps,
                learner_id,
                current_trigger_event,
            )

            try:
                # ------------------------------------------------------
                # 1. ASK AUTONOMOUS LLM
                # ------------------------------------------------------

                decision = self.agent.decide_next_action(
                    state=state,
                    trigger_event=current_trigger_event,
                )

                latest_decision = decision

                logger.info(
                    "[ORCHESTRATOR DECISION] step=%s action=%s "
                    "target=%s continue=%s",
                    step_number,
                    decision.action,
                    decision.target_topic or "None",
                    decision.should_continue,
                )

                self._record_action(
                    state=state,
                    step_number=step_number,
                    decision=decision,
                )

                # ------------------------------------------------------
                # 2. EXECUTE EXACTLY WHAT LLM SELECTED
                # ------------------------------------------------------

                action_completed = self._execute_action(
                    decision=decision,
                    state=state,
                    provider=provider,
                )

                # ------------------------------------------------------
                # 3. PERSIST UPDATED STATE
                # ------------------------------------------------------

                self._trim_history(state)

                save_orchestration_state(state)

                # ------------------------------------------------------
                # 4. STOP IF TERMINAL
                # ------------------------------------------------------

                if not action_completed:
                    logger.info(
                        "[ORCHESTRATOR] action=%s requested stop.",
                        decision.action,
                    )
                    break

                if not decision.should_continue:
                    logger.info(
                        "[ORCHESTRATOR] LLM requested orchestration stop "
                        "after action=%s.",
                        decision.action,
                    )
                    break

                # ------------------------------------------------------
                # 5. FEED RESULT BACK TO LLM
                # ------------------------------------------------------

                current_trigger_event = (
                    f"ACTION_COMPLETED:{decision.action}"
                )

                logger.info(
                    "[ORCHESTRATOR] continuing with trigger=%s",
                    current_trigger_event,
                )

            except Exception as exc:
                logger.exception(
                    "[ORCHESTRATOR] execution failure at step %s",
                    step_number,
                )

                state.error_history.append(
                    f"Orchestration step {step_number} failed: {exc}"
                )

                state.status = "FAILED"

                latest_decision = OrchestratorDecision(
                    action="ERROR_RECOVERY",
                    target_topic=None,
                    rationale=(
                        "The selected orchestration operation failed "
                        "and the session was halted safely."
                    ),
                    should_continue=False,
                    parameters={},
                )

                self._trim_history(state)

                save_orchestration_state(state)

                break

        # ==================================================================
        # SAFETY CEILING
        # ==================================================================

        if (
            executed_steps >= self.max_steps
            and latest_decision is not None
            and latest_decision.should_continue
            and state.status != "FAILED"
        ):
            state.status = "PAUSED"

            state.error_history.append(
                "Autonomous orchestration safety ceiling reached "
                f"({self.max_steps} steps)."
            )

            save_orchestration_state(state)

            logger.warning(
                "[ORCHESTRATOR] Safety ceiling reached at %s steps.",
                self.max_steps,
            )

        return self._build_response(
            state=state,
            latest_decision=latest_decision,
        )

    # ==================================================================
    # SESSION MANAGEMENT
    # ==================================================================

    def _resolve_session_id(
        self,
        request: OrchestrationRequest,
        learner_id: str,
    ) -> str:
        context = request.context or {}

        supplied = context.get("session_id")

        if supplied and str(supplied).strip():
            return str(supplied).strip()

        return f"sess-{learner_id}-{uuid.uuid4().hex[:8]}"

    # ==================================================================
    # STATE HYDRATION
    # ==================================================================

    def _hydrate_initial_state(
        self,
        session_id: str,
        request: OrchestrationRequest,
    ) -> OrchestrationState:
        """
        Build orchestration state from:

        1. Existing persisted session state, if available.
        2. Saved roadmap chunks.
        3. Current request context.

        IMPORTANT:
        Skill analysis is intentionally not fabricated here.

        The autonomous agent remains responsible for deciding whether
        ANALYZE_SKILLS is the next operation.

        Runtime execution methods can recover missing skill analysis when
        it is required by a downstream operation.
        """

        learner_id = request.learner_id.strip()

        existing = get_orchestration_state(
            session_id,
            learner_id=learner_id,
        )

        if existing is not None:
            state = existing

            if request.target_goal:
                state.target_goal = request.target_goal

            self._apply_external_progress_context(
                state=state,
                request=request,
            )

            return state

        saved_chunks = get_saved_roadmap_chunks(
            learner_id
        )

        all_topics: List[str] = []

        for chunk in sorted(
            saved_chunks,
            key=lambda c: c.sequence_number,
        ):
            for topic in chunk.topics:
                if topic not in all_topics:
                    all_topics.append(topic)

        active_topic = self._resolve_requested_topic(
            requested=request.current_topic_id,
            chunks=saved_chunks,
            topics=all_topics,
        )

        if active_topic is None and all_topics:
            active_topic = all_topics[0]

        current_index = (
            all_topics.index(active_topic)
            if active_topic in all_topics
            else 0
        )

        state = OrchestrationState(
            session_id=session_id,
            learner_id=learner_id,
            target_goal=request.target_goal,
            current_topic_id=request.current_topic_id,
            current_topic_index=current_index,
            roadmap_id=(
                saved_chunks[-1].roadmap_id
                if saved_chunks
                else None
            ),
            generated_chunks=saved_chunks,
            available_topics=all_topics,
            completed_topics=[],
            active_topic=active_topic,
            upcoming_topics=(
                all_topics[current_index + 1:]
                if active_topic
                else []
            ),
            skill_analysis=None,
            discovered_resources={},
            prefetched_topics=[],
            previous_actions=[],
            status="INITIALIZING",
            error_history=[],
        )

        self._apply_external_progress_context(
            state=state,
            request=request,
        )

        return state

    def _apply_external_progress_context(
        self,
        state: OrchestrationState,
        request: OrchestrationRequest,
    ) -> None:
        """
        Apply explicit backend progress information.

        This does NOT decide the next action.
        """

        if request.target_goal:
            state.target_goal = request.target_goal

        context = request.context or {}

        completed = context.get("completed_topics")

        if isinstance(completed, list):
            for topic in completed:
                if (
                    isinstance(topic, str)
                    and topic not in state.completed_topics
                ):
                    state.completed_topics.append(topic)

        explicit_active = request.current_topic_id

        if explicit_active:
            resolved = self._resolve_topic_against_state(
                explicit_active,
                state.available_topics,
            )

            if resolved:
                state.active_topic = resolved

                state.current_topic_index = (
                    state.available_topics.index(resolved)
                )

                state.current_topic_id = explicit_active

                state.upcoming_topics = (
                    state.available_topics[
                        state.current_topic_index + 1:
                    ]
                )

        if (
            not explicit_active
            and request.event
            in {
                "TOPIC_COMPLETE",
                "TOPIC_COMPLETED",
            }
            and state.active_topic
        ):
            if (
                state.active_topic
                not in state.completed_topics
            ):
                state.completed_topics.append(
                    state.active_topic
                )

            next_index = (
                state.current_topic_index + 1
            )

            if (
                next_index
                < len(state.available_topics)
            ):
                state.current_topic_index = next_index

                state.active_topic = (
                    state.available_topics[next_index]
                )

                state.current_topic_id = None

                state.upcoming_topics = (
                    state.available_topics[
                        next_index + 1:
                    ]
                )
            else:
                state.upcoming_topics = []

        self._refresh_prefetch_target(state)

    # ==================================================================
    # TOPIC RESOLUTION
    # ==================================================================

    def _resolve_requested_topic(
        self,
        requested: Optional[str],
        chunks: List[RoadmapChunk],
        topics: List[str],
    ) -> Optional[str]:
        if not requested:
            return None

        exact = self._resolve_topic_against_state(
            requested,
            topics,
        )

        if exact:
            return exact

        for chunk in chunks:
            for milestone in chunk.milestones:
                for module in milestone.modules:
                    if module.module_id == requested:
                        return module.title

        return None

    @staticmethod
    def _resolve_topic_against_state(
        requested: str,
        topics: List[str],
    ) -> Optional[str]:
        requested_normalized = (
            requested.strip().casefold()
        )

        for topic in topics:
            if (
                topic.strip().casefold()
                == requested_normalized
            ):
                return topic

        return None

    # ==================================================================
    # SKILL ANALYSIS RECOVERY
    # ==================================================================

    def _ensure_skill_analysis(
        self,
        state: OrchestrationState,
    ) -> None:
        """
        Recover skill analysis when downstream execution requires it.

        This is NOT action selection.

        The LLM still decides whether the orchestration should analyze
        skills. This method only guarantees that a required execution
        dependency exists before curriculum/resource operations run.
        """

        if state.skill_analysis is not None:
            return

        logger.info(
            "[ORCHESTRATOR] Recovering missing skill analysis "
            "for learner=%s target_goal=%s",
            state.learner_id,
            state.target_goal,
        )

        analysis = analyze_learner_skills(
            learner_id=state.learner_id,
            target_goal=state.target_goal,
        )

        state.skill_analysis = analysis

        if not state.target_goal:
            state.target_goal = analysis.target_goal

        logger.info(
            "[ORCHESTRATOR] Skill analysis recovery completed."
        )

    # ==================================================================
    # ACTION EXECUTION
    # ==================================================================

    def _execute_action(
        self,
        decision: OrchestratorDecision,
        state: OrchestrationState,
        provider: Optional[ResourceSearchProvider],
    ) -> bool:
        """
        Execute EXACTLY the action selected by the LLM.

        This method never replaces the selected action with another action.
        """

        action = str(decision.action)

        logger.info(
            "[ORCHESTRATOR EXECUTE] action=%s target=%s",
            action,
            decision.target_topic or "None",
        )

        # ============================================================== 
        # ANALYZE SKILLS
        # ==============================================================

        if action == "ANALYZE_SKILLS":
            state.status = "ANALYZING_SKILLS"

            analysis = analyze_learner_skills(
                learner_id=state.learner_id,
                target_goal=state.target_goal,
            )

            state.skill_analysis = analysis

            if not state.target_goal:
                state.target_goal = analysis.target_goal

            logger.info(
                "[ORCHESTRATOR EXECUTE] Skill analysis completed."
            )

            return True

        # ============================================================== 
        # GENERATE ROADMAP CHUNK
        # ==============================================================

        if action == "GENERATE_ROADMAP_CHUNK":
            state.status = "GENERATING_ROADMAP"

            self._ensure_skill_analysis(state)

            parameters = decision.parameters or {}

            sequence_number = self._coerce_positive_int(
                parameters.get("sequence_number"),
                default=len(state.generated_chunks) + 1,
            )

            chunk_size = self._coerce_positive_int(
                parameters.get("chunk_size"),
                default=3,
            )

            logger.info(
                "[ORCHESTRATOR EXECUTE] "
                "Generating roadmap chunk sequence=%s size=%s",
                sequence_number,
                chunk_size,
            )

            curriculum = generate_master_curriculum(
                learner_id=state.learner_id,
                skill_analysis=state.skill_analysis,
                target_goal=state.target_goal,
            )

            cache_key = (
                state.learner_id,
                state.target_goal or "",
                state.skill_analysis.model_dump_json(
                    exclude_none=True,
                    exclude_unset=False,
                ),
            )

            self._curriculum_cache[cache_key] = curriculum

            chunk = generate_roadmap_chunk(
                learner_id=state.learner_id,
                curriculum=curriculum,
                sequence_number=sequence_number,
                chunk_size=chunk_size,
            )

            state.generated_chunks = [
                c
                for c in state.generated_chunks
                if not (
                    c.roadmap_id == chunk.roadmap_id
                    and c.sequence_number == chunk.sequence_number
                )
            ]

            state.generated_chunks.append(chunk)

            state.generated_chunks.sort(
                key=lambda c: c.sequence_number
            )

            state.roadmap_id = chunk.roadmap_id

            for topic in chunk.topics:
                if topic not in state.available_topics:
                    state.available_topics.append(topic)

            if (
                state.active_topic is None
                and state.available_topics
            ):
                state.active_topic = (
                    state.available_topics[0]
                )

                state.current_topic_index = 0

            self._refresh_topic_queue(state)

            logger.info(
                "[ORCHESTRATOR EXECUTE] Roadmap chunk generated: %s",
                chunk.title,
            )

            return True

        # ============================================================== 
        # PREPARE ACTIVE TOPIC RESOURCES
        # ==============================================================

        if action == "PREPARE_TOPIC_RESOURCES":
            state.status = "PREPARING_RESOURCES"

            topic = decision.target_topic

            if not topic:
                raise OrchestratorToolError(
                    "PREPARE_TOPIC_RESOURCES requires target_topic."
                )

            topic = self._resolve_topic_against_state(
                topic,
                state.available_topics,
            )

            if topic is None:
                raise OrchestratorToolError(
                    "PREPARE_TOPIC_RESOURCES target_topic "
                    "is not present in state."
                )

            if topic in state.discovered_resources:
                logger.info(
                    "[ORCHESTRATOR EXECUTE] Resources already "
                    "prepared for topic=%s",
                    topic,
                )
                return True

            # ----------------------------------------------------------
            # RECOVER REQUIRED DEPENDENCY
            # ----------------------------------------------------------

            self._ensure_skill_analysis(state)

            curriculum = self._get_curriculum_for_state(state)

            resource_request = self._build_topic_resource_request(
                state=state,
                topic=topic,
                curriculum=curriculum,
            )

            response = prepare_topic_resources(
                request=resource_request,
            )

            state.discovered_resources[topic] = response

            logger.info(
                "[ORCHESTRATOR EXECUTE] Resources prepared "
                "for topic=%s",
                topic,
            )

            return True

        # ============================================================== 
        # PREFETCH NEXT TOPIC
        # ==============================================================

        if action == "PREFETCH_NEXT_TOPIC":
            topic = decision.target_topic

            if not topic:
                raise OrchestratorToolError(
                    "PREFETCH_NEXT_TOPIC requires target_topic."
                )

            if not state.prefetch_target_topic:
                raise OrchestratorToolError(
                    "PREFETCH_NEXT_TOPIC cannot execute because "
                    "prefetch_target_topic is not available."
                )

            topic = self._resolve_topic_against_state(
                topic,
                [state.prefetch_target_topic],
            )

            if topic is None:
                raise OrchestratorToolError(
                    "PREFETCH_NEXT_TOPIC target_topic must exactly match "
                    f"prefetch_target_topic={state.prefetch_target_topic!r}."
                )

            if topic in state.discovered_resources:
                if topic not in state.prefetched_topics:
                    state.prefetched_topics.append(topic)

                self._refresh_prefetch_target(state)

                logger.info(
                    "[ORCHESTRATOR EXECUTE] Topic already "
                    "has resources; marked prefetched: %s",
                    topic,
                )

                return True

            # ----------------------------------------------------------
            # RECOVER REQUIRED DEPENDENCY
            # ----------------------------------------------------------

            self._ensure_skill_analysis(state)

            curriculum = self._get_curriculum_for_state(state)

            resource_request = self._build_topic_resource_request(
                state=state,
                topic=topic,
                curriculum=curriculum,
            )

            response = prepare_topic_resources(
                request=resource_request,
            )

            state.discovered_resources[topic] = response

            if topic not in state.prefetched_topics:
                state.prefetched_topics.append(topic)

            self._refresh_prefetch_target(state)

            logger.info(
                "[ORCHESTRATOR EXECUTE] Prefetched topic=%s",
                topic,
            )

            return True

        # ============================================================== 
        # RETURN CURRENT STATE
        # ==============================================================

        if action == "RETURN_CURRENT_STATE":
            state.status = "READY"

            logger.info(
                "[ORCHESTRATOR EXECUTE] Returning current state."
            )

            return False

        # ============================================================== 
        # WAIT FOR LEARNER
        # ==============================================================

        if action == "WAIT_FOR_LEARNER":
            state.status = "READY"

            logger.info(
                "[ORCHESTRATOR EXECUTE] Waiting for learner."
            )

            return False

        # ============================================================== 
        # COMPLETE
        # ==============================================================

        if action == "COMPLETE":
            state.status = "COMPLETED"

            logger.info(
                "[ORCHESTRATOR EXECUTE] Roadmap completed."
            )

            return False

        # ============================================================== 
        # REPLAN
        # ==============================================================

        if action == "REPLAN":
            state.status = "PAUSED"

            logger.info(
                "[ORCHESTRATOR EXECUTE] Replan requested."
            )

            return False

        # ============================================================== 
        # ERROR RECOVERY
        # ==============================================================

        if action == "ERROR_RECOVERY":
            state.status = "FAILED"

            logger.warning(
                "[ORCHESTRATOR EXECUTE] "
                "LLM selected ERROR_RECOVERY."
            )

            return False

        raise OrchestratorToolError(
            f"Unsupported orchestrator action: {action}"
        )

    # ==================================================================
    # RESOURCE REQUEST BUILDING
    # ==================================================================

    def _build_topic_resource_request(
        self,
        state: OrchestrationState,
        topic: str,
        curriculum: Optional[LearningPathResponse] = None,
    ) -> TopicResourceDiscoveryRequest:

        profile = get_learner_context(
            state.learner_id
        )

        target_goal = (
            state.target_goal
            or profile.target_goal
        )

        if target_goal != profile.target_goal:
            profile_data = profile.model_dump()
            profile_data["target_goal"] = target_goal
            profile = LearnerProfile(
                **profile_data
            )

        milestone_title = None
        milestone_objective = None
        key_deliverable = None
        topic_description = None

        topic_id = topic

        if curriculum is not None:
            found = False

            normalized_topic = topic.strip().casefold()

            for milestone in curriculum.milestones:
                for module in milestone.modules:

                    module_title_match = (
                        module.title.strip().casefold()
                        == normalized_topic
                    )

                    module_topic_match = any(
                        isinstance(module_topic, str)
                        and module_topic.strip().casefold()
                        == normalized_topic
                        for module_topic in getattr(
                            module,
                            "topics",
                            [],
                        )
                    )

                    if module_title_match or module_topic_match:
                        topic_id = module.module_id
                        topic_description = module.description
                        milestone_title = milestone.title
                        milestone_objective = milestone.objective
                        key_deliverable = module.key_deliverable
                        found = True
                        break

                if found:
                    break

        return TopicResourceDiscoveryRequest(
            learner_id=profile.learner_id,
            topic_id=topic_id,
            topic_title=topic,
            topic_description=topic_description,
            target_goal=profile.target_goal,
            experience_level=profile.experience_level,
            current_skills=profile.current_skills,
            learning_preferences=(
                profile.learning_preferences
            ),
            milestone_title=milestone_title,
            milestone_objective=milestone_objective,
            key_deliverable=key_deliverable,
            max_youtube_resources=5,
            max_general_resources=5,
            include_general_resources=True,
        )

    # ==================================================================
    # CURRICULUM RECOVERY
    # ==================================================================

    def _get_curriculum_for_state(
        self,
        state: OrchestrationState,
    ) -> LearningPathResponse:
        """
        Recover the master curriculum required by resource operations.

        If the current process/container does not have skill_analysis in
        memory, recover it from the learner profile before generating the
        curriculum.
        """

        self._ensure_skill_analysis(state)

        cache_key = (
            state.learner_id,
            state.target_goal or "",
            state.skill_analysis.model_dump_json(
                exclude_none=True,
                exclude_unset=False,
            ),
        )

        cached = self._curriculum_cache.get(cache_key)

        if cached is not None:
            return cached

        curriculum = generate_master_curriculum(
            learner_id=state.learner_id,
            skill_analysis=state.skill_analysis,
            target_goal=state.target_goal,
        )

        self._curriculum_cache[cache_key] = curriculum

        return curriculum

    # ==================================================================
    # STATE UTILITIES
    # ==================================================================

    @staticmethod
    def _coerce_positive_int(
        value: Any,
        default: int,
    ) -> int:

        if value is None:
            return default

        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default

        if parsed < 1:
            return default

        return parsed

    @staticmethod
    def _refresh_prefetch_target(
        state: OrchestrationState,
    ) -> None:

        state.prefetch_target_topic = None

        for topic in state.upcoming_topics:

            if topic in state.prefetched_topics:
                continue

            discovered = state.discovered_resources.get(topic)

            if discovered is not None and (
                len(discovered.youtube_resources) > 0
                or len(discovered.general_resources) > 0
            ):
                continue

            state.prefetch_target_topic = topic

            break

    @staticmethod
    def _refresh_topic_queue(
        state: OrchestrationState,
    ) -> None:

        if (
            state.active_topic
            and state.active_topic
            in state.available_topics
        ):
            state.current_topic_index = (
                state.available_topics.index(
                    state.active_topic
                )
            )

            state.upcoming_topics = (
                state.available_topics[
                    state.current_topic_index + 1:
                ]
            )
        else:
            state.upcoming_topics = []

        AIOrchestrator._refresh_prefetch_target(state)

    @staticmethod
    def _record_action(
        state: OrchestrationState,
        step_number: int,
        decision: OrchestratorDecision,
    ) -> None:

        state.previous_actions.append(
            f"Step {step_number}: "
            f"{decision.action} "
            f"target={decision.target_topic or 'None'} "
            f"rationale={decision.rationale}"
        )

    @staticmethod
    def _trim_history(
        state: OrchestrationState,
    ) -> None:

        state.previous_actions = (
            state.previous_actions[-20:]
        )

        state.error_history = (
            state.error_history[-10:]
        )

    # ==================================================================
    # RESPONSE BUILDING
    # ==================================================================

    def _build_response(
        self,
        state: OrchestrationState,
        latest_decision: Optional[OrchestratorDecision],
    ) -> OrchestrationResponse:

        current_chunk = None

        if state.generated_chunks:
            current_chunk = next(
                (
                    chunk
                    for chunk in state.generated_chunks
                    if (
                        state.active_topic
                        and state.active_topic
                        in chunk.topics
                    )
                ),
                state.generated_chunks[-1],
            )

        active_resources = (
            state.discovered_resources.get(
                state.active_topic
            )
            if state.active_topic
            else None
        )

        latest_has_more = bool(
            current_chunk
            and current_chunk.has_more
        )

        more_roadmap_needed = bool(
            latest_has_more
            and len(state.upcoming_topics) <= 1
        )

        action = (
            latest_decision.action
            if latest_decision is not None
            else "RETURN_CURRENT_STATE"
        )

        rationale = (
            latest_decision.rationale
            if latest_decision is not None
            else "Orchestration state synchronized."
        )

        can_continue = (
            state.status
            not in {
                "FAILED",
                "COMPLETED",
            }
        )

        return OrchestrationResponse(
            session_id=state.session_id,
            learner_id=state.learner_id,
            status=state.status,
            active_topic=state.active_topic,
            current_chunk=current_chunk,
            available_topics=state.available_topics,
            active_resources=active_resources,
            prefetched_topics=state.prefetched_topics,
            can_continue=can_continue,
            more_roadmap_needed=more_roadmap_needed,
            next_recommended_action=action,
            rationale=rationale,
        )

    # ==================================================================
    # EXISTING PUBLIC COMPATIBILITY APIs
    # ==================================================================

    def generate_learning_path(
        self,
        learner_id: str,
        target_goal: Optional[str] = None,
    ) -> LearningPathResponse:

        return self.learning_path_wf.run(
            learner_id=learner_id,
            target_goal=target_goal,
        )

    def discover_topic_resources(
        self,
        request: TopicResourceDiscoveryRequest,
        provider: Optional[ResourceSearchProvider] = None,
    ) -> TopicResourceDiscoveryResponse:

        return self.topic_resource_wf.run(
            request=request,
            provider=provider,
        )


def create_orchestrator(
    orchestrator_agent: Optional[AutonomousOrchestratorAgent] = None,
    tools: Optional[Any] = None,
    max_steps: int = DEFAULT_MAX_ORCHESTRATION_STEPS,
) -> AIOrchestrator:

    return AIOrchestrator(
        orchestrator_agent=orchestrator_agent,
        tools=tools,
        max_steps=max_steps,
    )
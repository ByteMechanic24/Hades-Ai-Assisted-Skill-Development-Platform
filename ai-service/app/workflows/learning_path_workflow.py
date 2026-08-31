"""
Learning Path Workflow (Agno Workflow 2.0)

Orchestrates the end-to-end curriculum generation pipeline:
1. PostgreSQL Learner Context Retrieval
2. Skill Gap & Prerequisite Analysis (LearnerSkillAnalysisAgent)
3. Learning Path Recommendation & Roadmap.sh Ingestion (LearningPathRecommendationAgent)
4. Persistent Memory Storage of the Generated Curriculum
"""

from typing import Optional, Dict, Any
from agno.workflow import Workflow, Step, StepInput, StepOutput, OnError


from app.schemas.models import (
    LearnerProfile,
    SkillAnalysis,
    LearningPathResponse,
)
from app.db.learner_context import get_learner_context
from app.db.memory import save_memory
from app.agents.skill_analysis_agent import (
    LearnerSkillAnalysisAgent,
    create_skill_analysis_agent,
)
from app.agents.learning_path_agent import (
    LearningPathRecommendationAgent,
    create_learning_path_agent,
)
from app.adapters.roadmap_adapter import RoadmapAdapter


class LearningPathWorkflow:
    """
    Agno-based workflow coordinating learner context extraction, skill analysis,
    curriculum recommendation, and persistent storage.
    """

    def __init__(
        self,
        skill_agent: Optional[LearnerSkillAnalysisAgent] = None,
        path_agent: Optional[LearningPathRecommendationAgent] = None,
        roadmap_adapter: Optional[RoadmapAdapter] = None,
    ):
        self.skill_agent = skill_agent or create_skill_analysis_agent()
        self.path_agent = path_agent or create_learning_path_agent()
        self.roadmap_adapter = roadmap_adapter or RoadmapAdapter()

        # Build official Agno Workflow
        self._workflow = Workflow(
            name="LearningPathWorkflow",
            description="Orchestrates personalized learning path generation from PostgreSQL context to validated roadmap.",
            steps=[
                Step(name="FetchLearnerContext", executor=self._step_fetch_context, on_error=OnError.fail, max_retries=0),
                Step(name="AnalyzeSkillGaps", executor=self._step_analyze_skills, on_error=OnError.fail, max_retries=0),
                Step(name="GenerateLearningPath", executor=self._step_generate_path, on_error=OnError.fail, max_retries=0),
                Step(name="PersistLearningPath", executor=self._step_persist_path, on_error=OnError.fail, max_retries=0),
            ],
        )


    def run(
        self,
        learner_id: str,
        target_goal: Optional[str] = None,
    ) -> LearningPathResponse:
        """
        Executes the learning path workflow synchronously for a given learner.
        """
        input_data = {
            "learner_id": learner_id,
            "target_goal": target_goal,
        }
        workflow_run = self._workflow.run(input=input_data)
        
        # Extract the final StepOutput content (LearningPathResponse)
        if isinstance(workflow_run.content, LearningPathResponse):
            return workflow_run.content
        elif isinstance(workflow_run.content, dict) and "learning_path" in workflow_run.content:
            return workflow_run.content["learning_path"]
        
        # Fallback to checking step results
        for step_res in reversed(workflow_run.step_results or []):
            if isinstance(step_res.content, LearningPathResponse):
                return step_res.content
            if isinstance(step_res.content, dict) and "learning_path" in step_res.content:
                return step_res.content["learning_path"]

        raise RuntimeError(f"LearningPathWorkflow failed to produce a valid LearningPathResponse: {workflow_run.content}")

    def _step_fetch_context(self, step_input: StepInput) -> StepOutput:
        """Step 1: Retrieve real learner profile from PostgreSQL repository."""
        data = step_input.input if isinstance(step_input.input, dict) else {}
        learner_id = data.get("learner_id")
        target_goal = data.get("target_goal")

        if not learner_id or not str(learner_id).strip():
            raise ValueError("learner_id must be provided to LearningPathWorkflow.")

        # Real PostgreSQL retrieval (raises LearnerNotFoundError if missing)
        profile: LearnerProfile = get_learner_context(str(learner_id).strip())

        return StepOutput(
            content={
                "profile": profile,
                "target_goal": target_goal or profile.target_goal,
            }
        )

    def _step_analyze_skills(self, step_input: StepInput) -> StepOutput:
        """Step 2: Run LearnerSkillAnalysisAgent on PostgreSQL learner context."""
        context_data = step_input.get_step_content("FetchLearnerContext")
        profile: LearnerProfile = context_data["profile"]
        target_goal: str = context_data["target_goal"]

        skill_analysis: SkillAnalysis = self.skill_agent.analyze_learner(
            learner_id=profile.learner_id,
            target_goal=target_goal,
        )

        return StepOutput(
            content={
                "profile": profile,
                "skill_analysis": skill_analysis,
                "target_goal": target_goal,
            }
        )

    def _step_generate_path(self, step_input: StepInput) -> StepOutput:
        """Step 3: Run LearningPathRecommendationAgent to build roadmap."""
        analysis_data = step_input.get_step_content("AnalyzeSkillGaps")
        profile: LearnerProfile = analysis_data["profile"]
        skill_analysis: SkillAnalysis = analysis_data["skill_analysis"]

        learning_path: LearningPathResponse = self.path_agent.recommend_learning_path(
            profile=profile,
            skill_analysis=skill_analysis,
            roadmap_adapter=self.roadmap_adapter,
        )

        return StepOutput(
            content={
                "profile": profile,
                "skill_analysis": skill_analysis,
                "learning_path": learning_path,
            }
        )

    def _step_persist_path(self, step_input: StepInput) -> StepOutput:
        """Step 4: Persist curriculum summary into memory_chunks."""
        path_data = step_input.get_step_content("GenerateLearningPath")
        profile: LearnerProfile = path_data["profile"]
        learning_path: LearningPathResponse = path_data["learning_path"]

        try:
            save_memory(
                external_id=profile.learner_id,
                content=f"Generated Learning Path for '{learning_path.target_goal}': {learning_path.title}. {learning_path.summary}",
                metadata={
                    "path_id": learning_path.path_id,
                    "target_role": learning_path.target_role,
                    "total_weeks": learning_path.estimated_total_weeks,
                    "total_hours": learning_path.estimated_total_hours,
                },
            )
        except Exception:
            # Memory persistence is non-blocking to the return of the roadmap
            pass

        return StepOutput(content=learning_path)


def create_learning_path_workflow(
    skill_agent: Optional[LearnerSkillAnalysisAgent] = None,
    path_agent: Optional[LearningPathRecommendationAgent] = None,
    roadmap_adapter: Optional[RoadmapAdapter] = None,
) -> LearningPathWorkflow:
    """Factory helper to instantiate LearningPathWorkflow."""
    return LearningPathWorkflow(
        skill_agent=skill_agent,
        path_agent=path_agent,
        roadmap_adapter=roadmap_adapter,
    )

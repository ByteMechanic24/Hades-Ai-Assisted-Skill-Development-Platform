from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field


class SkillItem(BaseModel):
    """Represents a specific skill and competency level of a learner."""
    skill_name: str = Field(..., description="Name of the skill or technology.")
    level: Literal["beginner", "intermediate", "advanced"] = Field(
        ..., description="Proficiency level."
    )
    years_of_experience: Optional[float] = Field(
        default=None, ge=0.0, description="Years of practical experience with the skill."
    )


class LearnerProfile(BaseModel):
    """Complete profile of a learner used in the learning path generation workflow."""
    learner_id: str = Field(..., description="Unique learner identifier.")
    target_goal: str = Field(..., description="Target career or skill goal.")
    career_aspirations: List[str] = Field(
        default_factory=list, description="Target job roles or career milestones."
    )
    current_skills: List[SkillItem] = Field(
        default_factory=list, description="Current skills and proficiencies."
    )
    interests: List[str] = Field(
        default_factory=list, description="Technical and domain interests."
    )
    available_hours_per_week: float = Field(
        ..., gt=0, description="Available study time per week in hours."
    )
    learning_preferences: List[str] = Field(
        default_factory=list, description="Preferred learning modalities."
    )
    experience_level: Literal["beginner", "intermediate", "advanced"] = Field(
        ..., description="Overall software/domain engineering level."
    )


class GoalRequirements(BaseModel):
    """Structured requirements for a target learning/career goal."""
    goal: str = Field(..., description="Canonical or requested goal name.")
    required_skills: List[str] = Field(
        ..., description="Core skills and competencies required to achieve the goal."
    )
    recommended_experience_level: str = Field(
        ..., description="Recommended baseline experience level."
    )
    domain: str = Field(..., description="Domain or discipline category.")


class SkillPrerequisites(BaseModel):
    """Prerequisite mapping for a given skill."""
    skill_name: str = Field(..., description="Name of the queried skill.")
    prerequisites: List[str] = Field(
        default_factory=list, description="List of foundational skills required before this skill."
    )
    category: str = Field(..., description="Category or paradigm of the skill.")


class SkillGapResult(BaseModel):
    """Deterministic outcome of comparing current skills against goal requirements."""
    covered_skills: List[str] = Field(
        default_factory=list, description="Required skills already mastered at or above target level."
    )
    missing_skills: List[str] = Field(
        default_factory=list, description="Required skills completely absent from current profile."
    )
    insufficient_skills: List[str] = Field(
        default_factory=list, description="Required skills present but below required proficiency level."
    )


class GoalSkillReasoning(BaseModel):
    """Structured LLM output for dynamic goal skill determination and prerequisite reasoning."""
    required_skills: List[str] = Field(
        description="Comprehensive list of knowledge domains, skills, and topics required to achieve the goal."
    )
    prerequisite_sequence: List[str] = Field(
        default_factory=list,
        description="Logical ordered learning sequence (from foundational topics to advanced competencies)."
    )
    reasoning_summary: str = Field(
        description="Analytical rationale explaining why these skills and sequences are required for the goal."
    )


class SkillAnalysis(BaseModel):
    """
    Structured analytical output produced by the Learner / Skill Analysis Agent (Step 3A).
    Represents the agent-determined skill requirements, already learned skills,
    skills to learn, and recommended logical learning sequence for any learner goal.
    """
    learner_id: str = Field(..., description="Unique learner identifier.")
    target_goal: str = Field(..., description="Target career or skill goal.")
    current_skills: List[SkillItem] = Field(
        default_factory=list, description="Learner's current declared/recorded skills."
    )
    required_skills: List[str] = Field(
        default_factory=list, description="Agent-determined required skills/competencies for the goal."
    )
    already_learned: List[str] = Field(
        default_factory=list, description="Skills the learner has already learned/recorded."
    )
    skills_to_learn: List[str] = Field(
        default_factory=list, description="Skills remaining to be learned to achieve the goal."
    )
    prerequisite_sequence: List[str] = Field(
        default_factory=list, description="Recommended logical prerequisite/learning sequence."
    )
    analysis_summary: str = Field(
        ..., description="Analytical synthesis explaining the skill requirements and sequence."
    )

    # Backward-compatibility aliases for downstream consumers
    covered_skills: List[str] = Field(
        default_factory=list, description="Backward-compatible alias for already_learned."
    )
    missing_skills: List[str] = Field(
        default_factory=list, description="Backward-compatible alias for skills_to_learn."
    )
    insufficient_skills: List[str] = Field(
        default_factory=list, description="Retained for backward compatibility."
    )
    prerequisite_gaps: List[str] = Field(
        default_factory=list, description="Backward-compatible alias for prerequisite_sequence."
    )



# --- Step 3B: Roadmap & Learning Path Response Models ---


class RoadmapNode(BaseModel):
    """Represents a node, topic, or phase in a raw or normalized roadmap."""
    id: str = Field(..., description="Unique node identifier.")
    title: str = Field(..., description="Title of the topic/node.")
    description: Optional[str] = Field(default=None, description="Topic overview or syllabus details.")
    children: List["RoadmapNode"] = Field(default_factory=list, description="Subtopics or child modules.")
    order: int = Field(default=1, description="Sequential order in the curriculum.")
    estimated_hours: Optional[float] = Field(default=None, ge=0.0, description="Estimated effort in hours.")


class Roadmap(BaseModel):
    """Internal structured representation of a roadmap.sh roadmap."""
    source: str = Field(default="roadmap.sh", description="Source repository or platform.")
    source_identifier: str = Field(..., description="Canonical slug or URL (e.g., 'backend', 'data-engineer').")
    title: str = Field(..., description="Title of the roadmap.")
    description: Optional[str] = Field(default=None, description="Roadmap description.")
    nodes: List[RoadmapNode] = Field(default_factory=list, description="Ordered topic nodes.")


class RoadmapSearchResult(BaseModel):
    """Result of searching the roadmap catalog for a given goal."""
    roadmap_id: str = Field(..., description="Canonical roadmap identifier/slug.")
    title: str = Field(..., description="Human-readable title.")
    match_score: float = Field(..., ge=0.0, le=1.0, description="Confidence/match score (0.0 to 1.0).")
    source: str = Field(default="roadmap.sh", description="Source provider.")
    description: Optional[str] = Field(default=None, description="Roadmap description summary.")


class LearningPathModule(BaseModel):
    """Actionable study/practice unit inside a milestone."""
    module_id: str = Field(..., description="Unique module identifier.")
    title: str = Field(..., description="Module title.")
    description: str = Field(..., description="Detailed description of what is learned.")
    topics: List[str] = Field(..., description="List of granular concepts covered.")
    estimated_hours: float = Field(..., gt=0, description="Hours needed to complete the module.")
    learning_style: str = Field(..., description="Modality applied (e.g. 'hands-on', 'project-based').")
    key_deliverable: str = Field(..., description="Tangible project or artifact proving competency.")


class LearningPathMilestone(BaseModel):
    """Sequential milestone comprising the learning path."""
    milestone_id: str = Field(..., description="Unique milestone identifier (e.g. 'ms-1').")
    order: int = Field(..., ge=1, description="1-based sequential ordering index.")
    title: str = Field(..., description="Milestone headline.")
    objective: str = Field(..., description="Specific capability unlocked upon completing this milestone.")
    prerequisite_skills: List[str] = Field(
        default_factory=list, description="Skills or prior milestones required before starting."
    )
    modules: List[LearningPathModule] = Field(
        ..., min_length=1, description="List of learning modules in this milestone."
    )
    estimated_hours: float = Field(..., gt=0, description="Sum of module hours within this milestone.")


class LearningPathResponse(BaseModel):
    """
    Complete structured learning path response adhering strictly to the
    Step 1 Mock Contract specification.
    """
    path_id: str = Field(..., description="Unique identifier for the generated path.")
    learner_id: str = Field(..., description="Learner identifier matching the request.")
    target_goal: str = Field(..., description="Target goal as received in the request.")
    title: str = Field(..., description="Descriptive title for the curated path.")
    summary: str = Field(..., description="High-level summary of the journey.")
    target_role: str = Field(..., description="Synthesized target role or outcome.")
    estimated_total_weeks: int = Field(..., ge=1, description="Calculated total duration in weeks.")
    estimated_total_hours: float = Field(..., gt=0, description="Aggregated estimated effort in hours.")
    milestones: List[LearningPathMilestone] = Field(
        ..., min_length=1, description="Sequential milestones comprising the learning path."
    )
    skill_gap_analysis: List[str] = Field(
        ..., description="Identified skill deficiencies between learner's current profile and target goal."
    )
    adaptation_rationale: str = Field(
        ..., description="Explanation of how current skills, time constraints, and preferences shaped this path."
    )


# --- Step 5A.1: Persistent Memory Models ---


class MemoryChunk(BaseModel):
    """Represents a persisted learner memory record in PostgreSQL + pgvector."""
    id: str = Field(..., description="Unique memory identifier (UUID).")
    learner_id: str = Field(..., description="External learner identifier.")
    content: str = Field(..., description="Text content of the memory.")
    metadata: dict = Field(default_factory=dict, description="Structured extensible metadata.")
    created_at: Optional[str] = Field(default=None, description="Creation timestamp (ISO string).")
    updated_at: Optional[str] = Field(default=None, description="Last update timestamp (ISO string).")


# --- Step 3C: Topic-Level Resource Discovery Models ---

ResourceType = Literal[
    "video",
    "documentation",
    "article",
    "tutorial",
    "course",
    "book",
    "practice",
    "project",
]

ResourceDifficulty = Literal["beginner", "intermediate", "advanced"]


class SearchQueryPlan(BaseModel):
    """Structured search strategy generated by the live LLM."""

    youtube_query: str = Field(
        ...,
        description="High-precision search query for finding educational YouTube resources."
    )

    general_query: str = Field(
        ...,
        description="High-precision search query for finding authoritative web resources."
    )

    required_concepts: List[str] = Field(
        default_factory=list,
        description="Core concepts that must be represented in discovered resources."
    )

    excluded_concepts: List[str] = Field(
        default_factory=list,
        description="Irrelevant concepts that should be excluded from search where possible."
    )

    preferred_domains: List[str] = Field(
        default_factory=list,
        description="Optional domains appropriate for authoritative resources."
    )

    excluded_domains: List[str] = Field(
        default_factory=list,
        description="Domains that should be excluded when clearly irrelevant."
    )

    search_intent: str = Field(
        ...,
        description="Concise description of the educational search intent."
    )


class LearningResource(BaseModel):
    """Represents a validated learning resource for a specific topic."""
    resource_id: str = Field(..., description="Unique identifier for the resource.")
    title: str = Field(..., description="Resource title.")
    url: str = Field(..., description="Canonical URL to access the resource.")
    resource_type: ResourceType = Field(..., description="Format category of the resource.")
    source: str = Field(..., description="Source platform or domain (e.g., YouTube, Official Docs).")
    description: Optional[str] = Field(default=None, description="Overview or snippet from the resource.")
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Calculated relevance score [0.0, 1.0].")
    difficulty: Optional[ResourceDifficulty] = Field(default=None, description="Target proficiency level.")
    estimated_time: Optional[str] = Field(default=None, description="Estimated time to complete/watch (e.g. '15 mins').")
    why_recommended: List[str] = Field(default_factory=list, description="Justifications for recommendation.")


class TopicResourceDiscoveryRequest(BaseModel):
    """Input contract for topic-level on-demand resource discovery."""
    learner_id: str = Field(..., description="Unique learner identifier.")
    topic_id: str = Field(..., description="Target roadmap topic identifier.")
    topic_title: str = Field(..., description="Title of the topic opened by the learner.")
    topic_description: Optional[str] = Field(default=None, description="Description or context for the topic.")
    target_goal: str = Field(..., description="Target career or skill goal.")
    experience_level: Optional[str] = Field(default="intermediate", description="Learner experience level.")
    current_skills: List[SkillItem] = Field(default_factory=list, description="Learner's existing competencies.")
    learning_preferences: List[str] = Field(default_factory=list, description="Learning style preferences (e.g., hands-on, video).")
    milestone_title: Optional[str] = Field(default=None, description="Contextual milestone title.")
    milestone_objective: Optional[str] = Field(default=None, description="Contextual milestone objective.")
    key_deliverable: Optional[str] = Field(default=None, description="Expected deliverable or project artifact.")
    max_youtube_resources: int = Field(default=5, ge=1, le=10, description="Maximum YouTube videos to return.")
    max_general_resources: int = Field(default=5, ge=1, le=10, description="Maximum general resources to return.")
    include_general_resources: bool = True


class TopicResourceDiscoveryResponse(BaseModel):
    """Response contract containing curated, ranked resources for a single roadmap topic."""
    learner_id: str = Field(..., description="Unique learner identifier.")
    topic_id: str = Field(..., description="Target roadmap topic identifier.")
    topic_title: str = Field(..., description="Title of the topic.")
    youtube_resources: List[LearningResource] = Field(
        default_factory=list, description="Ranked YouTube tutorial and video resources."
    )
    general_resources: List[LearningResource] = Field(
        default_factory=list, description="Ranked documentation, articles, and guide resources."
    )
    summary: str = Field(..., description="Executive summary explaining the resource selection.")


# ============================================================================
# 8. ROADMAP CHUNK & ORCHESTRATION CONTRACTS
# ============================================================================

class RoadmapChunk(BaseModel):
    """
    Incremental slice of a learning path (CDN-like generation).
    Allows learners to start immediately without waiting for entire multi-month curricula.
    """
    chunk_id: str = Field(..., description="Unique identifier for this roadmap chunk.")
    roadmap_id: str = Field(..., description="Parent roadmap identifier.")
    sequence_number: int = Field(default=1, ge=1, description="1-based chunk sequence index.")
    title: str = Field(..., description="Title of this roadmap chunk/stage.")
    milestones: List[LearningPathMilestone] = Field(
        default_factory=list, description="Milestones contained in this chunk."
    )
    topics: List[str] = Field(
        default_factory=list, description="Flat list of ordered topic titles in this chunk."
    )
    has_more: bool = Field(default=False, description="Whether additional chunks exist downstream.")
    next_generation_hint: Optional[str] = Field(
        default=None, description="Guidance or milestone title for generating the next chunk."
    )


OrchestrationStatus = Literal[
    "INITIALIZING",
    "ANALYZING_SKILLS",
    "GENERATING_ROADMAP",
    "PREPARING_RESOURCES",
    "READY",
    "PAUSED",
    "COMPLETED",
    "FAILED",
]

OrchestratorActionType = Literal[
    "ANALYZE_SKILLS",
    "GENERATE_ROADMAP_CHUNK",
    "PREPARE_TOPIC_RESOURCES",
    "PREFETCH_NEXT_TOPIC",
    "RETURN_CURRENT_STATE",
    "WAIT_FOR_LEARNER",
    "REPLAN",
    "COMPLETE",
    "ERROR_RECOVERY",
]


class OrchestratorDecision(BaseModel):
    """
    Autonomous next-step decision formulated by the Orchestrator LLM Agent.
    Contains operational rationale without exposing internal chain-of-thought.
    """
    action: OrchestratorActionType = Field(
        ..., description="The next autonomous operational action to execute."
    )
    target_topic: Optional[str] = Field(
        default=None, description="Target topic name if action involves resource discovery/prefetch."
    )
    rationale: str = Field(
        ..., description="Concise, factual operational justification for the chosen action."
    )
    should_continue: bool = Field(
        default=False, description="Whether the orchestration cycle should continue immediately."
    )
    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Contextual parameters for the action."
    )


class OrchestrationState(BaseModel):
    """
    Durable execution state representing the learner's journey and orchestration history.
    """
    session_id: str = Field(..., description="Unique orchestration session identifier.")
    learner_id: str = Field(..., description="Unique learner identifier.")
    target_goal: Optional[str] = Field(default=None, description="Learner target career/learning goal.")
    current_topic_id: Optional[str] = Field(default=None, description="Active topic ID.")
    current_topic_index: int = Field(default=0, ge=0, description="0-based index of current topic.")
    roadmap_id: Optional[str] = Field(default=None, description="Active roadmap identifier.")
    generated_chunks: List[RoadmapChunk] = Field(
        default_factory=list, description="All persisted roadmap chunks generated so far."
    )
    available_topics: List[str] = Field(
        default_factory=list, description="All topics available across generated chunks."
    )
    completed_topics: List[str] = Field(
        default_factory=list, description="Topics completed by the learner."
    )
    active_topic: Optional[str] = Field(
        default=None, description="Topic currently being studied by the learner."
    )
    upcoming_topics: List[str] = Field(
        default_factory=list, description="Next topics in the prerequisite-ready queue."
    )
    prefetch_target_topic: Optional[str] = Field(
        default=None,
        description=(
            "The next roadmap topic whose resources are eligible for proactive "
            "preparation. Derived by the runtime from roadmap order and resource state."
        ),
    )
    skill_analysis: Optional[SkillAnalysis] = Field(
        default=None, description="Cached skill analysis if performed."
    )
    discovered_resources: Dict[str, TopicResourceDiscoveryResponse] = Field(
        default_factory=dict, description="Curated resources indexed by normalized topic title."
    )
    prefetched_topics: List[str] = Field(
        default_factory=list, description="Topics whose resources have been proactively prefetched."
    )
    previous_actions: List[str] = Field(
        default_factory=list, description="Audit log of actions executed in this session."
    )
    status: OrchestrationStatus = Field(
        default="INITIALIZING", description="Current lifecycle status of the session."
    )
    error_history: List[str] = Field(
        default_factory=list, description="Log of recoverable errors encountered."
    )


class OrchestrationRequest(BaseModel):
    """
    External invocation contract (e.g. from Scala backend event or frontend trigger).
    """
    learner_id: str = Field(..., description="Target learner identifier.")
    event: Optional[str] = Field(
        default="SESSION_START", description="Triggering event (e.g., SESSION_START, TOPIC_OPEN, TOPIC_COMPLETE, NEXT_CHUNK)."
    )
    current_topic_id: Optional[str] = Field(
        default=None, description="Current or newly selected topic identifier."
    )
    target_goal: Optional[str] = Field(
        default=None, description="Optional override for target goal."
    )
    context: Dict[str, Any] = Field(
        default_factory=dict, description="Additional external runtime context."
    )


class OrchestrationResponse(BaseModel):
    """
    Standardized, clean structured response returned to the Scala backend.
    """
    session_id: str = Field(..., description="Orchestration session identifier.")
    learner_id: str = Field(..., description="Learner identifier.")
    status: OrchestrationStatus = Field(..., description="Current orchestration status.")
    active_topic: Optional[str] = Field(default=None, description="Currently active topic.")
    current_chunk: Optional[RoadmapChunk] = Field(
        default=None, description="The active or latest roadmap chunk."
    )
    available_topics: List[str] = Field(
        default_factory=list, description="All topics currently available to the learner."
    )
    active_resources: Optional[TopicResourceDiscoveryResponse] = Field(
        default=None, description="Resources prepared for the active topic."
    )
    prefetched_topics: List[str] = Field(
        default_factory=list, description="Topics with proactively prefetched resources."
    )
    can_continue: bool = Field(
        default=True, description="Whether the learner has active content and can proceed."
    )
    more_roadmap_needed: bool = Field(
        default=False, description="Whether upcoming progression requires generating another chunk."
    )
    next_recommended_action: OrchestratorActionType = Field(
        ..., description="Action recommendation or state status."
    )
    rationale: str = Field(
        ..., description="Concise operational explanation of the orchestration decision."
    )

class AssistantChatRequest(BaseModel):
    """Request to ask the HADES learner assistant a question."""

    learner_id: str = Field(
        ...,
        description="External learner identifier.",
    )
    message: str = Field(
        ...,
        min_length=1,
        description="Learner's conversational question or message.",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Optional learning/orchestration session identifier.",
    )


class AssistantChatResponse(BaseModel):
    """Response generated by the HADES learner assistant."""

    learner_id: str = Field(
        ...,
        description="External learner identifier.",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Learning/orchestration session identifier when supplied.",
    )
    message: str = Field(
        ...,
        description="Assistant's contextual response.",
    )


# Topic-Level Resource Discovery Agent Documentation (Step 3C)

## 1. Overview & Architecture

The `ResourceDiscoveryAgent` provides on-demand, topic-level educational resource discovery for the HADES AI Personalized Learning Platform.

Unlike batch course recommenders that search upfront for entire multi-week roadmaps, the Resource Discovery Agent operates **lazily on a single active topic** when a learner navigates to or opens that topic in their learning journey.

```
Learner Opens Active Topic
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│              TopicResourceDiscoveryRequest              │
│  (topic_id, topic_title, target_goal, preferences, etc) │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 ResourceDiscoveryAgent                  │
│       ├── QueryBuilder (YouTube & General queries)      │
│       ├── TavilySearchClient / ResourceSearchProvider    │
│       │     ├── YouTube Discovery (domain: youtube.com) │
│       │     └── General Discovery (docs, guides, blogs) │
│       ├── normalize_and_rank_resources()                │
│       │     ├── URL Integrity & YouTube verification    │
│       │     ├── Deduplication & Normalization           │
│       │     └── Multi-criteria deterministic ranking    │
│       └── Summary Synthesis Narrative                   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│             TopicResourceDiscoveryResponse              │
│  - youtube_resources: List[LearningResource]            │
│  - general_resources: List[LearningResource]            │
│  - summary: str                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Request & Response Contracts

### Request Contract (`TopicResourceDiscoveryRequest`)
```python
class TopicResourceDiscoveryRequest(BaseModel):
    learner_id: str
    topic_id: str
    topic_title: str
    topic_description: Optional[str] = None
    target_goal: str
    experience_level: Optional[str] = "intermediate"
    current_skills: List[SkillItem] = Field(default_factory=list)
    learning_preferences: List[str] = Field(default_factory=list)
    milestone_title: Optional[str] = None
    milestone_objective: Optional[str] = None
    key_deliverable: Optional[str] = None
    max_youtube_resources: int = Field(default=3, ge=1, le=10)
    max_general_resources: int = Field(default=3, ge=1, le=10)
    include_general_resources: bool = True
```

### Response Contract (`TopicResourceDiscoveryResponse`)
```python
class TopicResourceDiscoveryResponse(BaseModel):
    learner_id: str
    topic_id: str
    topic_title: str
    youtube_resources: List[LearningResource]
    general_resources: List[LearningResource]
    summary: str
```

### Resource Model (`LearningResource`)
```python
class LearningResource(BaseModel):
    resource_id: str
    title: str
    url: str
    resource_type: Literal["video", "documentation", "article", "tutorial", "course", "book", "practice", "project"]
    source: str
    description: Optional[str] = None
    relevance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    difficulty: Optional[Literal["beginner", "intermediate", "advanced"]] = None
    estimated_time: Optional[str] = None
    why_recommended: List[str] = Field(default_factory=list)
```

---

## 3. Search Streams & Provider Abstraction

The search layer is isolated behind the `ResourceSearchProvider` interface:

1. **YouTube Discovery (Primary / Mandatory):**
   * Employs Tavily with explicit domain restriction (`include_domains: ["youtube.com"]`).
   * Validates that returned URLs strictly match legitimate YouTube patterns (`youtube.com/watch`, `youtu.be/`, `youtube.com/playlist`).
   * Rejects any non-YouTube URLs.

2. **General Resource Discovery (Secondary / Optional):**
   * Searches for authoritative technical documentation, guides, books, and articles.
   * **Fault-tolerant:** If general discovery fails due to provider timeout or rate limits, the agent logs a warning and returns valid YouTube results without breaking the user experience.

3. **Offline / Test Isolation (`FakeTavilySearchClient`):**
   * Deterministic zero-network provider containing curated technical resources across Scala, Akka, Kafka, FastAPI, Git, and Distributed Systems.

---

## 4. Query Personalization & Deterministic Ranking

### 4.1 Query Personalization
`QueryBuilder` generates concise, high-precision search queries combining:
* Topic title and active concepts.
* Relevant learner skills and domain context.
* Experience level (e.g. beginner, intermediate, advanced).
* Learning preferences (e.g. "hands-on tutorial", "video").

### 4.2 Deterministic Ranking Formula
```
Relevance Score = 
    (topic_overlap * 0.40)
  + (skill_and_goal_match * 0.25)
  + (learning_preference_fit * 0.15)
  + (provider_quality_score * 0.20)
```
* **Score Clamping:** All scores are strictly clamped to `[0.0, 1.0]`.
* **Deduplication:** Resources are deduplicated by canonical URL and title.
* **URL Integrity:** All URLs originate directly from verified search provider results; no URLs are invented or hallucinated.

---

## 5. Scope & Future Boundaries

| Component | Status | Description |
|---|---|---|
| Topic-Level Discovery Agent | **IMPLEMENTED** | On-demand discovery for single active topics |
| YouTube-Specific Search Stream | **IMPLEMENTED** | Tavily with `include_domains: ["youtube.com"]` and URL verification |
| General Documentation Stream | **IMPLEMENTED** | Authoritative technical guides and articles |
| Deterministic Query Builder | **IMPLEMENTED** | Context-aware concise query generation |
| Fake Provider & Unit Tests | **IMPLEMENTED** | Zero-network deterministic test fixtures |
| Real PostgreSQL Context Integration | **IMPLEMENTED** | Optional hydration via `get_learner_context` |
| Full Roadmap Iteration | **EXCLUDED** | Lazy single-topic discovery on user action |
| Assessment Agent (Step 3D) | **PLANNED** | Next agent development milestone |
| Adaptation Agent (Step 3E) | **PLANNED** | Path adaptation based on assessment feedback |
| Orchestrator Integration | **PLANNED** | End-to-end multi-agent orchestration |

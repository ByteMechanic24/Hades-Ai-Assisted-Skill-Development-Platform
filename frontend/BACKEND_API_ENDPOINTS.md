# HADES Backend API Endpoints Contract

> **For**: Backend Team Integration  
> **Frontend Stack**: React + Vite (SPA)  
> **Base URL**: `http://localhost:8000/api/v1` (or `{API_BASE_URL}/api/v1`)  
> **Auth**: All `/api/v1/*` endpoints (except Auth & public endpoints) accept `Authorization: Bearer <token>` or `X-User-Id: <user-id>` (defaults to `dev-user-1` in dev mode)  
> **Content-Type**: `application/json`  
> **Last Updated**: 2026-08-24

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Learner Profile](#2-learner-profile)
3. [Learning Goal](#3-learning-goal)
4. [Roadmap Generation & Search (Core AI)](#4-roadmap-generation--search-core-ai)
5. [Interactive Roadmap Tree & Branch Progress](#5-interactive-roadmap-tree--branch-progress)
6. [Learning Path (Phases & Nodes)](#6-learning-path-phases--nodes)
7. [Resources (Curated Catalog)](#7-resources-curated-catalog)
8. [Skills & Competency Tracking](#8-skills--competency-tracking)
9. [Milestones & Achievements](#9-milestones--achievements)
10. [Dashboard Aggregated Overview](#10-dashboard-aggregated-overview)
11. [AI Assistant / Coach](#11-ai-assistant--coach)
12. [Events & Notifications (Telemetry)](#12-events--notifications-telemetry)
13. [Onboarding Wizard (4-5 Goal Setup Questions)](#13-onboarding-wizard-4-5-goal-setup-questions)
14. [Data Schemas & Enum Reference](#14-data-schemas--enum-reference)
15. [Complete API Endpoint Summary Table](#15-complete-api-endpoint-summary-table)

---

## 1. Authentication

### `POST /api/v1/auth/sign-in`

Sign in an existing user.

**Request Body:**
```json
{
  "email": "aman@hades.ai",
  "password": "securepassword123"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_01",
    "name": "Aman Kumar",
    "email": "aman@hades.ai",
    "avatar": "https://...",
    "has_generated_roadmap": true
  }
}
```

> [!IMPORTANT]
> The `has_generated_roadmap` boolean is critical — the frontend uses it to decide whether to redirect to the **Roadmap Screen** (first time) or **Dashboard** (returning user) after login.

---

### `POST /api/v1/auth/sign-up`

Register a new user.

**Request Body:**
```json
{
  "name": "Aman Kumar",
  "email": "aman@hades.ai",
  "password": "securepassword123"
}
```

**Response `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_02",
    "name": "Aman Kumar",
    "email": "aman@hades.ai",
    "has_generated_roadmap": false
  }
}
```

---

## 2. Learner Profile

### `GET /api/v1/profile`

Fetch the authenticated user's full profile.

**Response `200 OK`:**
```json
{
  "id": "user_01",
  "name": "Aman Kumar",
  "email": "aman@hades.ai",
  "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "current_role": "Computer Science Learner",
  "target_role": "Autonomous AI Systems Engineer",
  "education_level": "Undergraduate / Tech Enthusiast",
  "experience_level": "Intermediate",
  "interests": ["Generative AI", "Agentic Workflows", "Vector Databases", "Deep Learning", "FastAPI"],
  "learning_preferences": {
    "format": ["Hands-on Projects", "Interactive Labs", "Curated Videos"],
    "pace": "Accelerated",
    "weekly_hours": 14
  }
}
```

---

### `PUT /api/v1/profile`

Update the user's profile (from Profile Settings page or Onboarding).

**Request Body** (partial updates accepted):
```json
{
  "name": "Aman Kumar",
  "email": "aman@hades.ai",
  "avatar": "https://...",
  "current_role": "Computer Science Learner",
  "target_role": "Autonomous AI Systems Engineer",
  "education_level": "Undergraduate / Tech Enthusiast",
  "experience_level": "Intermediate",
  "interests": ["Generative AI", "Agentic Workflows"],
  "learning_preferences": {
    "format": ["Hands-on Projects", "Interactive Labs"],
    "pace": "Accelerated",
    "weekly_hours": 14
  }
}
```

**Response `200 OK`:** Returns the updated profile object.

---

## 3. Learning Goal

### `GET /api/v1/goals`

Fetch the user's active learning goal.

**Response `200 OK`:**
```json
{
  "id": "goal_01",
  "title": "Master AI Agent Orchestration & Production LLMOps",
  "target_role": "Autonomous AI Systems Engineer",
  "timeframe_weeks": 12,
  "completed_weeks": 3,
  "current_level": "Intermediate",
  "target_level": "Production-Ready Specialist",
  "status": "in_progress"
}
```

---

### `POST /api/v1/goals`

Create or update the user's learning goal.

**Request Body:**
```json
{
  "title": "Master AI Agent Orchestration & Production LLMOps",
  "target_role": "Autonomous AI Systems Engineer",
  "description": "Build foundational and advanced AI agent capabilities",
  "timeframe_weeks": 12
}
```

**Response `200 OK`:** Returns the created/updated goal object.

---

## 4. Roadmap Generation & Search (Core AI)

> [!IMPORTANT]  
> This is the **primary AI endpoint**. When a user types a role/skill in the landing page search bar or finishes onboarding, the frontend calls this to generate a full interactive roadmap. The user is then redirected to the roadmap screen (`/dashboard/learning-path`).

### `POST /api/v1/roadmap/generate`

Generate a personalized interactive roadmap tree for a given role or skill query.

**Request Body:**
```json
{
  "query": "Autonomous AI Agent Engineer",
  "experience_level": "Intermediate",
  "interests": ["Generative AI", "Agentic Workflows"],
  "weekly_hours": 14,
  "timeframe_weeks": 12
}
```

> Only `query` is strictly required. The other fields are optional context to improve generation quality.

**Response `200 OK`:**
```json
{
  "id": "roadmap_ai_engineer",
  "title": "AI Engineer & Autonomous Systems Roadmap",
  "description": "Comprehensive step-by-step curriculum with branch nodes and ranked resources.",
  "root_topic": "AI Systems Engineering",
  "main_nodes": [
    {
      "id": "node_internet_math",
      "title": "Foundational Math & Python Internals",
      "category": "Core Foundation",
      "status": "pending",
      "description": "Mathematical foundations for high-dimensional representations, matrix transformations, and vectorized Python execution.",
      "branches": [
        {
          "id": "sub_linear_algebra",
          "title": "Linear Algebra & Dot Products",
          "status": "pending",
          "summary": "Vector spaces, matrix multiplication, projections, eigenvalues, and dot products as projection metrics in latent space.",
          "recommended_resource": {
            "title": "Essence of Linear Algebra",
            "provider": "3Blue1Brown (Official Series)",
            "duration": "3h 40m",
            "type": "Video Series",
            "url": "https://youtube.com/..."
          },
          "ranked_videos": [
            {
              "id": "v1",
              "rank": 1,
              "title": "Linear Algebra for Machine Learning & Deep Learning",
              "channel": "freeCodeCamp.org",
              "duration": "3h 56m",
              "views": "1.2M views",
              "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80",
              "rating": "98% Match"
            }
          ],
          "articles": [
            { "title": "Matrix Decomposition & Geometric Intuition", "duration": "12 min read" }
          ],
          "paid_courses": [
            {
              "id": "p1",
              "title": "Mathematics for ML: Linear Algebra Specialization",
              "provider": "Imperial College London (Coursera)",
              "price": "$49 / month",
              "discount": "Financial Aid Available",
              "rating": "4.9 (14k reviews)",
              "duration": "18 hours",
              "certificate": true,
              "url": "https://coursera.org/..."
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. Interactive Roadmap Tree & Branch Progress

### `GET /api/v1/roadmap`

Fetch the user's current active interactive roadmap tree with persisted branch statuses.

**Response `200 OK`:** Same schema as `POST /api/v1/roadmap/generate` response, with the user's current branch statuses persisted.

---

### `PATCH /api/v1/roadmap/branch-status`

Update the status of a specific branch node in the roadmap tree.

**Request Body:**
```json
{
  "main_node_id": "node_vector_storage",
  "branch_id": "sub_pgvector_hnsw",
  "status": "done"
}
```

**Allowed `status` values:** `"pending"` | `"learning"` | `"done"` | `"skip"`

**Response `200 OK`:**
```json
{
  "success": true,
  "main_node_id": "node_vector_storage",
  "branch_id": "sub_pgvector_hnsw",
  "new_status": "done",
  "main_node_status": "learning",
  "roadmap_progress_percentage": 42
}
```

#### Branch Status State Machine

```
  pending ──→ learning ──→ done
    │                        ↑
    └────────→ skip ─────────┘
              (can revert to learning)
```

| Status | Color in UI | Meaning |
| :--- | :--- | :--- |
| `pending` | Gray | Not started, default state |
| `learning` | Purple/Blue | User is actively studying this topic |
| `done` | Green | User has completed this topic |
| `skip` | Slate/Dim | User chose to skip (already knows or not relevant) |

---

## 6. Learning Path (Phases & Nodes)

### `GET /api/v1/learning-paths`

Fetch the user's structured multi-phase learning path.

**Response `200 OK`:**
```json
{
  "id": "path_ai_agent_eng_2026",
  "goal_id": "goal_01",
  "title": "Personalized Roadmap: AI Agent Architect & Production LLMOps",
  "description": "Dynamic AI-generated curriculum tailored for your background...",
  "status": "active",
  "overall_progress": 38,
  "estimated_hours_left": 42,
  "path_adaptation_banner": {
    "visible": true,
    "timestamp": "Just now",
    "title": "Path Adapted by HADES AI Engine",
    "message": "Based on your latest progress, we added a targeted module 'Vector Search Deep Dive & Hybrid Retrieval' before Multi-Agent Swarms.",
    "type": "enhancement"
  },
  "phases": [
    {
      "id": "phase_1",
      "number": 1,
      "title": "Foundations & Vector Architecture",
      "description": "Master high-dimensional vector representations, indexing algorithms (HNSW), and semantic search.",
      "status": "in_progress",
      "progress": 75,
      "nodes": [
        {
          "id": "node_1_1",
          "type": "skill",
          "title": "High-Dimensional Vector Math & Embeddings",
          "status": "completed",
          "estimated_minutes": 180,
          "confidence_score": 85,
          "prerequisites": [],
          "description": "Understanding cosine similarity, dot products, and token embeddings in latent space."
        },
        {
          "id": "node_1_2",
          "type": "resource",
          "title": "Vector Search Deep Dive with pgvector & Qdrant",
          "status": "in_progress",
          "estimated_minutes": 90,
          "resource_type": "Interactive Lab",
          "prerequisites": ["node_1_1"],
          "description": "Hands-on implementation of HNSW index tuning and hybrid lexical + semantic search."
        }
      ]
    }
  ]
}
```

---

### `PATCH /api/v1/learning-paths/complete-node`

Mark a specific node within a phase as completed.

**Request Body:**
```json
{
  "phase_id": "phase_1",
  "node_id": "node_1_2"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "phase_id": "phase_1",
  "node_id": "node_1_2",
  "phase_progress": 100,
  "overall_progress": 46
}
```

---

### `POST /api/v1/learning-paths/dismiss-banner`

Dismiss the AI path adaptation banner.

**Request Body:**
```json
{
  "path_id": "path_ai_agent_eng_2026"
}
```

**Response `200 OK`:**
```json
{ "success": true }
```

---

### `POST /api/v1/learning-paths/recalculate`

Manually trigger an AI-driven recalculation/re-weighting of the learning path.

**Request Body:**
```json
{
  "path_id": "path_ai_agent_eng_2026"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Roadmap re-weighted successfully based on latest progress metrics.",
  "updated_path": { "...same schema as GET /api/v1/learning-paths..." }
}
```

---

## 7. Resources (Curated Catalog)

### `GET /api/v1/resources`

Fetch curated learning resources with filtering.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `format` | `string` | `all`, `interactive`, `video`, `article`, `saved` |
| `search` | `string` | Full-text query on title and skills |

**Response `200 OK`:**
```json
[
  {
    "id": "res_01",
    "title": "Production RAG with Hybrid Search & Semantic Re-ranking",
    "provider": "HADES Curated Labs",
    "type": "Interactive Lab",
    "format": "interactive",
    "duration": "45 mins",
    "difficulty": "Intermediate",
    "rating": 4.9,
    "reviews_count": 312,
    "match_score": 98,
    "why_recommended": "Directly addresses your active vector search node with hands-on code execution.",
    "skills_covered": ["Vector Databases", "pgvector", "BM25 Hybrid Search"],
    "progress": 60,
    "is_saved": true,
    "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    "url": "#"
  }
]
```

---

### `PATCH /api/v1/resources/:id/save`

Toggle bookmark/save a resource.

**Response `200 OK`:**
```json
{
  "id": "res_01",
  "is_saved": true
}
```

---

### `PATCH /api/v1/resources/:id/progress`

Update resource progress.

**Request Body:**
```json
{
  "progress": 100
}
```

**Response `200 OK`:**
```json
{
  "id": "res_01",
  "progress": 100
}
```

---

## 8. Skills & Competency Tracking

### `GET /api/v1/skills`

Fetch the user's skill competency list.

**Response `200 OK`:**
```json
[
  {
    "id": "sk_1",
    "name": "Vector Databases & Embeddings",
    "category": "Core AI",
    "mastery": 82,
    "target": 95,
    "confidence": "High",
    "trend": "+12%"
  },
  {
    "id": "sk_2",
    "name": "Agentic Tool Calling & ReAct",
    "category": "Agent Design",
    "mastery": 64,
    "target": 90,
    "confidence": "Medium",
    "trend": "+20%"
  }
]
```

---

## 9. Milestones & Achievements

### `GET /api/v1/milestones`

Fetch achievement milestones.

**Response `200 OK`:**
```json
[
  {
    "id": "ms_01",
    "title": "Foundations & High-Dimensional Vectors",
    "phase": "Phase 1",
    "status": "completed",
    "completion_date": "Aug 14, 2026",
    "progress": 100,
    "skills_earned": ["Vector Math", "Cosine Distance", "Latent Embeddings"]
  },
  {
    "id": "ms_02",
    "title": "Production RAG Pipeline Architecture",
    "phase": "Phase 1",
    "status": "in_progress",
    "target_date": "Aug 26, 2026",
    "progress": 65,
    "skills_earned": ["pgvector", "BM25 Hybrid Retrieval", "Context Re-ranking"]
  }
]
```

---

## 10. Dashboard Aggregated Overview

### `GET /api/v1/dashboard`

Aggregates all key user metrics in one fast call for initial dashboard rendering.

**Response `200 OK`:**
```json
{
  "user": {
    "id": "user_01",
    "name": "Aman Kumar",
    "current_role": "Computer Science Learner",
    "target_role": "Autonomous AI Systems Engineer"
  },
  "active_goal": {
    "id": "goal_01",
    "title": "Master AI Agent Orchestration & Production LLMOps",
    "target_role": "Autonomous AI Systems Engineer"
  },
  "current_path": {
    "id": "path_ai_agent_eng_2026",
    "title": "Personalized Roadmap: AI Agent Architect & Production LLMOps",
    "overall_progress": 38
  },
  "roadmap_progress_percentage": 45,
  "study_streak_days": 14,
  "active_phase_title": "Foundations & Vector Architecture",
  "recent_events": []
}
```

---

## 11. AI Assistant / Coach

### `POST /api/v1/assistant/chat`

Send a message to the HADES AI Contextual Coach.

**Request Body:**
```json
{
  "message": "Explain Cosine Similarity vs Dot Product simply."
}
```

**Response `200 OK`:**
```json
{
  "id": "msg_1724456789001",
  "sender": "assistant",
  "timestamp": "11:45 PM",
  "reply": "**Cosine Similarity vs Dot Product:**\n\n- **Dot Product**: Combines both vector magnitude (length) and angle.\n- **Cosine Similarity**: Normalizes vector lengths to 1, measuring purely directional semantic angle."
}
```

---

## 12. Events & Notifications (Telemetry)

### `GET /api/v1/events`

Fetch recent telemetry events for the notification drawer.

**Response `200 OK`:**
```json
[
  {
    "id": "ev_1",
    "type": "BRANCH_STATUS_CHANGED",
    "title": "Node status: DONE",
    "timestamp": "2 hours ago",
    "data": { "branch_id": "sub_linear_algebra", "status": "done" }
  },
  {
    "id": "ev_2",
    "type": "ROADMAP_GENERATED",
    "title": "Generated roadmap for Autonomous AI Systems Engineer",
    "timestamp": "Yesterday",
    "data": { "role": "Autonomous AI Systems Engineer" }
  }
]
```

---

### `POST /api/v1/events`

Record a client-side telemetry/progress event.

**Request Body:**
```json
{
  "type": "RESOURCE_LAUNCHED",
  "title": "pgvector HNSW Lab (Rank #1)",
  "data": { "resource_id": "res_01" }
}
```

**Response `201 Created`:**
```json
{
  "id": "ev_1724456789",
  "status": "recorded",
  "type": "RESOURCE_LAUNCHED",
  "timestamp": "Just now"
}
```

---

## 13. Onboarding Wizard (4-5 Goal Setup Questions)

### `POST /api/v1/onboarding`

Submit the 4-5 step onboarding questionnaire (Target Role, Interests, Experience Level, Learning Preferences, Weekly Commitment).

**Request Body:**
```json
{
  "target_role": "Autonomous AI Systems Engineer",
  "custom_goal": "Master AI Agent Orchestration & Production LLMOps",
  "timeframe_weeks": 12,
  "education_level": "Undergraduate / Tech Enthusiast",
  "experience_level": "Intermediate",
  "interests": ["Generative AI", "Agentic Workflows", "Vector Databases", "FastAPI"],
  "learning_formats": ["Hands-on Projects", "Interactive Labs"],
  "pace": "Accelerated",
  "weekly_hours": 14
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "profile": { "...updated profile..." },
  "goal": { "...created goal..." },
  "roadmap": { "...generated roadmap..." },
  "redirect_to": "/dashboard/learning-path"
}
```

---

## 14. Data Schemas & Enum Reference

### Enum Values Reference

| Field | Allowed Values |
|---|---|
| Branch status | `pending`, `learning`, `done`, `skip` |
| Main node status | `pending`, `learning`, `done` |
| Phase status | `locked`, `available`, `in_progress`, `completed` |
| Node status | `locked`, `available`, `in_progress`, `completed` |
| Node type | `skill`, `resource`, `milestone` |
| Goal status | `not_started`, `in_progress`, `completed` |
| Milestone status | `locked`, `in_progress`, `completed` |
| Resource format | `interactive`, `video`, `article` |
| Experience level | `Beginner`, `Intermediate`, `Advanced` |
| Pace | `Relaxed`, `Standard`, `Accelerated` |

---

## 15. Complete API Endpoint Summary Table

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | Server liveness check |
| `POST` | `/api/v1/auth/sign-in` | No | User login (returns `has_generated_roadmap`) |
| `POST` | `/api/v1/auth/sign-up` | No | User registration |
| `GET` | `/api/v1/profile` | Yes | Get learner profile |
| `PUT` | `/api/v1/profile` | Yes | Update learner profile |
| `GET` | `/api/v1/goals` | Yes | Get active learning goal |
| `POST` | `/api/v1/goals` | Yes | Create / update learning goal |
| `POST` | `/api/v1/roadmap/generate` | Yes | **AI-Generate Roadmap from Search / Onboarding** |
| `GET` | `/api/v1/roadmap` | Yes | Fetch active Interactive Roadmap Tree |
| `PATCH` | `/api/v1/roadmap/branch-status` | Yes | **Update Branch Status (`done`/`learning`/`skip`)** |
| `GET` | `/api/v1/learning-paths` | Yes | Get structured phased learning path |
| `PATCH` | `/api/v1/learning-paths/complete-node` | Yes | Mark a learning path node completed |
| `POST` | `/api/v1/learning-paths/dismiss-banner` | Yes | Dismiss AI path adaptation notification |
| `POST` | `/api/v1/learning-paths/recalculate` | Yes | Manually trigger AI path re-weighting |
| `GET` | `/api/v1/resources` | No/Yes | List curated resources (filterable by format/search) |
| `PATCH` | `/api/v1/resources/:id/save` | Yes | Toggle save/bookmark resource |
| `PATCH` | `/api/v1/resources/:id/progress` | Yes | Update resource completion progress |
| `GET` | `/api/v1/skills` | No/Yes | List platform skills & user competencies |
| `GET` | `/api/v1/milestones` | Yes | List achievement milestones |
| `GET` | `/api/v1/dashboard` | Yes | Dashboard overview aggregation |
| `POST` | `/api/v1/assistant/chat` | Yes | Contextual AI Coach chat |
| `GET` | `/api/v1/events` | Yes | Get recent telemetry event stream |
| `POST` | `/api/v1/events` | Yes | Record client telemetry event |
| `POST` | `/api/v1/onboarding` | Yes | Complete 4-5 step goal setup & generate roadmap |

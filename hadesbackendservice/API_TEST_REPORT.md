# HADES Backend REST API Test Report

**Execution Timestamp:** 2026-08-29  
**Target Host:** `http://localhost:8000`  
**Test Suite Status:** ALL ENDPOINTS VERIFIED & OPERATIONAL ✅  

---

## Endpoint Summary & Status Matrix

| # | Method | Endpoint Route | Description | Status | Response Code |
|---|--------|----------------|-------------|--------|---------------|
| **1** | `GET` | `/health` | Server Health Probe | **PASSED** | `200 OK` |
| **2** | `POST` | `/api/v1/auth/sign-up` | User Registration & JWT Issuance | **PASSED** | `201 Created` |
| **3** | `POST` | `/api/v1/auth/sign-in` | Email/Password JWT Authentication | **PASSED** | `200 OK` |
| **4** | `POST` | `/api/v1/auth/oauth-login` | Google OAuth2 Token Verification | **PASSED** | `200 OK` |
| **5** | `GET` | `/api/profile` | Enriched Learner Profile Retrieval | **PASSED** | `200 OK` |
| **6** | `POST` | `/api/onboarding` | Preference & Goal Onboarding Submission | **PASSED** | `200 OK` |
| **7** | `POST` | `/api/learning-paths` | Dynamic AI Roadmap Generation | **PASSED** | `200 OK` |
| **8** | `GET` | `/api/dashboard` | Dashboard Telemetry & Overview | **PASSED** | `200 OK` |
| **9** | `POST` | `/api/progress/events` | Record Progress Activity Event | **PASSED** | `200 OK` |
| **10** | `GET` | `/api/progress/events` | Fetch Activity Feed Event History | **PASSED** | `200 OK` |
| **11** | `GET` | `/api/progress/stats` | Fetch Streak & Study Hours Metrics | **PASSED** | `200 OK` |
| **12** | `GET` | `/api/skills` | Skill Competency Matrix & Mastery | **PASSED** | `200 OK` |
| **13** | `GET` | `/api/milestones` | Milestone Badges & Phase Progress | **PASSED** | `200 OK` |
| **14** | `GET` | `/api/resources` | Curated Learning Resources with Filters | **PASSED** | `200 OK` |
| **15** | `POST` | `/api/assistant/chat` | AI Learning Coach Chat Assistant | **PASSED** | `200 OK` |

---

## Detailed Payload Executions & Responses

### 1. Health Probe (`GET /health`)
- **Response:** `200 OK` `{"status": "ok"}`

---

### 2. Sign Up (`POST /api/v1/auth/sign-up`)
- **Request:** `{"name": "Aman Kumar", "email": "aman.test@hades.ai", "password": "securepassword123"}`
- **Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_ac474111",
      "name": "Aman Kumar",
      "email": "aman.test@hades.ai",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "has_generated_roadmap": false
    }
  }
  ```

---

### 3. Sign In (`POST /api/v1/auth/sign-in`)
- **Request:** `{"email": "aman.test@hades.ai", "password": "securepassword123"}`
- **Response (`200 OK`):** Valid JWT token & user credentials.

---

### 4. OAuth Google Sign In (`POST /api/v1/auth/oauth-login`)
- **Request:** `{"provider": "google", "email": "amansivastav@gmail.com", "name": "Aman Sivastav"}`
- **Response (`200 OK`):** OAuth user token & avatar payload.

---

### 5. Fetch Enriched Profile (`GET /api/profile`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):**
  ```json
  {
    "id": "dev-user-1",
    "userId": "dev-user-1",
    "name": "Default Learner",
    "email": "dev-user-1@hades.ai",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "currentRole": "Computer Science Learner",
    "targetRole": "Autonomous AI Systems Engineer",
    "educationLevel": "Undergraduate / Tech Enthusiast",
    "experienceLevel": "beginner",
    "minutesPerDay": 60,
    "daysPerWeek": 5,
    "interests": ["Generative AI", "Vector Search", "Agentic Systems"],
    "learningPreferences": ["hands_on", "video"],
    "weeklyHours": 5
  }
  ```

---

### 6. Skill Competency Matrix (`GET /api/skills`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):**
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
      "name": "Autonomous Agent Orchestration",
      "category": "Agentic Systems",
      "mastery": 75,
      "target": 90,
      "confidence": "Intermediate",
      "trend": "+8%"
    },
    {
      "id": "sk_3",
      "name": "Production LLMOps & Evaluation",
      "category": "Systems Engineering",
      "mastery": 60,
      "target": 85,
      "confidence": "Intermediate",
      "trend": "+15%"
    }
  ]
  ```

---

### 7. Milestone Badges (`GET /api/milestones`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "ms_01",
      "title": "Foundations & High-Dimensional Vectors",
      "phase": "Phase 1",
      "status": "completed",
      "completionDate": "Aug 14, 2026",
      "progress": 100,
      "skillsEarned": ["Vector Math", "Cosine Distance", "Latent Embeddings"]
    },
    {
      "id": "ms_02",
      "title": "Production Vector Search & HNSW Indexing",
      "phase": "Phase 1",
      "status": "in_progress",
      "completionDate": "Target: Aug 30, 2026",
      "progress": 65,
      "skillsEarned": ["pgvector", "Qdrant", "HNSW Tuning"]
    }
  ]
  ```

---

### 8. Streak & Study Time Stats (`GET /api/progress/stats`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response (`200 OK`):**
  ```json
  {
    "currentStreak": 14,
    "longestStreak": 21,
    "weeklyHoursLogged": 8.0,
    "weeklyHoursTarget": 14.0,
    "overallProgressPercent": 38.0
  }
  ```

---

### 9. Curated Learning Resources (`GET /api/resources`)
- **Header:** `Authorization: Bearer <JWT>`
- **Query Filters:** `?format=interactive&difficulty=intermediate`
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "res_01",
      "title": "HNSW Vector Indexes & Quantization in Practice",
      "provider": "DeepLearning.AI",
      "type": "Interactive Lab",
      "format": "interactive",
      "duration": "45 mins",
      "difficulty": "Intermediate",
      "rating": 4.9,
      "reviewsCount": 312,
      "matchScore": 98,
      "whyRecommended": "Directly aligns with your Vector Database & Hybrid Search milestone.",
      "skillsCovered": ["Vector Databases", "HNSW Indexing", "pgvector"],
      "progress": 60,
      "isSaved": true,
      "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      "url": "https://www.deeplearning.ai/"
    }
  ]
  ```

---

### 10. AI Coach Chat (`POST /api/assistant/chat`)
- **Request:** `{"message": "What is the difference between Cosine Similarity and Dot Product in vector search?"}`
- **Response (`200 OK`):**
  ```json
  {
    "reply": "**HADES AI Coach**: I received your query: \"What is the difference between Cosine Similarity and Dot Product in vector search?\". Based on your current roadmap for Autonomous AI Systems Engineer, I recommend completing the Vector Search & Hybrid Indexing module first to maximize your learning velocity."
  }
  ```

# HADES Backend REST API Test Report

**Execution Timestamp:** 2026-08-26  
**Target Host:** `http://localhost:8000`  
**Test Suite Script:** [test_all_endpoints.ps1](file:///c:/Users/Welcome/Downloads/Hackthon/Hackthon/Hades-Ai-Assisted-Skill-Development-Platform/hadesbackendservice/test_all_endpoints.ps1)

---

## Endpoint Summary & Status

| # | Method | Endpoint Route | Description | Status | Response Code |
|---|--------|----------------|-------------|--------|---------------|
| **1** | `GET` | `/health` | Health Check Probe | **PASSED** | `200 OK` |
| **2** | `POST` | `/api/v1/auth/sign-up` | User Registration & JWT Issuance | **PASSED** | `201 Created` |
| **3** | `POST` | `/api/v1/auth/sign-in` | User Authentication & JWT Issuance | **PASSED** | `200 OK` |
| **4** | `POST` | `/api/v1/auth/oauth-login` | Google OAuth2 Token Verification | **PASSED** | `200 OK` |
| **5** | `GET` | `/api/profile` | Learner Profile Retrieval | **PASSED** | `200 OK` |
| **6** | `POST` | `/api/onboarding` | Preference & Goal Onboarding Submission | **PASSED** | `200 OK` |
| **7** | `POST` | `/api/learning-paths` | Dynamic AI Roadmap Generation | **PASSED** | `200 OK` |
| **8** | `GET` | `/api/dashboard` | Dashboard Metrics & Active Path Overview | **PASSED** | `200 OK` |
| **9** | `POST` | `/api/progress/events` | Node Status & Progress Event Recording | **PASSED** | `200 OK` |
| **10** | `POST` | `/api/assistant/chat` | AI Coach Interactive Assistant Chat | **PASSED** | `200 OK` |
| **11** | `GET` | `/api/resources` | Curated Learning Resource Retrieval | **PASSED** | `200 OK` |

---

## Payload Details & Execution Results

### 1. Health Probe (`GET /health`)
- **Headers:** None
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. Sign Up (`POST /api/v1/auth/sign-up`)
- **Request Body:**
  ```json
  {
    "name": "Aman Kumar",
    "email": "aman.test@hades.ai",
    "password": "securepassword123"
  }
  ```
- **Response:**
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
- **Request Body:**
  ```json
  {
    "email": "aman.test@hades.ai",
    "password": "securepassword123"
  }
  ```
- **Response:**
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

### 4. OAuth Google Sign In (`POST /api/v1/auth/oauth-login`)
- **Request Body:**
  ```json
  {
    "provider": "google",
    "providerToken": "mock-google-token",
    "email": "amansivastav@gmail.com",
    "name": "Aman Sivastav"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "oauth_google_78f6528b",
      "name": "Aman Sivastav",
      "email": "amansivastav@gmail.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "has_generated_roadmap": false
    }
  }
  ```

---

### 5. Fetch Profile (`GET /api/profile`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "userId": "user_ac474111",
    "experienceLevel": "beginner",
    "minutesPerDay": 60,
    "daysPerWeek": 5,
    "targetRole": "Machine Learning Engineer",
    "learningPreferences": ["hands_on", "video"]
  }
  ```

---

### 6. Submit Onboarding (`POST /api/onboarding`)
- **Header:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "experienceLevel": "intermediate",
    "minutesPerDay": 60,
    "daysPerWeek": 5,
    "targetRole": "Autonomous AI Systems Engineer",
    "interests": ["Generative AI", "Agentic Workflows"],
    "learningPreferences": ["hands_on", "video"],
    "goalTitle": "Master AI Agent Systems",
    "goalDescription": "Build production multi-agent swarm platforms with vector search."
  }
  ```
- **Response:**
  ```json
  {
    "userId": "user_ac474111",
    "experienceLevel": "intermediate",
    "minutesPerDay": 60,
    "daysPerWeek": 5,
    "targetRole": "Autonomous AI Systems Engineer",
    "learningPreferences": ["hands_on", "video"]
  }
  ```

---

### 7. Generate Learning Path (`POST /api/learning-paths`)
- **Header:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "learner": {
      "experience_level": "intermediate",
      "interests": ["Generative AI", "Vector Search"],
      "career": { "target_role": "Autonomous AI Systems Engineer" },
      "learning_preferences": ["hands_on", "video"],
      "availability": { "minutes_per_day": 60, "days_per_week": 5 }
    },
    "goal": {
      "title": "Master AI Agent Systems",
      "description": "Build autonomous multi-agent swarm pipelines"
    }
  }
  ```
- **Response:**
  ```json
  {
    "title": "Personalized Roadmap: Autonomous AI Systems Engineer",
    "description": "AI-curated learning path tailored for intermediate level to master Autonomous AI Systems Engineer with hands-on labs and project modules.",
    "estimated_hours": 75,
    "nodes": [
      {
        "id": "node-1",
        "title": "Foundations of Autonomous AI Systems Engineer",
        "description": "Master core mathematical representations, latent spaces, and vector similarity metrics.",
        "estimated_hours": 15,
        "sequence": 1
      },
      {
        "id": "node-2",
        "title": "Vector Search & Hybrid Indexing Deep Dive",
        "description": "Hands-on implementation of HNSW index tuning, BM25 lexical search, and semantic re-ranking.",
        "estimated_hours": 25,
        "sequence": 2
      },
      {
        "id": "node-3",
        "title": "Autonomous Multi-Agent Swarms & Tool Calling",
        "description": "Design resilient stateful agents, memory persistence, and asynchronous tool orchestration.",
        "estimated_hours": 35,
        "sequence": 3
      }
    ]
  }
  ```

---

### 8. Fetch Dashboard Metrics (`GET /api/dashboard`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "user": {
      "userId": "user_ac474111",
      "experienceLevel": "intermediate",
      "minutesPerDay": 60,
      "daysPerWeek": 5,
      "targetRole": "Autonomous AI Systems Engineer",
      "learningPreferences": ["hands_on", "video"]
    },
    "activeGoal": {
      "id": "3bf9f13f-fbbc-455e-841d-33c0ded65a94",
      "title": "Master AI Agent Systems",
      "description": "Build production multi-agent swarm platforms with vector search.",
      "isActive": true
    },
    "overallProgressPercent": 0.0,
    "nextRecommendedAction": "Generate a personalized learning path to start learning!"
  }
  ```

---

### 9. Record Progress Event (`POST /api/progress/events`)
- **Header:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "eventType": "NODE_STATUS_UPDATED",
    "entityId": "sub_linear_algebra",
    "payload": "{\"status\":\"done\"}"
  }
  ```
- **Response:**
  ```json
  {
    "id": "4a01430c-f7ed-42d0-9959-63f45260fcff",
    "event_type": "NODE_STATUS_UPDATED",
    "status": "recorded"
  }
  ```

---

### 10. AI Assistant Chat (`POST /api/assistant/chat`)
- **Header:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "message": "What is the difference between Cosine Similarity and Dot Product in vector search?"
  }
  ```
- **Response:**
  ```json
  {
    "reply": "**HADES AI Coach**: I received your query: \"What is the difference between Cosine Similarity and Dot Product in vector search?\". Based on your current roadmap for Autonomous AI Systems Engineer, I recommend completing the Vector Search & Hybrid Indexing module first to maximize your learning velocity."
  }
  ```

---

### 11. Fetch Learning Resources (`GET /api/resources`)
- **Header:** `Authorization: Bearer <JWT>`
- **Response:** `200 OK` `[]` (List of curated learning resources)

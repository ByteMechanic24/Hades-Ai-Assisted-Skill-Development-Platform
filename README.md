# ⚡ HADES — AI-Assisted Skill Development Platform
> **Enterprise-Grade Adaptive Competency Graph Engine & Autonomous Career Accelerator**  
> *Developed for the HCL AI / Full-Stack Hackathon*

---

## 🌟 Executive Summary

**HADES** (High-Fidelity Adaptive Deterministic Engine for Skills) transforms the traditional static learning paradigm into a **live, dynamic competency graph**. Instead of collecting disconnected courses, learners input their target role or custom engineering domain. HADES autonomously synthesizes an interactive Directed Acyclic Graph (DAG) of prerequisite skills, curated real-world tutorials, interactive milestones, and adaptive checkpoints tailored to their baseline experience and timeline.

---

## 🚀 1-Command Quickstart (Run Whole System with Docker)

You can launch the complete multi-tier platform (**Frontend, Scala Backend, AI Agent Service, and PostgreSQL with pgvector**) in a single terminal command:

```bash
docker compose up --build -d
```

### 🌐 Live Service Endpoints

| Component | Endpoint | Description |
| :--- | :--- | :--- |
| **🎨 Web Application UI** | [http://localhost:3000](http://localhost:3000) | Complete Interactive Web Experience |
| **⚡ Backend API & Health** | [http://localhost:8080/health](http://localhost:8080/health) | Scala Pekko-HTTP REST Gateway |
| **🤖 AI Service OpenAPI Docs**| [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI Multi-Agent Graph Engine |
| **🐘 PostgreSQL Database** | `localhost:15432` | PostgreSQL 16 + pgvector (`hcl` / `hcl_dev_password`) |

### 🛑 Stop All Services
```bash
docker compose down
```

---

## 🏗️ System Architecture & Layer Interconnection

The platform follows a resilient **Distributed Multi-Agent Architecture** composed of 4 core tiers:

```
                                 ┌────────────────────────────────────────┐
                                 │       React + Vite Frontend            │
                                 │     (Nginx Reverse Proxy :3000)        │
                                 └──────────────────┬─────────────────────┘
                                                    │  JSON / REST
                                                    ▼
                                 ┌────────────────────────────────────────┐
                                 │       Scala Pekko Backend Monolith     │
                                 │             (Port :8080)               │
                                 │   - Flyway Migrations (V1 -> V13)      │
                                 │   - JWT Auth & Session Enforcement     │
                                 │   - Slick Async Relational Storage     │
                                 └──────────┬───────────────────┬─────────┘
                                            │                   │
                  Internal HTTP RPC Requests│                   │ Direct JDBC
                                            ▼                   ▼
     ┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
     │      Python AI Agent Engine            │       │      PostgreSQL 16 + pgvector          │
     │            (Port :8000)                │──────▶│             (Port :5432)               │
     │   - Mistral AI Graph Reasoning Agent   │ Async │   - Prerequisite Nodes & Edges (DAG)   │
     │   - Tavily Real-World Search Engine    │ SQL   │   - Curated YouTube Video Resources    │
     │   - Vector Embeddings RAG Pipeline     │       │   - Telemetry Events & Skill Mastery   │
     └────────────────────────────────────────┘       └────────────────────────────────────────┘
```

---

## 🧩 Deep Dive into Services

### 1. 🎨 Frontend (`/frontend`)
- **Stack**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, HTML5 Canvas.
- **Role**:
  - **Dynamic Interactive Graph Canvas**: Renders scalable Directed Acyclic Graphs (DAGs) representing prerequisite milestones and competency stages.
  - **Career Domain Roadmaps Library**: Allows learners to generate multiple career domain paths (e.g. *Cybersecurity, Agentic AI, Cloud DevOps, Full-Stack*) and switch between them with **1-click state restoration**.
  - **Integrated Resource Center**: Direct video player tabs and documentation readers for real-world tutorials.
  - **Session Security**: JWT-persisted authentication with local storage session management.

### 2. ⚡ Backend Service (`/hadesbackendservice`)
- **Stack**: Scala 2.13, Apache Pekko HTTP, Slick (Async Functional Relational Mapping), Flyway DB Migrations, Java JWT.
- **Role**:
  - **API Gateway & Core Business Logic**: Serves authenticated REST endpoints for learning paths, milestones, telemetry logging, and user profiles.
  - **Strict Security Enforcement**: Validates credentials against PostgreSQL, preventing unauthorized logins and maintaining token persistence.
  - **Database Migrations (`V1` to `V13`)**: Automatically provisions and manages relational schemas, indexes, and resource serialization.
  - **Cross-Service Orchestration**: Dispatches asynchronous requests to the Python AI service and persists the generated graph structures.

### 3. 🤖 AI Multi-Agent Service (`/ai-service`)
- **Stack**: Python 3.11, FastAPI, Uvicorn, Mistral AI LLM, Tavily Search API, Pydantic v2.
- **Role**:
  - **Autonomous Graph Synthesis**: Generates a structured multi-stage curriculum tailored to the user's specific target weeks, starting level, and preferred learning modalities.
  - **Real-World Resource Discovery**: Queries live engineering databases and video catalogs to attach real YouTube tutorial URLs and documentation links to each roadmap node.
  - **Adaptive Coaching & Diagnostic Feedback**: Provides contextual chat assistance, skill quizzes, and gap analysis.

### 4. 🐘 Database (`/database`)
- **Stack**: PostgreSQL 16 with `pgvector` extension.
- **Role**:
  - Persists user accounts, learning path graphs (`learning_paths`, `learning_path_nodes`, `learning_path_edges`), resource JSON arrays, completed checkpoints, and telemetry logs.

---

## 🏆 Key Features & Innovation Highlights

1. **Deterministic Prerequisite DAG Generation**: Eliminates hallucinations by compiling dynamic skill graphs using structured JSON contracts.
2. **Multi-Domain Roadmap Library**: Generate and retain multiple distinct specializations (e.g. *Cybersecurity Specialist*, *Agentic AI Engineer*) with zero loss of progress or graph integrity.
3. **Persisted Real-World Video & Doc Resources**: Every topic node includes vetted YouTube videos and official docs stored directly in PostgreSQL (`V13`).
4. **Autonomous Skill Verification & Telemetry**: Checkpoints adapt in real-time based on learner quiz submissions and task evaluations.
5. **Production-Ready Dockerization**: Multi-stage Docker builds with Nginx reverse proxying, JVM tuning, and instant hot-reload dev mode.

---

## 🧑‍⚖️ Hackathon Judge Walkthrough Guide

To evaluate the platform in 3 minutes:

1. **Start System**: Run `docker compose up --build -d` and open [http://localhost:3000](http://localhost:3000).
2. **Sign Up**: Click **"Build Path"**, enter your name, email, and password to register.
3. **Customize Onboarding**:
   - Step 1: Select a specialization or type custom topic (e.g., `Cybersecurity`). Enter your desired duration in weeks (e.g., `8`).
   - Steps 2–4: Pick focus technologies, baseline level, and weekly study cadence.
   - Step 5: Click **"Synthesize Adaptive Path"**.
4. **Explore Interactive DAG**:
   - Click any node in the graph to inspect prerequisites, completion status, and direct YouTube video tutorials.
5. **Switch Domains**:
   - Open **"My Domains"** in the top navigation to add another domain (e.g. `Agentic AI`) and switch between them with 1 click.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
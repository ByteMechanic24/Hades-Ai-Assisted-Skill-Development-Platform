# 🐳 HADES — 1-Command Full-Stack Docker Deployment

Run the complete HADES AI-Assisted Skill Development Platform with a single command.

---

## 🏗️ Architecture Topology

| Service | Container Name | Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `hades-frontend` | `3000` | React + Tailwind + Nginx SPA |
| **Backend** | `hades-backend-service` | `8080` | Scala / Pekko Modular Monolith & Flyway |
| **AI Service** | `hades-ai-service` | `8000` | Python FastAPI Multi-Agent Graph Engine |
| **Database** | `hades-postgres` | `5432` | PostgreSQL 16 + pgvector |

---

## 🚀 Run the Whole System in One Command

In the root directory of the project, execute:

```bash
docker compose up --build -d
```

### What Happens Automatically:
1. **PostgreSQL** starts up with the `hcl_learning` database and `pgvector` extensions enabled.
2. **AI Service** launches FastAPI with all prerequisite graph synthesis agents.
3. **Scala Backend** compiles and starts up, automatically applying all Flyway database migrations (`V1` to `V13`).
4. **Frontend** builds the React production bundle and serves it via high-performance Nginx on port `3000`.

---

## 🌐 Accessing the Platform

Once the containers are up:

- **Web Application UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Health**: [http://localhost:8080/health](http://localhost:8080/health)
- **AI Service OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (User: `hcl`, Pass: `hcl_dev_password`, DB: `hcl_learning`)

---

## 🛠️ Handy Operations

### View live logs of all services:
```bash
docker compose logs -f
```

### View logs of a specific service:
```bash
docker compose logs -f hades-backend
docker compose logs -f ai-service
docker compose logs -f frontend
```

### Stop the entire platform:
```bash
docker compose down
```

### Clean restart (rebuilding all images and fresh volume):
```bash
docker compose down -v
docker compose up --build -d
```

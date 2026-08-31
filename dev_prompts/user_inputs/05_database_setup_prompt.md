# Step 5: Database Setup & Verification Prompt

**Author:** User  
**Task:** Database Setup & Verification  
**Source Specification File:** `database/README.md`

---

```text
take this prompt as we have to proceed towards the next step in our project read and execute the steps as mentioned in the file and then save it in the dev propmts folder in user_inputs and then as instructed in the md file after generating report you have to save the report in ai responsesfolder
```

---

## Detailed Specification (from `database/README.md`)

# Architecture Overview  
The Hades platform uses a **PostgreSQL** database (with the [pgvector](https://github.com/pgvector/pgvector) extension) plus two main software components: a web **backend** and an **AI service**.  The database is the single source of truth, storing learners, skills, goals, learning paths, and related entities.  The backend application (e.g. a REST API) is responsible for creating and updating most of this data: learner profiles, skills, goals, paths, etc.  The AI service reads from the database (for example, fetching skill descriptions, modules and learner data) and may write back AI-related data (such as embeddings or recommended skills). In effect, the backend owns the core domain tables, while the AI service focuses on analytics and recommendations based on that data.  

This design is currently monolithic (one database) but uses Docker Compose to simplify local setup.  The `database/docker-compose.yml` file defines a single service (`postgres`) based on the official [pgvector Postgres image](https://hub.docker.com/r/pgvector/pgvector) (version 16).  By using Docker Compose, developers can start the entire database environment with one command (`docker compose up -d`), making setup quick and reproducible.  

# Docker Compose Setup  
The `database/docker-compose.yml` defines the PostgreSQL service.  Key points:  
- **Image:** We use `pgvector/pgvector:pg16`, which is Postgres 16 with the pgvector extension pre-installed.  
- **Environment:** It sets `POSTGRES_USER=hcl`, `POSTGRES_PASSWORD=hcl_dev_password`, and `POSTGRES_DB=hcl_learning`. This creates a superuser `hcl` and a default database `hcl_learning`.  
- **Ports:** It maps container port 5432 to the host, so the database is accessible locally.  
- **Volumes:** Two volumes are configured: a named volume (`postgres_data`) for Postgres data (persisting the database files) and a bind-mount of the local `database/init` folder into `/docker-entrypoint-initdb.d` inside the container (read-only).  For example:  
  ```yaml
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./init:/docker-entrypoint-initdb.d:ro
  ```  
  The first ensures data isn’t lost when the container stops. The second uses Postgres’s built-in init mechanism: **any `.sql` files placed in `/docker-entrypoint-initdb.d` are automatically executed in order when the container is first created**.  This lets us seed the schema and example data on the very first run.  

This setup means that a new developer only needs to run: 

```bash
cd Hades-Ai-Assisted-Skill-Development-Platform/database
docker compose up -d
```

This single command **starts Postgres and initializes it with our schema and seed data**. It avoids manual DB installs or migrations during initial setup. 

# PostgreSQL with pgvector  
We chose PostgreSQL to store both structured data (tables) and vector data (embeddings) in one place. The `pgvector` extension adds a **vector** column type and similarity search functions directly in Postgres. In effect, PG becomes a unified data store for AI features. As one resource explains, *“pgvector is an extension for PostgreSQL that enables efficient storage and similarity search of high-dimensional vector data commonly used for AI chatbots, … recommendation systems”*. This means we can store text or image embeddings (e.g. a skill description or a learner’s profile vector) alongside regular columns. Using pgvector in Postgres *“eliminates the complexity of using separate vector databases”* and leverages Postgres’s reliability and ACID guarantees. In practice, our schema may include vector columns on tables like `skills` or `modules` so that the AI service can store and index embeddings (for example, to find related skills quickly).  

# Schema (Tables and Relationships)  
The initial schema (in `migrations/V001__initial_schema.sql`) defines **13 tables** covering all key entities and their links. In summary, these include:  

- **`learners`**: Represents user profiles. Fields include a unique ID, name/info, and any profile settings. Each learner may have vectors (for skill proficiency or embedding) once AI integration is added.  
- **`skills`**: Catalog of skill items (e.g. “Python programming”, “Data Structures”). Each row has skill details (name, description, etc) and could include a `VECTOR` column for an embedding.  
- **`skill_prerequisites`**: A many-to-many link table that models skill hierarchies. Each record ties one `skill_id` to a `prerequisite_skill_id`, indicating the second skill must be learned first. This lets us chain skills and enforce learning order. (Both columns FK to `skills.id`.)  
- **`learner_skills`**: A join table recording which skills a learner currently has. Each row has `learner_id` and `skill_id`. This lets the system track a learner’s skill set.  
- **`goals`** / **`learner_goals`**: Represents learning or career goals (e.g. “Full-Stack Developer”). Each goal has an ID and description. Tracks which goal(s) each learner is pursuing.  
- **`goal_required_skills`**: A many-to-many linking table for goals→skills. Each row has a `goal_id` and a `skill_id`, meaning that skill is required to achieve the goal. This defines the skill checklist for each goal.  
- **`learning_paths`**: High-level learning plans or curricula. Each path has an ID and name.  
- **`milestones`**: Milestones are checkpoints or stages within a learning path.  
- **`milestone_prerequisite_skills`**: Join/dependency table for prerequisites required by milestones.  
- **`modules`**: The actual content units or courses. Each module has an ID, title, and content details.  

# Current Development Seed Data  
The development seed (`seed/V001__development_seed.sql`) populates the schema with example data to help developers and testers. In the current seed: 

- **1 learner** is created (`learner-1049`).  
- **16 skills** are inserted.  
- **14 skill prerequisites** are defined, linking several of the skills in prerequisite chains.  
- **1 goal** is created.  
- **8 required-skills** rows link that goal to 8 skills.  
- The single learner is assigned **3 skills** (via `learner_skills`) and **the 1 goal** (via `learner_goals`).  

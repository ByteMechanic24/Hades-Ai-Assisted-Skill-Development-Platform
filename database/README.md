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

```
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

- **`goals`**: Represents learning or career goals (e.g. “Full-Stack Developer”). Each goal has an ID and description. 

- **`goal_required_skills`**: A many-to-many linking table for goals→skills. Each row has a `goal_id` and a `skill_id`, meaning that skill is required to achieve the goal. This defines the skill checklist for each goal.  

- **`learner_goals`**: Tracks which goal(s) each learner is pursuing. It has `learner_id` and `goal_id`. (A learner might only have one active goal at a time, but the design allows multiple.)  

- **`learning_paths`**: High-level learning plans or curricula. Each path has an ID and name (e.g. “Intro to Machine Learning”). A learning path may be aligned with one or more goals (see `learning_path_goals` below).  

- **`learning_path_goals`**: Links learning paths to goals. Each row has `learning_path_id` and `goal_id`. This means “this path helps achieve this goal.” (If omitted, this table could be replaced by a goal ID column in `learning_paths`, but we kept it flexible.)  

- **`milestones`**: Milestones are checkpoints or stages within a learning path. Each milestone has an ID, a name/description, and a foreign key to `learning_paths` (if stored directly) or is linked via `learning_path_milestones` (next). It represents a unit like “Basics,” “Intermediate,” etc.  

- **`learning_path_milestones`**: A join table (if milestones are reusable) linking `learning_paths` to `milestone_id`. It may include an “order” or sequence number to sort the milestones. Each record assigns a milestone to a specific path, defining the path’s structure.  

- **`modules`**: The actual content units or courses. Each module has an ID, title, and content details. A module is typically part of one milestone. It too may have an embedding vector column.  

- **`milestone_modules`**: A join table linking milestones to modules. Each row has `milestone_id` and `module_id`, meaning that module is included in the milestone. It can also have an “order” field if the modules have to be taken sequentially within a milestone.  

These tables total 13 and cover the domain. The foreign-key relationships are as follows:  

- **Learner → Skills/Goals:** `learner_skills(learner_id→learners.id, skill_id→skills.id)`, and `learner_goals(learner_id→learners.id, goal_id→goals.id)`.  
- **Skills hierarchy:** `skill_prerequisites(skill_id→skills.id, prerequisite_skill_id→skills.id)`.  
- **Goal requirements:** `goal_required_skills(goal_id→goals.id, skill_id→skills.id)`.  
- **Learning paths:** `learning_path_goals(path_id→learning_paths.id, goal_id→goals.id)`, `learning_path_milestones(path_id→learning_paths.id, milestone_id→milestones.id)`, and `milestone_modules(milestone_id→milestones.id, module_id→modules.id)`. (Alternatively, if `milestones` has a direct `path_id` FK, then `learning_path_milestones` might be omitted. The key idea is: a path has many milestones; a milestone has many modules.)  

Each table has appropriate primary keys (typically an `id` column) and foreign keys enforcing these relationships. Indexes can be added on join tables for fast queries.  

# Current Development Seed Data  
The development seed (`seed/V001__development_seed.sql`) populates the schema with example data to help developers and testers. In the current seed: 

- **1 learner** is created (with some ID, e.g. 1).  
- **16 skills** are inserted (IDs 1–16). These represent sample competencies.  
- **14 skill prerequisites** are defined, linking several of the skills in prerequisite chains.  
- **1 goal** is created (e.g. ID 1).  
- **8 required-skills** rows link that goal to 8 of the skills (meaning the goal requires those skills).  
- The single learner is assigned **3 skills** (via `learner_skills`) and **the 1 goal** (via `learner_goals`).  

For example, after initialization you should see: learners=1, skills=16, skill_prerequisites=14, learner_skills=3, learner_goals=1, goal_required_skills=8. (These counts match our seed content.) The exact names/content aren’t critical; the important point is to have non-empty, consistent data for testing.  

# Data Relationships in Practice  
- **Learner Profile:** The `learners` table holds basic user information (e.g. name, contact info, etc.). It may also store vector embeddings for the learner’s profile or progress, allowing AI queries (using pgvector) to find similar learners or recommend skills. A learner’s skills and goals are then linked through the `learner_skills` and `learner_goals` tables.  

- **Goals → Required Skills → Prerequisites:** Each goal in `goals` is supported by certain skills: the `goal_required_skills` table lists every skill needed for that goal. Furthermore, each skill in `skills` can have prerequisites (other skills that must be learned first) stored in `skill_prerequisites`.  In effect, to achieve a goal a learner must master all required skills, and some of those skills themselves may have prerequisites. For example, if Goal A requires Skill X, and Skill X requires Skill Y, then the learner must take Y before X as part of pursuing Goal A.  

- **Learning Paths → Milestones → Modules:** A learning path is a structured curriculum (e.g. “Full-Stack Web Dev Path”). It is broken into milestones (e.g. “Basics”, “Advanced Topics”), each of which consists of modules (units like courses or tutorials). These hierarchies are modeled via the tables above (`learning_paths`, `learning_path_milestones` or `milestones`, and `milestone_modules`/`modules`).  Thus, a path is a sequence of milestone entries, and each milestone links to specific modules. This allows the platform to assemble and present a coherent learning journey.  

# Role of pgvector  
The `pgvector` extension lets us treat AI embeddings as native columns. For example, we might store a text embedding for each skill or module. Then, at query time, we can do vector similarity searches directly in SQL to recommend “nearest” skills or content. As one description notes, integrating pgvector with Postgres *“eliminates the complexity of using separate vector databases”*, keeping everything in one ACID-compliant system. In short, pgvector provides fast nearest-neighbor searches on any rows’ vector columns. We’ll use it to power AI-driven features (e.g. finding related skills, clustering modules, or matching learners to goals). 

# Migration and Change-Management Rules  
We use versioned SQL files to manage schema changes. The convention is Flyway-style: in `database/migrations/`, each script is named `VNNN__description.sql` (e.g. `V001__initial_schema.sql`). **Do not modify old files once committed.** To update the schema, add a new script with the next number (e.g. `V002__add_table_X.sql`). These scripts should contain only DDL or DML for schema changes. For example, to add a new table or column, create `V002__create_xxx.sql` and write the `CREATE TABLE` or `ALTER TABLE` statements there. Always include a descriptive name in the filename.  

Because our Docker init only runs scripts on a fresh database, when new migrations are added, an existing database won’t get them automatically. In development you can simply tear down and recreate the DB (with `docker compose down -v` to remove the volume, then `up -d`) so that all migrations (including new ones) apply. In production or persistent setups, you must apply new migrations manually. For instance, you could run: 
```
docker exec -it hcl-postgres psql -U hcl -d hcl_learning -f /docker-entrypoint-initdb.d/migrations/V002__new_changes.sql
```
or use a migration tool. The key is: **each change goes in a new versioned file.**  

# Development vs Production Considerations  
- **Development (local):** We use Docker Compose with the init scripts. The volume is named `postgres_data`. On the first `docker compose up`, the schema and seed load automatically. If you need a clean start, do `docker compose down -v` (this deletes the volume) and then `docker compose up -d` again. The development credentials (`hcl/hcl_dev_password`) are hard-coded, but you should override those via `.env` in a real environment. The current seed is meant only for testing; it should not be loaded in production.  

- **Production:** In production, run Postgres 16 (with pgvector) on a managed service or VM. Do not rely on Docker’s init mechanism. Instead, apply migrations as part of your deployment pipeline. For example, after deploying the database, run each `VNNN` script with psql. Also ensure **secrets** are managed securely (don’t commit `.env`). Install pgvector on your production DB (the same image or extension). Back up the database regularly. In prod, you generally skip the sample seed: real user data and real skills/goals will populate tables instead. The schema, however, should remain identical.  

# Developer Setup & Commands  
1. **Checkout** the repository and switch to the `database` branch where these files live.  

2. **Inspect files**:  
   - `database/docker-compose.yml` (Postgres service with pgvector)  
   - `database/migrations/V001__initial_schema.sql` (schema DDL)  
   - `database/seed/V001__development_seed.sql` (sample data DML)  
   - `database/init/` directory (copies of the above for Docker init).  

3. **Start the database:**  
   ```bash
   cd database
   docker compose up -d
   ```  
   This creates (or reuses) a Docker volume `database_postgres_data`, starts the Postgres container, and since the volume is new, runs the init scripts in order. You should see the `hcl-postgres` container start without errors.  

4. **Verify the migration/seed:** Connect via psql:  
   ```bash
   docker exec -it hcl-postgres psql -U hcl -d hcl_learning
   ```  
   Inside `psql`, you can run `\dt` to list tables (you should see 13 tables). To check data counts, run for example:  
   ```sql
   SELECT 'learners' AS table_name, COUNT(*) FROM learners
   UNION ALL
   SELECT 'skills', COUNT(*) FROM skills
   UNION ALL
   SELECT 'skill_prerequisites', COUNT(*) FROM skill_prerequisites
   UNION ALL
   SELECT 'learner_skills', COUNT(*) FROM learner_skills
   UNION ALL
   SELECT 'learner_goals', COUNT(*) FROM learner_goals
   UNION ALL
   SELECT 'goal_required_skills', COUNT(*) FROM goal_required_skills;
   ```  
   You should get:  
   ```
   table_name         | count
   -------------------+-------
   learners           |     1
   skills             |    16
   skill_prerequisites|    14
   learner_skills     |     3
   learner_goals      |     1
   goal_required_skills |   8
   (6 rows)
   ```  
   This matches the development seed’s data. You can also `SELECT COUNT(*)` on the other tables (e.g. `learning_paths`, `milestones`, etc.) if they have seed rows (they may be empty until you add paths).  

5. **Rebuilding from scratch:** If you need to start fresh (for example, after adding a new migration file), stop and remove the volume:  
   ```bash
   docker compose down -v
   docker compose up -d
   ```  
   This forces all `V001`, `V002`, ... scripts to run again.  

6. **Applying new migrations:** In dev, you can just rebuild as above. In a persistent DB, copy the new script into `/docker-entrypoint-initdb.d/` and run it with `psql`, or simply execute `psql -f migrations/VNNN*.sql` as shown earlier.  

7. **Other useful commands:**  
   - `docker compose logs postgres` – check logs for errors (e.g. migration failures).  
   - `docker compose ps` – see if the container is running.  
   - `\d+ <table>` in psql – describe table schema.  
   - `\q` to quit psql.  

# Migration Guidelines for the Future  
- Always create a new file in `database/migrations/` when changing the schema. Name it sequentially (V002, V003, etc) with a brief description. For example: `V002__add_learning_path_tables.sql`. Add only `CREATE`/`ALTER` statements there.  
- Do not edit or remove old migrations. Treat them as immutable historical records of changes.  
- If the change also needs example data (e.g. new reference data for dev), you can add insert statements to the same migration (it will only run once), or create a new seed file. But avoid adding production data in seed files.  
- After adding a migration, test by rebuilding the DB (as above). Also test on the current DB by running it manually. Check for errors and data integrity.  
- If you need to change a table in place (for production), use `ALTER TABLE` in a new migration rather than dropping it.  

# Verification and Troubleshooting  
- After setup, always verify by checking table counts or sample queries as above.  
- If the container fails to start, check if the volume is reused; remember that `/docker-entrypoint-initdb.d` scripts run *only once* when the data directory is empty. An existing volume will skip init. To re-run init, use `docker compose down -v`.  
- Ensure port 5432 is free on your machine (or change it in `docker-compose.yml` if needed).  
- To see the raw SQL, open the files in `database/migrations` or `database/init`. The Docker setup is simply mounting those in.  

# Summary  
In sum, we have packaged the database setup so that **one command** (`docker compose up -d`) yields a running PostgreSQL instance with pgvector, the full schema, and sample data. The 13 tables capture learners, skills, goals, and learning content, with appropriate foreign keys linking them. The backend service will manage (insert/update) most of these tables during normal operation, while the AI service will leverage the same tables for analysis, particularly using pgvector for similarity search. Future schema changes are managed via versioned SQL migrations. With this documentation, a developer should be able to get the database running and understand how to extend or use it without missing any steps. 

**Sources:** Technical details are based on the official PostgreSQL Docker image and best practices, and pgvector usage from the pgvector documentation. The rest is derived from our tested setup and schema.
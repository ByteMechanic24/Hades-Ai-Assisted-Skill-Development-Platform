# AI-Service Database Connection Documentation (Step 4A.1)

## 1. Overview
The Python AI Service uses a clean, production-grade PostgreSQL connection management layer built on **`psycopg` (v3)** and **`psycopg-pool`**. It provides thread-safe connection pooling, automatic resource lifecycle management, credential sanitization in logs/errors, and environment-driven configuration.

---

## 2. Configuration & Environment Variables

The database connection parameters are defined in `app.core.config.Settings` and loaded from environment variables (or `.env` file):

| Variable | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | `str` | `None` | Full PostgreSQL connection string (`postgresql://<user>:<password>@<host>:<port>/<database>`) |
| `DATABASE_POOL_MIN_SIZE` | `int` | `1` | Minimum number of open connections maintained in the pool |
| `DATABASE_POOL_MAX_SIZE` | `int` | `10` | Maximum connections allowed in the pool |
| `DATABASE_POOL_TIMEOUT` | `float` | `30.0` | Seconds to wait for an available connection before raising `DatabasePoolError` |

### Setting up `.env`:
Copy `.env.example` to `.env` and configure local parameters:
```bash
cp .env.example .env
```
Example `.env` content:
```env
DATABASE_URL=postgresql://hcl:hcl_dev_password@localhost:5432/hcl_learning
DATABASE_POOL_MIN_SIZE=1
DATABASE_POOL_MAX_SIZE=10
DATABASE_POOL_TIMEOUT=30.0
```

---

## 3. Architecture & Connection Layer

The connection layer is isolated inside `app/db/`:

```text
app/
├── core/
│   └── config.py          # Settings loading DATABASE_URL & pool configs
├── db/
│   ├── __init__.py        # Public module exports
│   ├── exceptions.py      # DatabaseError hierarchy & credential maskers
│   └── connection.py      # DatabaseManager & connection pool lifecycle
```

### Key Components:
- **`DatabaseManager`**: Manages the `psycopg_pool.ConnectionPool`. Exposes:
  - `get_pool()`: Lazily initializes the connection pool.
  - `get_connection()`: Context manager that yields a pooled connection and guarantees return to pool upon context exit.
  - `check_connectivity()`: Runs `SELECT 1;` to verify database health and reachability.
  - `close()`: Cleanly closes all pooled connections and releases resources.
- **`get_db()`**: Convenience context manager for dependency injection or ad-hoc database queries.
- **`sanitize_db_url()`**: Utility function ensuring credentials (usernames/passwords) are masked in logs and exception messages.

---

## 4. Running the Local Database

The local development PostgreSQL 16 database with `pgvector` runs via Docker Compose:

```bash
cd database
docker compose up -d
```

To verify the container is active:
```bash
docker compose ps
```

---

## 5. Running Database Connectivity & Unit Tests

### Run All Tests (Unit + Integration):
```bash
pytest -v
```

### Run Unit Tests Only (No DB Required):
```bash
pytest -m "not integration" -v
```

### Run Database Integration Tests:
```bash
pytest -m "integration" -v
```

---

## 6. Boundaries & Deferred Functionality

As required by Step 4A.1 scope:
- **No Agent Connection:** Agents and tools do not yet connect directly to PostgreSQL.
- **No Repository Layer:** Repository abstractions (Learner, Skill, Goal, Learning Path) are intentionally deferred to Step 4A.2.
- **`get_learner_context()` Deferred:** Database retrieval for learner context will be implemented in Step 4A.2.
- **No ORM Introduced:** Standard `psycopg` is used directly without SQLAlchemy or SQLModel overhead.
- **No Schema Changes:** The existing PostgreSQL schema and migrations remain untouched and authoritative.

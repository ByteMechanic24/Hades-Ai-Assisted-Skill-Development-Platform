# Embedding Provider & Generation Documentation (Step 5A.2)

## 1. Overview & Architecture

Step 5A.2 implements the model-agnostic embedding generation layer for the Python AI service. It provides a clean provider abstraction ([`EmbeddingProvider`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/embeddings/base.py#L48-L82)) that decouples persistent memory storage and agent orchestration from specific embedding SDKs.

```
                     Memory Text Content
                              │
                              ▼
                ┌───────────────────────────┐
                │ validate_embedding_input()│
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │     EmbeddingService      │
                │   generate_embedding()    │
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  EmbeddingProvider (ABC)  │
                ├─────────────┬─────────────┤
                │   Mistral   │    Fake     │
                │  (1024-dim) │ (unit norm) │
                └─────────────┴─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │     validate_vector()     │
                │ (float, finite, non-empty)│
                └─────────────┬─────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │       save_memory()       │
                │   (PostgreSQL + pgvector) │
                └───────────────────────────┘
```

---

## 2. Selected Provider & Model

* **Default Provider:** Mistral AI (`MistralEmbeddingProvider`)
* **Default Model:** `mistral-embed`
* **Output Dimensionality:** `1024` dimensions
* **Test / Offline Provider:** `FakeEmbeddingProvider` (deterministic, zero-network, unit-normalized float vectors for local testing and CI/CD).

---

## 3. Configuration

Configured via environment variables in [`app.core.config.Settings`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/core/config.py):

| Variable | Type | Default | Description |
|---|---|---|---|
| `EMBEDDING_PROVIDER` | `str` | `"mistral"` | Selected provider (`"mistral"`, `"fake"`). |
| `EMBEDDING_MODEL` | `str` | `"mistral-embed"` | Model identifier passed to provider API. |
| `EMBEDDING_API_KEY` | `str` (optional) | `None` | API key override (falls back to `MISTRAL_API_KEY`). |
| `EMBEDDING_DIMENSION`| `int` | `1024` | Expected vector dimensionality for output validation. |

---

## 4. Component Structure

### 4.1 Abstraction: `app.embeddings.base.EmbeddingProvider`
Defines the required contract:
* `provider_name -> str`
* `model_id -> str`
* `dimension -> int`
* `embed(text: str) -> List[float]`

### 4.2 Concrete Providers
* [`MistralEmbeddingProvider`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/embeddings/mistral.py): Calls Mistral API `client.embeddings.create(model=..., inputs=[...])`, validates 1024-dim float response, redacts sensitive keys in error logs.
* [`FakeEmbeddingProvider`](file:///c:/Hades-Ai-Assisted-Skill-Development-Platform/ai-service/app/embeddings/fake.py): Generates deterministic SHA-256 derived unit vectors for zero-network testing.

### 4.3 Service Functions: `app.embeddings.service`
* `get_embedding_provider(provider_type, ...)`: Factory instantiating configured provider.
* `generate_embedding(text, provider)`: Validates input, generates, and validates vector.
* `save_memory_with_embedding(external_id, content, metadata, provider, manager)`: Thin convenience helper combining embedding generation with the existing `save_memory()` database repository.

---

## 5. Validation & Error Handling

### 5.1 Input Validation
* Rejects `None`, non-string types, empty strings, and whitespace-only strings with `InvalidEmbeddingInputError`.

### 5.2 Output Validation
* Validates vector is a non-empty `List[float]`.
* Validates all elements are numeric (`int` or `float`) and finite (`math.isfinite()`).
* Rejects `NaN`, `Infinity`, `None`, and booleans.
* Enforces exact dimension matching with `InvalidEmbeddingResponseError`.

### 5.3 Exception Hierarchy
```
EmbeddingError (Base)
  ├── InvalidEmbeddingInputError
  ├── EmbeddingConfigurationError
  ├── EmbeddingProviderError
  └── InvalidEmbeddingResponseError
```

---

## 6. Scope Boundaries & Next Steps

* **Step 5A.1 (Persistent Memory Foundation):** ✅ COMPLETE
* **Step 5A.2 (Embedding Provider + Generation):** ✅ COMPLETE
* **Step 5A.3 (pgvector Semantic Retrieval):** ⏭️ NEXT (Cosine similarity queries, top-K search)
* **Step 5A.4 (Agno Memory Integration):** ⏭️
* **Step 5A.5 (Memory into Orchestration / Agents):** ⏭️

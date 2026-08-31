from fastapi import APIRouter, HTTPException

from app.schemas.models import (
    OrchestrationRequest,
    OrchestrationResponse,
    AssistantChatRequest,
    AssistantChatResponse,
)
from app.agents.assistant_agent import create_learner_assistant
from orchestrator import create_orchestrator


router = APIRouter()

orchestrator = create_orchestrator()
assistant = create_learner_assistant()


@router.post(
    "/ai/orchestrate",
    response_model=OrchestrationResponse,
)
def orchestrate(
    request: OrchestrationRequest,
) -> OrchestrationResponse:
    try:
        resp = orchestrator.orchestrate(request)
        print("\n" + "="*80, flush=True)
        print(f"[AI SERVICE GENERATED RESPONSE] Learner: {request.learner_id} | Goal: {request.target_goal}", flush=True)
        print(f"Status: {resp.status} | Active Topic: {resp.active_topic}", flush=True)
        if resp.current_chunk:
            print(f"\n--- ROADMAP CHUNK: {getattr(resp.current_chunk, 'title', 'Untitled Chunk')} ---", flush=True)
            for m in getattr(resp.current_chunk, 'milestones', []):
                print(f"\n  Milestone {m.sequence_order}: {m.title} ({m.estimated_duration_weeks} weeks)", flush=True)
                for mod in getattr(m, 'modules', []):
                    print(f"    Module: {mod.title}", flush=True)
                    for t in getattr(mod, 'topics', []):
                        concepts = ', '.join(getattr(t, 'key_concepts', [])[:3])
                        print(f"      - Topic: {t.title} (Key concepts: {concepts})", flush=True)
        if resp.active_resources:
            print(f"\n--- ACTIVE TOPIC RESOURCES ({getattr(resp.active_resources, 'topic_title', '')}) ---", flush=True)
            res_list = getattr(resp.active_resources, 'youtube_resources', []) + getattr(resp.active_resources, 'general_resources', [])
            for r in res_list[:5]:
                print(f"  * [{getattr(r, 'resource_type', 'RESOURCE').upper()}] {r.title} ({r.url})", flush=True)
        print("="*80 + "\n", flush=True)
        return resp
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI orchestration failed: {exc}",
        ) from exc


@router.post(
    "/ai/assistant/chat",
    response_model=AssistantChatResponse,
)
def assistant_chat(
    request: AssistantChatRequest,
) -> AssistantChatResponse:
    try:
        answer = assistant.answer(
            learner_id=request.learner_id,
            message=request.message,
            session_id=request.session_id,
        )
        print("\n" + "="*80, flush=True)
        print(f"[AI COACH ASSISTANT GENERATION] Learner: {request.learner_id}", flush=True)
        print(f"User Question: {request.message}", flush=True)
        print(f"AI Coach Answer:\n{answer}", flush=True)
        print("="*80 + "\n", flush=True)
        return AssistantChatResponse(
            learner_id=request.learner_id,
            session_id=request.session_id,
            message=answer,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI assistant failed: {exc}",
        ) from exc


@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-service",
    }
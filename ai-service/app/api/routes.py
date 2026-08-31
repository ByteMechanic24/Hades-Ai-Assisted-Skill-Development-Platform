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
        return orchestrator.orchestrate(request)
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
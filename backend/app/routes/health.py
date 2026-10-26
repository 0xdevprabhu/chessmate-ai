"""Health and engine status route handlers."""

from datetime import datetime, timezone
from fastapi import APIRouter
from ..config import settings
from ..schemas import HealthResponse, EngineStatusResponse
from ..engine_service import engine_service

router = APIRouter(tags=["Health & Status"])

@router.get("/health", response_model=HealthResponse)
async def get_health():
    engine_status = await engine_service.get_status()
    now_iso = datetime.now(timezone.utc).isoformat()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=now_iso,
        engine_configured=bool(settings.resolve_stockfish_path()),
        engine_ready=engine_status.ready,
        engine_path=engine_status.engine_path,
        engine_name=engine_status.engine_name,
    )

@router.get("/engine/status", response_model=EngineStatusResponse)
async def get_engine_status():
    return await engine_service.get_status()

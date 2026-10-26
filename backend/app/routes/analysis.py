"""Stockfish position analysis endpoint."""

import logging
from fastapi import APIRouter, HTTPException, status
from ..schemas import AnalysisRequest, AnalysisResponse
from ..chess_service import ChessService
from ..engine_service import engine_service

logger = logging.getLogger("chessmate.routes.analysis")
router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("", response_model=AnalysisResponse)
async def analyze_position(request: AnalysisRequest):
    # 1. Validate FEN
    try:
        board = ChessService.validate_and_parse_fen(request.fen)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid position FEN: {str(e)}",
        )

    # 2. Perform Stockfish Analysis
    try:
        result = await engine_service.analyze(
            board=board,
            time_limit=request.time_limit,
            depth_limit=request.depth_limit,
            multipv=request.multipv or 3,
            player_color=request.player_color or "white",
        )
        return result
    except TimeoutError as e:
        logger.warning(f"Engine timeout: {e}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Stockfish analysis timed out. Try lowering depth or analysis time.",
        )
    except RuntimeError as e:
        logger.error(f"Engine runtime error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected analysis failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis encountered an internal error: {str(e)}",
        )

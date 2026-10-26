"""Chess game management routes for moves, undo, FEN and PGN import/export."""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Response
from ..schemas import (
    NewGameRequest,
    MoveRequest,
    UndoRequest,
    ImportFenRequest,
    ImportPgnRequest,
    GameResponse,
)
from ..chess_service import ChessService

router = APIRouter(prefix="/game", tags=["Game Operations"])

@router.post("/new", response_model=GameResponse)
async def new_game(request: NewGameRequest):
    try:
        board = ChessService.get_initial_board(request.initial_fen)
        return ChessService.build_game_response(board)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/move", response_model=GameResponse)
async def play_move(request: MoveRequest):
    try:
        board = ChessService.validate_and_parse_fen(request.fen)
        move = ChessService.parse_move(board, request.move, request.promotion)
        board, move_details = ChessService.apply_move(board, move)
        return ChessService.build_game_response(board, last_move=move_details)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected move error: {str(e)}")

@router.post("/undo", response_model=GameResponse)
async def undo_move(request: UndoRequest):
    try:
        board, last_move, new_history = ChessService.undo_from_history(
            request.history, request.initial_fen
        )
        return ChessService.build_game_response(board, last_move=last_move, move_history=new_history)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Undo failed: {str(e)}")

@router.post("/import-fen", response_model=GameResponse)
async def import_fen(request: ImportFenRequest):
    try:
        board = ChessService.validate_and_parse_fen(request.fen)
        return ChessService.build_game_response(board)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/import-pgn", response_model=GameResponse)
async def import_pgn(request: ImportPgnRequest):
    try:
        board, move_history, _ = ChessService.import_pgn(request.pgn)
        return ChessService.build_game_response(board, move_history=move_history)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export-pgn")
async def export_pgn(
    moves: Optional[str] = Query(default="", description="Comma-separated or space-separated SAN moves"),
    fen: Optional[str] = Query(default=None, description="Current FEN position"),
    white_player: str = Query(default="Player"),
    black_player: str = Query(default="Opponent"),
    download: bool = Query(default=False),
):
    try:
        board = ChessService.get_initial_board(fen)
        move_list: List[str] = []
        if moves:
            # Handle comma or space separated
            cleaned = moves.replace(",", " ").split()
            move_list = [m.strip() for m in cleaned if m.strip()]

        headers = {
            "Event": "ChessMate AI Physical Board Session",
            "Site": "ChessMate AI",
            "White": white_player,
            "Black": black_player,
        }
        pgn_text = ChessService.export_pgn(board, move_list, headers=headers)

        if download:
            return Response(
                content=pgn_text,
                media_type="application/x-chess-pgn",
                headers={"Content-Disposition": 'attachment; filename="chessmate_game.pgn"'},
            )
        return {"pgn": pgn_text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to export PGN: {str(e)}")

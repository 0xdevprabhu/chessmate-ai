"""Pydantic schemas for request and response models."""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

Color = Literal["white", "black"]

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    engine_configured: bool
    engine_ready: bool
    engine_path: Optional[str] = None
    engine_name: Optional[str] = None

class EngineStatusResponse(BaseModel):
    ready: bool
    engine_name: Optional[str] = None
    engine_path: Optional[str] = None
    default_depth: int
    max_depth: int
    default_time: float
    max_time: float
    threads: int
    hash_mb: int
    error_message: Optional[str] = None

class GameStatus(BaseModel):
    is_game_over: bool
    is_check: bool
    is_checkmate: bool
    is_stalemate: bool
    is_insufficient_material: bool
    is_seventyfive_moves: bool
    is_fivefold_repetition: bool
    result: Optional[str] = None
    status_text: str

class MoveDetails(BaseModel):
    from_square: str
    to_square: str
    san: str
    uci: str
    piece: str
    captured: Optional[str] = None
    promotion: Optional[str] = None

class CapturedPieces(BaseModel):
    white: List[str] = Field(default_factory=list)
    black: List[str] = Field(default_factory=list)
    material_difference: int = 0  # positive means white leads, negative means black leads

class GameResponse(BaseModel):
    fen: str
    turn: Color
    fullmove_number: int
    halfmove_clock: int
    last_move: Optional[MoveDetails] = None
    legal_moves: List[str] = Field(default_factory=list)
    legal_moves_san: List[str] = Field(default_factory=list)
    status: GameStatus
    captured_pieces: CapturedPieces
    move_history: List[str] = Field(default_factory=list)  # SAN moves

class NewGameRequest(BaseModel):
    player_color: Color = "white"
    initial_fen: Optional[str] = None

class MoveRequest(BaseModel):
    fen: str
    move: str  # Can be UCI (e.g. "e2e4", "e7e8q") or SAN (e.g. "e4", "Nf3")
    promotion: Optional[str] = None

class UndoRequest(BaseModel):
    history: List[str] = Field(default_factory=list)  # Move sequence (UCI or SAN)
    initial_fen: Optional[str] = None

class ImportFenRequest(BaseModel):
    fen: str

class ImportPgnRequest(BaseModel):
    pgn: str

class ExportPgnResponse(BaseModel):
    pgn: str

class CandidateLine(BaseModel):
    rank: int
    move_uci: str
    move_san: str
    from_square: str
    to_square: str
    evaluation: str
    score_cp: Optional[int] = None
    mate_score: Optional[int] = None
    pv_uci: List[str] = Field(default_factory=list)
    pv_san: List[str] = Field(default_factory=list)

class ArrowHint(BaseModel):
    from_square: str
    to_square: str

class HintInfo(BaseModel):
    level1_gentle: str
    level1_square: str
    level2_direction: str
    level2_arrow: ArrowHint
    level3_full: str
    best_move_uci: str
    best_move_san: str

class AnalysisRequest(BaseModel):
    fen: str
    time_limit: Optional[float] = Field(default=None, ge=0.1, le=10.0)
    depth_limit: Optional[int] = Field(default=None, ge=1, le=30)
    multipv: Optional[int] = Field(default=3, ge=1, le=5)
    player_color: Optional[Color] = "white"

class AnalysisResponse(BaseModel):
    fen: str
    side_to_move: Color
    best_move: str  # UCI
    best_move_san: str
    from_square: str
    to_square: str
    evaluation: str
    evaluation_perspective: str
    score_pawns: float
    mate: Optional[int] = None
    depth: int
    duration_ms: int
    pv_san: List[str] = Field(default_factory=list)
    pv_uci: List[str] = Field(default_factory=list)
    alternative_lines: List[CandidateLine] = Field(default_factory=list)
    explanation: str
    hints: HintInfo
    is_game_over: bool
    game_status: Optional[str] = None

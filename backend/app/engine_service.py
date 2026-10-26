"""Stockfish chess engine integration service with concurrency locking, timeouts, and analysis."""

import asyncio
import logging
import time
from typing import Optional, List, Tuple, Dict, Any
import chess
import chess.engine
from .config import settings
from .schemas import (
    EngineStatusResponse,
    AnalysisResponse,
    CandidateLine,
    HintInfo,
    ArrowHint,
    Color,
)

logger = logging.getLogger("chessmate.engine")

class EngineService:
    def __init__(self):
        self._engine: Optional[chess.engine.SimpleEngine] = None
        self._lock = asyncio.Lock()
        self._engine_path: Optional[str] = None
        self._engine_name: Optional[str] = None
        self._last_error: Optional[str] = None

    def initialize_sync(self) -> bool:
        """Attempts to start or verify the Stockfish engine process synchronously."""
        path = settings.resolve_stockfish_path()
        if not path:
            self._last_error = "Stockfish executable not found. Please set STOCKFISH_PATH or run scripts/download_stockfish.py."
            logger.warning(self._last_error)
            return False

        try:
            if self._engine is not None:
                try:
                    self._engine.ping()
                    return True
                except Exception:
                    self.close_sync()

            logger.info(f"Spawning Stockfish engine from: {path}")
            engine = chess.engine.SimpleEngine.popen_uci(path)
            
            # Configure engine options safely
            options: Dict[str, Any] = {}
            if "Threads" in engine.options and settings.engine_threads:
                options["Threads"] = min(settings.engine_threads, 4)
            if "Hash" in engine.options and settings.engine_hash_mb:
                options["Hash"] = min(settings.engine_hash_mb, 256)

            if options:
                engine.configure(options)

            self._engine = engine
            self._engine_path = path
            self._engine_name = engine.id.get("name", "Stockfish")
            self._last_error = None
            logger.info(f"Stockfish initialized successfully: {self._engine_name}")
            return True
        except Exception as e:
            self._last_error = f"Failed to start Stockfish at '{path}': {str(e)}"
            logger.error(self._last_error)
            self._engine = None
            return False

    async def get_status(self) -> EngineStatusResponse:
        """Returns the current engine status and configuration."""
        async with self._lock:
            ready = await asyncio.to_thread(self._check_ready)
            return EngineStatusResponse(
                ready=ready,
                engine_name=self._engine_name if ready else None,
                engine_path=self._engine_path if ready else settings.resolve_stockfish_path(),
                default_depth=settings.default_analysis_depth,
                max_depth=settings.max_analysis_depth,
                default_time=settings.default_analysis_time,
                max_time=settings.max_analysis_time,
                threads=settings.engine_threads,
                hash_mb=settings.engine_hash_mb,
                error_message=self._last_error if not ready else None,
            )

    def _check_ready(self) -> bool:
        if self._engine is None:
            return self.initialize_sync()
        try:
            self._engine.ping()
            return True
        except Exception:
            return self.initialize_sync()

    def close_sync(self):
        """Clean shutdown of engine process."""
        if self._engine is not None:
            try:
                self._engine.quit()
            except Exception:
                try:
                    self._engine.close()
                except Exception:
                    pass
            self._engine = None

    async def analyze(
        self,
        board: chess.Board,
        time_limit: Optional[float] = None,
        depth_limit: Optional[int] = None,
        multipv: int = 3,
        player_color: Color = "white",
    ) -> AnalysisResponse:
        """Performs Stockfish analysis with safe concurrency and timeout controls."""
        if board.is_game_over():
            return self._build_game_over_response(board)

        # Enforce limits
        t_limit = min(time_limit or settings.default_analysis_time, settings.max_analysis_time)
        d_limit = min(depth_limit or settings.default_analysis_depth, settings.max_analysis_depth)
        mpv = max(1, min(multipv, 5))

        async with self._lock:
            # Check or restart engine if necessary
            ready = await asyncio.to_thread(self._check_ready)
            if not ready or self._engine is None:
                raise RuntimeError(self._last_error or "Stockfish engine is not available. Please verify installation.")

            start_time = time.perf_counter()
            limit = chess.engine.Limit(time=t_limit, depth=d_limit)

            try:
                # Run synchronous engine analysis inside worker thread with timeout buffer
                info_list = await asyncio.wait_for(
                    asyncio.to_thread(self._run_multipv_analysis, board, limit, mpv),
                    timeout=t_limit + 3.0,
                )
            except asyncio.TimeoutError:
                logger.warning("Analysis timed out, restarting engine")
                self.close_sync()
                self.initialize_sync()
                raise TimeoutError("Stockfish analysis timed out.")
            except Exception as e:
                logger.error(f"Engine analysis error: {e}")
                self.close_sync()
                self.initialize_sync()
                raise RuntimeError(f"Engine error during position analysis: {str(e)}")

            duration_ms = int((time.perf_counter() - start_time) * 1000)
            return self._format_analysis_result(board, info_list, duration_ms, player_color)

    def _run_multipv_analysis(self, board: chess.Board, limit: chess.engine.Limit, multipv: int) -> List[Dict[str, Any]]:
        if not self._engine:
            raise RuntimeError("Engine instance is None")
        # analyse returns a list of dicts when multipv > 1
        num_legal = len(list(board.legal_moves))
        effective_mpv = min(multipv, num_legal) if num_legal > 0 else 1
        return self._engine.analyse(board, limit, multipv=effective_mpv)

    def _format_analysis_result(
        self,
        board: chess.Board,
        info_list: List[Dict[str, Any]],
        duration_ms: int,
        player_color: Color,
    ) -> AnalysisResponse:
        if not info_list:
            raise RuntimeError("Engine returned no analysis results.")

        # Best line is the first one
        best_info = info_list[0]
        pv: List[chess.Move] = best_info.get("pv", [])
        if not pv:
            # Fallback if no pv
            legal_moves = list(board.legal_moves)
            if not legal_moves:
                return self._build_game_over_response(board)
            best_move = legal_moves[0]
        else:
            best_move = pv[0]

        from_sq = chess.square_name(best_move.from_square)
        to_sq = chess.square_name(best_move.to_square)
        best_move_san = board.san(best_move)
        best_move_uci = best_move.uci()

        # Score parsing
        score_obj = best_info.get("score")
        depth = best_info.get("depth", 0)

        # White relative score
        white_score = score_obj.white() if score_obj else None
        mate_score: Optional[int] = None
        score_cp: Optional[int] = None
        score_pawns: float = 0.0
        formatted_eval: str = "+0.00"

        if white_score:
            if white_score.is_mate():
                mate_score = white_score.mate()
                formatted_eval = f"M{mate_score}" if mate_score and mate_score > 0 else f"-M{abs(mate_score)}" if mate_score else "M"
                score_pawns = 100.0 if (mate_score and mate_score > 0) else -100.0
            else:
                score_cp = white_score.score()
                score_pawns = (score_cp or 0) / 100.0
                formatted_eval = f"{score_pawns:+.2f}"

        # Principal variation SAN & UCI
        temp_board = board.copy()
        pv_san: List[str] = []
        pv_uci: List[str] = []
        for m in pv[:10]:
            if m in temp_board.legal_moves:
                pv_san.append(temp_board.san(m))
                pv_uci.append(m.uci())
                temp_board.push(m)
            else:
                break

        # Candidate lines
        candidate_lines: List[CandidateLine] = []
        for rank, line_info in enumerate(info_list, start=1):
            line_pv: List[chess.Move] = line_info.get("pv", [])
            if not line_pv:
                continue
            first_move = line_pv[0]
            if first_move not in board.legal_moves:
                continue

            line_from = chess.square_name(first_move.from_square)
            line_to = chess.square_name(first_move.to_square)
            line_san = board.san(first_move)
            line_uci = first_move.uci()

            l_score = line_info.get("score")
            l_white = l_score.white() if l_score else None
            l_cp = None
            l_mate = None
            l_eval_str = "+0.00"
            if l_white:
                if l_white.is_mate():
                    l_mate = l_white.mate()
                    l_eval_str = f"M{l_mate}" if l_mate and l_mate > 0 else f"-M{abs(l_mate)}"
                else:
                    l_cp = l_white.score()
                    l_eval_str = f"{(l_cp or 0)/100.0:+.2f}"

            t_board = board.copy()
            l_pv_san: List[str] = []
            l_pv_uci: List[str] = []
            for m in line_pv[:8]:
                if m in t_board.legal_moves:
                    l_pv_san.append(t_board.san(m))
                    l_pv_uci.append(m.uci())
                    t_board.push(m)
                else:
                    break

            candidate_lines.append(
                CandidateLine(
                    rank=rank,
                    move_uci=line_uci,
                    move_san=line_san,
                    from_square=line_from,
                    to_square=line_to,
                    evaluation=l_eval_str,
                    score_cp=l_cp,
                    mate_score=l_mate,
                    pv_uci=l_pv_uci,
                    pv_san=l_pv_san,
                )
            )

        # Build hints
        hints = self._generate_hints(board, best_move, best_move_san, formatted_eval)
        explanation = self._generate_explanation(board, best_move, best_move_san, formatted_eval)

        side_turn: Color = "white" if board.turn == chess.WHITE else "black"

        return AnalysisResponse(
            fen=board.fen(),
            side_to_move=side_turn,
            best_move=best_move_uci,
            best_move_san=best_move_san,
            from_square=from_sq,
            to_square=to_sq,
            evaluation=formatted_eval,
            evaluation_perspective="white",
            score_pawns=score_pawns,
            mate=mate_score,
            depth=depth,
            duration_ms=duration_ms,
            pv_san=pv_san,
            pv_uci=pv_uci,
            alternative_lines=candidate_lines,
            explanation=explanation,
            hints=hints,
            is_game_over=False,
            game_status=None,
        )

    def _generate_hints(
        self,
        board: chess.Board,
        best_move: chess.Move,
        best_move_san: str,
        evaluation: str,
    ) -> HintInfo:
        from_sq_name = chess.square_name(best_move.from_square)
        to_sq_name = chess.square_name(best_move.to_square)
        piece = board.piece_at(best_move.from_square)
        piece_name = chess.piece_name(piece.piece_type) if piece else "piece"

        gentle = f"Focus on your {piece_name} positioned on {from_sq_name}."
        direction = f"Move your {piece_name} from {from_sq_name} towards {to_sq_name}."
        full = f"Play {best_move_san} ({from_sq_name} to {to_sq_name}). Engine evaluation is {evaluation}."

        return HintInfo(
            level1_gentle=gentle,
            level1_square=from_sq_name,
            level2_direction=direction,
            level2_arrow=ArrowHint(from_square=from_sq_name, to_square=to_sq_name),
            level3_full=full,
            best_move_uci=best_move.uci(),
            best_move_san=best_move_san,
        )

    def _generate_explanation(
        self,
        board: chess.Board,
        move: chess.Move,
        san: str,
        evaluation: str,
    ) -> str:
        piece = board.piece_at(move.from_square)
        target_piece = board.piece_at(move.to_square)
        from_name = chess.square_name(move.from_square)
        to_name = chess.square_name(move.to_square)
        
        # Check if castling
        if board.is_castling(move):
            side = "kingside" if chess.square_file(move.to_square) == 6 else "queenside"
            return f"Castles {side} to tuck the king into safety and activate the rook."

        # Check if capture
        if target_piece:
            cap_name = chess.piece_name(target_piece.piece_type)
            p_name = chess.piece_name(piece.piece_type) if piece else "piece"
            return f"Captures Black's {cap_name} on {to_name} with {p_name}." if board.turn == chess.WHITE else f"Captures White's {cap_name} on {to_name} with {p_name}."

        if board.is_en_passant(move):
            return f"Captures pawn en passant on {to_name}."

        # Check if check or checkmate
        board_copy = board.copy()
        board_copy.push(move)
        if board_copy.is_checkmate():
            return f"Delivers checkmate with {san}! The game is won."
        if board_copy.is_check():
            return f"Puts the opposing king in check with {san}, seizing tempo."

        # Minor piece development in opening
        if board.fullmove_number <= 10 and piece:
            if piece.piece_type in [chess.KNIGHT, chess.BISHOP]:
                return f"Develops the {chess.piece_name(piece.piece_type)} to active square {to_name}."
            if piece.piece_type == chess.PAWN and to_name in ["e4", "d4", "e5", "d5", "c4"]:
                return f"Advances pawn to {to_name} to stake a claim in the center."

        # Central control
        if to_name in ["e4", "d4", "e5", "d5"]:
            return f"Controls vital central square {to_name}."

        p_name = chess.piece_name(piece.piece_type).capitalize() if piece else "Piece"
        return f"{p_name} repositions from {from_name} to {to_name} for improved tactical activity."

    def _build_game_over_response(self, board: chess.Board) -> AnalysisResponse:
        turn_str: Color = "white" if board.turn == chess.WHITE else "black"
        status_text = "Game Over"
        if board.is_checkmate():
            winner = "Black" if board.turn == chess.WHITE else "White"
            status_text = f"Checkmate! {winner} wins."
        elif board.is_stalemate():
            status_text = "Draw by stalemate."
        elif board.is_insufficient_material():
            status_text = "Draw by insufficient material."

        return AnalysisResponse(
            fen=board.fen(),
            side_to_move=turn_str,
            best_move="",
            best_move_san="",
            from_square="",
            to_square="",
            evaluation="0.00",
            evaluation_perspective="white",
            score_pawns=0.0,
            mate=0,
            depth=0,
            duration_ms=0,
            pv_san=[],
            pv_uci=[],
            alternative_lines=[],
            explanation=status_text,
            hints=HintInfo(
                level1_gentle=status_text,
                level1_square="",
                level2_direction=status_text,
                level2_arrow=ArrowHint(from_square="", to_square=""),
                level3_full=status_text,
                best_move_uci="",
                best_move_san="",
            ),
            is_game_over=True,
            game_status=status_text,
        )

engine_service = EngineService()

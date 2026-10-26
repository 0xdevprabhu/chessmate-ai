"""Chess service handling rules, moves, FEN/PGN parsing, and game state."""

import io
from typing import List, Optional, Tuple, Dict, Any
import chess
import chess.pgn
from .schemas import (
    GameStatus,
    MoveDetails,
    CapturedPieces,
    GameResponse,
    Color,
)

PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
    chess.KING: 0,
}

INITIAL_PIECES = {
    chess.WHITE: {
        chess.PAWN: 8,
        chess.KNIGHT: 2,
        chess.BISHOP: 2,
        chess.ROOK: 2,
        chess.QUEEN: 1,
    },
    chess.BLACK: {
        chess.PAWN: 8,
        chess.KNIGHT: 2,
        chess.BISHOP: 2,
        chess.ROOK: 2,
        chess.QUEEN: 1,
    },
}

PIECE_SYMBOLS = {
    chess.PAWN: "p",
    chess.KNIGHT: "n",
    chess.BISHOP: "b",
    chess.ROOK: "r",
    chess.QUEEN: "q",
    chess.KING: "k",
}

class ChessService:
    @staticmethod
    def get_initial_board(fen: Optional[str] = None) -> chess.Board:
        if fen and fen.strip():
            return ChessService.validate_and_parse_fen(fen)
        return chess.Board()

    @staticmethod
    def validate_and_parse_fen(fen: str) -> chess.Board:
        fen = fen.strip()
        try:
            board = chess.Board(fen)
            # Ensure the FEN is structurally and logically valid
            if not board.is_valid():
                # Provide diagnostic if king missing or invalid
                status = board.status()
                raise ValueError(f"Invalid chess position: {status}")
            return board
        except Exception as e:
            raise ValueError(f"Invalid FEN string: {str(e)}")

    @staticmethod
    def parse_move(board: chess.Board, move_str: str, promotion: Optional[str] = "q") -> chess.Move:
        """Parses a move in UCI or SAN notation, applying promotion if needed."""
        cleaned = move_str.strip()
        if not cleaned:
            raise ValueError("Move string cannot be empty")

        # Try parsing as UCI
        try:
            move = chess.Move.from_uci(cleaned)
            if move in board.legal_moves:
                return move
        except Exception:
            pass

        # If move was given with superfluous promotion character (e.g. "e2e4q"), strip it when not on promotion rank
        if len(cleaned) == 5 and cleaned[4].lower() in "qrbn":
            try:
                stripped_move = chess.Move.from_uci(cleaned[:4])
                if stripped_move in board.legal_moves:
                    return stripped_move
            except Exception:
                pass

        # If promotion needed (e.g. e7e8 without promotion char on a pawn move to 8th/1st rank)
        if len(cleaned) == 4 and cleaned[0] in "abcdefgh" and cleaned[2] in "abcdefgh":
            from_sq = chess.parse_square(cleaned[:2])
            to_sq = chess.parse_square(cleaned[2:4])
            piece = board.piece_at(from_sq)
            if piece and piece.piece_type == chess.PAWN:
                to_rank = chess.square_rank(to_sq)
                if (piece.color == chess.WHITE and to_rank == 7) or (piece.color == chess.BLACK and to_rank == 0):
                    promo_char = (promotion or "q").lower()[0]
                    promo_type = {"q": chess.QUEEN, "r": chess.ROOK, "b": chess.BISHOP, "n": chess.KNIGHT}.get(promo_char, chess.QUEEN)
                    promoted_move = chess.Move(from_sq, to_sq, promotion=promo_type)
                    if promoted_move in board.legal_moves:
                        return promoted_move

        # Try parsing as SAN
        try:
            move = board.parse_san(cleaned)
            if move in board.legal_moves:
                return move
        except Exception:
            pass

        # If not legal, provide detailed reason
        raise ValueError(f"Move '{cleaned}' is not legal in the current position.")

    @staticmethod
    def apply_move(board: chess.Board, move: chess.Move) -> Tuple[chess.Board, MoveDetails]:
        from_sq = chess.square_name(move.from_square)
        to_sq = chess.square_name(move.to_square)
        san = board.san(move)
        uci = move.uci()
        piece = board.piece_at(move.from_square)
        piece_symbol = piece.symbol() if piece else ""
        
        captured_piece = board.piece_at(move.to_square)
        captured_str = captured_piece.symbol() if captured_piece else None
        
        # En passant capture detection
        if board.is_en_passant(move):
            captured_str = "p" if board.turn == chess.WHITE else "P"

        promo_str = PIECE_SYMBOLS.get(move.promotion) if move.promotion else None

        move_details = MoveDetails(
            from_square=from_sq,
            to_square=to_sq,
            san=san,
            uci=uci,
            piece=piece_symbol,
            captured=captured_str,
            promotion=promo_str,
        )

        board.push(move)
        return board, move_details

    @staticmethod
    def calculate_captured_pieces(board: chess.Board) -> CapturedPieces:
        """Calculates captured pieces by subtracting remaining pieces from standard 16."""
        current_counts = {
            chess.WHITE: {pt: 0 for pt in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN]},
            chess.BLACK: {pt: 0 for pt in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN]},
        }

        for square in chess.SQUARES:
            piece = board.piece_at(square)
            if piece and piece.piece_type != chess.KING:
                current_counts[piece.color][piece.piece_type] += 1

        white_captured: List[str] = []
        black_captured: List[str] = []

        # Pieces White lost (captured by Black)
        for pt, initial in INITIAL_PIECES[chess.WHITE].items():
            diff = initial - current_counts[chess.WHITE][pt]
            if diff > 0:
                white_captured.extend([PIECE_SYMBOLS[pt].upper()] * diff)

        # Pieces Black lost (captured by White)
        for pt, initial in INITIAL_PIECES[chess.BLACK].items():
            diff = initial - current_counts[chess.BLACK][pt]
            if diff > 0:
                black_captured.extend([PIECE_SYMBOLS[pt].lower()] * diff)

        white_material = sum(count * PIECE_VALUES[pt] for pt, count in current_counts[chess.WHITE].items())
        black_material = sum(count * PIECE_VALUES[pt] for pt, count in current_counts[chess.BLACK].items())
        mat_diff = white_material - black_material

        return CapturedPieces(
            white=white_captured,
            black=black_captured,
            material_difference=mat_diff,
        )

    @staticmethod
    def get_game_status(board: chess.Board) -> GameStatus:
        is_check = board.is_check()
        is_checkmate = board.is_checkmate()
        is_stalemate = board.is_stalemate()
        is_insufficient = board.is_insufficient_material()
        is_seventyfive = board.is_seventyfive_moves()
        is_fivefold = board.is_fivefold_repetition()
        is_game_over = board.is_game_over()

        result = None
        status_text = ""

        if is_checkmate:
            winner = "Black" if board.turn == chess.WHITE else "White"
            result = "0-1" if board.turn == chess.WHITE else "1-0"
            status_text = f"Checkmate! {winner} wins."
        elif is_stalemate:
            result = "1/2-1/2"
            status_text = "Draw by stalemate."
        elif is_insufficient:
            result = "1/2-1/2"
            status_text = "Draw by insufficient material."
        elif is_seventyfive:
            result = "1/2-1/2"
            status_text = "Draw by 75-move rule."
        elif is_fivefold:
            result = "1/2-1/2"
            status_text = "Draw by fivefold repetition."
        elif is_check:
            turn_name = "White" if board.turn == chess.WHITE else "Black"
            status_text = f"{turn_name} is in check!"
        else:
            turn_name = "White" if board.turn == chess.WHITE else "Black"
            status_text = f"{turn_name} to move."

        return GameStatus(
            is_game_over=is_game_over,
            is_check=is_check,
            is_checkmate=is_checkmate,
            is_stalemate=is_stalemate,
            is_insufficient_material=is_insufficient,
            is_seventyfive_moves=is_seventyfive,
            is_fivefold_repetition=is_fivefold,
            result=result,
            status_text=status_text,
        )

    @staticmethod
    def build_game_response(
        board: chess.Board,
        last_move: Optional[MoveDetails] = None,
        move_history: Optional[List[str]] = None,
    ) -> GameResponse:
        turn_str: Color = "white" if board.turn == chess.WHITE else "black"
        legal_moves_uci = [m.uci() for m in board.legal_moves]
        legal_moves_san = [board.san(m) for m in board.legal_moves]
        
        status = ChessService.get_game_status(board)
        captured = ChessService.calculate_captured_pieces(board)

        return GameResponse(
            fen=board.fen(),
            turn=turn_str,
            fullmove_number=board.fullmove_number,
            halfmove_clock=board.halfmove_clock,
            last_move=last_move,
            legal_moves=legal_moves_uci,
            legal_moves_san=legal_moves_san,
            status=status,
            captured_pieces=captured,
            move_history=move_history or [],
        )

    @staticmethod
    def undo_from_history(moves: List[str], initial_fen: Optional[str] = None) -> Tuple[chess.Board, Optional[MoveDetails], List[str]]:
        """Reconstructs the game up to the last move, undoing one move."""
        board = ChessService.get_initial_board(initial_fen)
        new_history: List[str] = []
        last_move_details: Optional[MoveDetails] = None

        if not moves:
            return board, None, []

        # Replay all but the last move
        moves_to_replay = moves[:-1]
        for m_str in moves_to_replay:
            move = ChessService.parse_move(board, m_str)
            board, last_move_details = ChessService.apply_move(board, move)
            new_history.append(last_move_details.san)

        return board, last_move_details, new_history

    @staticmethod
    def import_pgn(pgn_text: str) -> Tuple[chess.Board, List[str], Dict[str, str]]:
        pgn_io = io.StringIO(pgn_text.strip())
        game = chess.pgn.read_game(pgn_io)
        if game is None:
            raise ValueError("Could not parse valid PGN data.")

        board = game.board()
        move_history: List[str] = []
        for move in game.mainline_moves():
            if move not in board.legal_moves:
                raise ValueError(f"Illegal move {move.uci()} encountered during PGN playback.")
            san = board.san(move)
            board.push(move)
            move_history.append(san)

        headers = {k: str(v) for k, v in game.headers.items()}
        return board, move_history, headers

    @staticmethod
    def export_pgn(board: chess.Board, move_history: List[str], headers: Optional[Dict[str, str]] = None) -> str:
        game = chess.pgn.Game()
        if headers:
            for k, v in headers.items():
                game.headers[k] = v
        else:
            game.headers["Event"] = "ChessMate AI Physical Board Session"
            game.headers["Site"] = "ChessMate AI"
            game.headers["White"] = "Player"
            game.headers["Black"] = "Opponent"

        status = ChessService.get_game_status(board)
        if status.result:
            game.headers["Result"] = status.result

        # Reconstruct moves in game node tree
        temp_board = chess.Board()
        node = game
        for m_str in move_history:
            try:
                move = ChessService.parse_move(temp_board, m_str)
                temp_board.push(move)
                node = node.add_variation(move)
            except Exception:
                break

        exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
        return game.accept(exporter)

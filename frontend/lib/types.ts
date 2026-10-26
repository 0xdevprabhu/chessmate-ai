export type Color = "white" | "black";

export interface MoveDetails {
  from_square: string;
  to_square: string;
  san: string;
  uci: string;
  piece: string;
  captured?: string | null;
  promotion?: string | null;
}

export interface CapturedPieces {
  white: string[];
  black: string[];
  material_difference: number;
}

export interface GameStatus {
  is_game_over: boolean;
  is_check: boolean;
  is_checkmate: boolean;
  is_stalemate: boolean;
  is_insufficient_material: boolean;
  is_seventyfive_moves: boolean;
  is_fivefold_repetition: boolean;
  result?: string | null;
  status_text: string;
}

export interface GameResponse {
  fen: string;
  turn: Color;
  fullmove_number: number;
  halfmove_clock: number;
  last_move?: MoveDetails | null;
  legal_moves: string[];
  legal_moves_san: string[];
  status: GameStatus;
  captured_pieces: CapturedPieces;
  move_history: string[];
}

export interface CandidateLine {
  rank: number;
  move_uci: string;
  move_san: string;
  from_square: string;
  to_square: string;
  evaluation: string;
  score_cp?: number | null;
  mate_score?: number | null;
  pv_uci: string[];
  pv_san: string[];
}

export interface ArrowHint {
  from_square: string;
  to_square: string;
}

export interface HintInfo {
  level1_gentle: string;
  level1_square: string;
  level2_direction: string;
  level2_arrow: ArrowHint;
  level3_full: string;
  best_move_uci: string;
  best_move_san: string;
}

export interface AnalysisResponse {
  fen: string;
  side_to_move: Color;
  best_move: string;
  best_move_san: string;
  from_square: string;
  to_square: string;
  evaluation: string;
  evaluation_perspective: string;
  score_pawns: number;
  mate?: number | null;
  depth: number;
  duration_ms: number;
  pv_san: string[];
  pv_uci: string[];
  alternative_lines: CandidateLine[];
  explanation: string;
  hints: HintInfo;
  is_game_over: boolean;
  game_status?: string | null;
}

export interface EngineStatusResponse {
  ready: boolean;
  engine_name?: string | null;
  engine_path?: string | null;
  default_depth: number;
  max_depth: number;
  default_time: number;
  max_time: number;
  threads: number;
  hash_mb: number;
  error_message?: string | null;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  engine_configured: boolean;
  engine_ready: boolean;
  engine_path?: string | null;
  engine_name?: string | null;
}

export interface AppSettings {
  playerColor: Color;
  orientation: "white" | "black" | "auto";
  soundEnabled: boolean;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  showBestMoveArrow: boolean;
  analysisTimeLimit: number;
  analysisDepthLimit: number;
  defaultHintLevel: 1 | 2 | 3;
  boardTheme: "charcoal" | "classic" | "wood" | "emerald";
}

export interface SavedGameState {
  fen: string;
  playerColor: Color;
  moveHistory: string[];
  historyFens: string[];
  lastMove?: MoveDetails | null;
  timestamp: number;
}

import {
  HealthResponse,
  EngineStatusResponse,
  GameResponse,
  AnalysisResponse,
  Color,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }
    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if ((err as Error)?.name === "AbortError") {
      throw err;
    }
    throw new ApiError(
      `Cannot connect to backend at ${API_BASE}. Please ensure the Python server is running.`,
      0
    );
  }
}

export const api = {
  getHealth: async (): Promise<HealthResponse> => {
    return request<HealthResponse>("/health");
  },

  getEngineStatus: async (): Promise<EngineStatusResponse> => {
    return request<EngineStatusResponse>("/engine/status");
  },

  newGame: async (playerColor: Color = "white", initialFen?: string): Promise<GameResponse> => {
    return request<GameResponse>("/game/new", {
      method: "POST",
      body: JSON.stringify({ player_color: playerColor, initial_fen: initialFen }),
    });
  },

  submitMove: async (fen: string, move: string, promotion?: string): Promise<GameResponse> => {
    return request<GameResponse>("/game/move", {
      method: "POST",
      body: JSON.stringify({ fen, move, promotion }),
    });
  },

  undoMove: async (history: string[], initialFen?: string): Promise<GameResponse> => {
    return request<GameResponse>("/game/undo", {
      method: "POST",
      body: JSON.stringify({ history, initial_fen: initialFen }),
    });
  },

  importFen: async (fen: string): Promise<GameResponse> => {
    return request<GameResponse>("/game/import-fen", {
      method: "POST",
      body: JSON.stringify({ fen }),
    });
  },

  importPgn: async (pgn: string): Promise<GameResponse> => {
    return request<GameResponse>("/game/import-pgn", {
      method: "POST",
      body: JSON.stringify({ pgn }),
    });
  },

  exportPgn: async (moves: string[], fen?: string, white?: string, black?: string): Promise<string> => {
    const params = new URLSearchParams();
    if (moves.length > 0) params.append("moves", moves.join(","));
    if (fen) params.append("fen", fen);
    if (white) params.append("white_player", white);
    if (black) params.append("black_player", black);

    const res = await request<{ pgn: string }>(`/game/export-pgn?${params.toString()}`);
    return res.pgn;
  },

  analyzePosition: async (
    fen: string,
    timeLimit: number = 1.0,
    depthLimit: number = 18,
    playerColor: Color = "white",
    signal?: AbortSignal
  ): Promise<AnalysisResponse> => {
    return request<AnalysisResponse>("/analysis", {
      method: "POST",
      body: JSON.stringify({
        fen,
        time_limit: timeLimit,
        depth_limit: depthLimit,
        multipv: 3,
        player_color: playerColor,
      }),
      signal,
    });
  },
};

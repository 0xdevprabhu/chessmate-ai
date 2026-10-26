import { AppSettings, SavedGameState } from "./types";

const SETTINGS_KEY = "chessmate_settings_v1";
const GAME_KEY = "chessmate_saved_game_v1";

export const DEFAULT_SETTINGS: AppSettings = {
  playerColor: "white",
  orientation: "auto",
  soundEnabled: true,
  showCoordinates: true,
  showLegalMoves: true,
  showBestMoveArrow: true,
  analysisTimeLimit: 1.0,
  analysisDepthLimit: 18,
  defaultHintLevel: 1,
  boardTheme: "charcoal",
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

export function clearSavedSettings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error("Failed to clear settings:", e);
  }
}

export function loadSavedGame(): SavedGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

export function clearSavedGame(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GAME_KEY);
  } catch (e) {
    console.error("Failed to clear game state:", e);
  }
}

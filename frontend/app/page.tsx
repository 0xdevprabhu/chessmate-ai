"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { ResponsiveLayout } from "../components/layout/ResponsiveLayout";
import { AppHeader } from "../components/layout/AppHeader";
import { PhysicalWorkflowGuide } from "../components/chess/PhysicalWorkflowGuide";
import { EvaluationBar } from "../components/chess/EvaluationBar";
import { ChessBoard } from "../components/chess/ChessBoard";
import { BoardControls } from "../components/chess/BoardControls";
import { MoveHistory } from "../components/chess/MoveHistory";
import { CapturedPieces } from "../components/chess/CapturedPieces";
import { AnalysisPanel } from "../components/chess/AnalysisPanel";
import { NewGameDialog } from "../components/dialogs/NewGameDialog";
import { PromotionDialog } from "../components/dialogs/PromotionDialog";
import { ImportPositionDialog } from "../components/dialogs/ImportPositionDialog";
import { SettingsDialog } from "../components/dialogs/SettingsDialog";
import { ToastContainer, ToastMessage } from "../components/ui/Toast";

import { api, ApiError } from "../lib/api";
import { sounds } from "../lib/sound";
import {
  loadSettings,
  saveSettings,
  loadSavedGame,
  saveGame,
  clearSavedGame,
} from "../lib/storage";
import {
  AppSettings,
  GameStatus,
  MoveDetails,
  CapturedPieces as ICapturedPieces,
  AnalysisResponse,
  EngineStatusResponse,
  Color,
  ArrowHint,
} from "../lib/types";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function ChessMateApp() {
  // Settings & Preferences
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Game State
  const [fen, setFen] = useState<string>(INITIAL_FEN);
  const [currentTurn, setCurrentTurn] = useState<Color>("white");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyFens, setHistoryFens] = useState<string[]>([INITIAL_FEN]);
  const [viewedMoveIndex, setViewedMoveIndex] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<MoveDetails | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    is_game_over: false,
    is_check: false,
    is_checkmate: false,
    is_stalemate: false,
    is_insufficient_material: false,
    is_seventyfive_moves: false,
    is_fivefold_repetition: false,
    status_text: "White to move.",
  });
  const [capturedPieces, setCapturedPieces] = useState<ICapturedPieces>({
    white: [],
    black: [],
    material_difference: 0,
  });

  // Engine & Analysis State
  const [engineStatus, setEngineStatus] = useState<EngineStatusResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<0 | 1 | 2 | 3>(0);

  // Dialogs State
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Abort controller ref to cancel stale engine analyses
  const analysisAbortController = useRef<AbortController | null>(null);

  const addToast = (type: ToastMessage["type"], title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize and check backend connection
  const checkHealthAndEngine = useCallback(async () => {
    try {
      const health = await api.getHealth();
      setBackendOnline(true);
      const eng = await api.getEngineStatus();
      setEngineStatus(eng);
    } catch (err: unknown) {
      setBackendOnline(false);
      setEngineStatus(null);
    }
  }, []);

  useEffect(() => {
    checkHealthAndEngine();
    // Load saved game if available
    const saved = loadSavedGame();
    if (saved && saved.fen && saved.historyFens?.length > 0) {
      setFen(saved.fen);
      setMoveHistory(saved.moveHistory || []);
      setHistoryFens(saved.historyFens || [INITIAL_FEN]);
      setViewedMoveIndex((saved.moveHistory?.length || 0) - 1);
      setLastMove(saved.lastMove || null);
      if (saved.playerColor) {
        setSettings((prev) => ({
          ...prev,
          playerColor: saved.playerColor,
          orientation: saved.playerColor,
        }));
      }
    }
  }, [checkHealthAndEngine]);

  // Request engine analysis for the current board position
  const triggerAnalysis = useCallback(
    async (targetFen: string, color: Color) => {
      // Abort any pending analysis request
      if (analysisAbortController.current) {
        analysisAbortController.current.abort();
      }
      const controller = new AbortController();
      analysisAbortController.current = controller;

      setIsAnalyzing(true);
      setAnalysisError(null);
      setActiveHintLevel(0);

      try {
        const result = await api.analyzePosition(
          targetFen,
          settings.analysisTimeLimit,
          settings.analysisDepthLimit,
          color,
          controller.signal
        );
        setAnalysis(result);
        setIsAnalyzing(false);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          // Stale analysis superseded by new move, do nothing
          return;
        }
        setIsAnalyzing(false);
        const errMsg = err instanceof ApiError ? err.message : "Failed to analyze position.";
        setAnalysisError(errMsg);
      }
    },
    [settings.analysisTimeLimit, settings.analysisDepthLimit]
  );

  // Trigger analysis whenever position changes
  useEffect(() => {
    triggerAnalysis(fen, settings.playerColor);
  }, [fen, settings.playerColor, triggerAnalysis]);

  // Update game state and persist locally
  const updateGameState = (
    newFen: string,
    newHistory: string[],
    newHistoryFens: string[],
    newLastMove: MoveDetails | null,
    newStatus: GameStatus,
    newCaptured: ICapturedPieces
  ) => {
    setFen(newFen);
    setMoveHistory(newHistory);
    setHistoryFens(newHistoryFens);
    setViewedMoveIndex(newHistory.length - 1);
    setLastMove(newLastMove);
    setGameStatus(newStatus);
    setCapturedPieces(newCaptured);

    // Derive current turn from FEN
    const turnChar = newFen.split(" ")[1];
    setCurrentTurn(turnChar === "b" ? "black" : "white");

    // Save game state
    saveGame({
      fen: newFen,
      playerColor: settings.playerColor,
      moveHistory: newHistory,
      historyFens: newHistoryFens,
      lastMove: newLastMove,
      timestamp: Date.now(),
    });
  };

  // Execute a chess move (UCI or SAN)
  const handleMakeMove = async (from: string, to: string, promotion?: string): Promise<boolean> => {
    // If currently viewing a historical move, branch the variation from that point
    let baseFen = fen;
    let baseHistory = [...moveHistory];
    let baseFens = [...historyFens];

    if (viewedMoveIndex >= -1 && viewedMoveIndex < moveHistory.length - 1) {
      const sliceIdx = viewedMoveIndex + 1;
      baseFens = baseFens.slice(0, sliceIdx + 1);
      baseHistory = baseHistory.slice(0, sliceIdx);
      baseFen = baseFens[baseFens.length - 1];
    }

    // Check if this move is actually a pawn promotion
    let promoChar: string | undefined = undefined;
    try {
      const chess = new Chess(baseFen);
      const piece = chess.get(from as any);
      if (piece && piece.type === "p") {
        if ((piece.color === "w" && to[1] === "8") || (piece.color === "b" && to[1] === "1")) {
          promoChar = promotion || "q";
        }
      }
    } catch {}

    const moveStr = promoChar ? `${from}${to}${promoChar}` : `${from}${to}`;

    try {
      const response = await api.submitMove(baseFen, moveStr, promoChar);

      // Play sound effects
      if (settings.soundEnabled) {
        if (response.status.is_checkmate || response.status.is_game_over) {
          sounds.playGameOver();
        } else if (response.status.is_check) {
          sounds.playCheck();
        } else if (response.last_move?.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }
      }

      const updatedHistory = [...baseHistory, response.last_move?.san || moveStr];
      const updatedFens = [...baseFens, response.fen];

      updateGameState(
        response.fen,
        updatedHistory,
        updatedFens,
        response.last_move || null,
        response.status,
        response.captured_pieces
      );

      return true;
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Illegal move.";
      addToast("warning", "Move Rejected", msg);
      return false;
    }
  };

  // Handle pawn promotion modal
  const handleRequestPromotion = (from: string, to: string) => {
    setPendingPromotion({ from, to });
  };

  const handleSelectPromotionPiece = async (piece: "q" | "r" | "b" | "n") => {
    if (pendingPromotion) {
      await handleMakeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  // Undo move
  const handleUndoMove = async () => {
    if (moveHistory.length === 0) return;

    try {
      const response = await api.undoMove(moveHistory);
      const updatedHistory = response.move_history;
      const updatedFens = historyFens.slice(0, -1);

      updateGameState(
        response.fen,
        updatedHistory,
        updatedFens,
        response.last_move || null,
        response.status,
        response.captured_pieces
      );
      addToast("info", "Move Undone", "Reverted to previous position.");
    } catch (err: unknown) {
      addToast("error", "Undo Failed", (err as Error).message);
    }
  };

  // Start new practice game
  const handleStartNewGame = async (selectedColor: Color) => {
    try {
      const response = await api.newGame(selectedColor);
      setSettings((prev) => {
        const updated: AppSettings = {
          ...prev,
          playerColor: selectedColor,
          orientation: selectedColor,
        };
        saveSettings(updated);
        return updated;
      });

      updateGameState(
        response.fen,
        [],
        [response.fen],
        null,
        response.status,
        response.captured_pieces
      );

      clearSavedGame();
      addToast("success", "New Game Started", `Playing as ${selectedColor}.`);
    } catch (err: unknown) {
      addToast("error", "Failed to start game", (err as Error).message);
    }
  };

  // Reset current board to starting position
  const handleResetBoard = () => {
    handleStartNewGame(settings.playerColor);
  };

  // Move history navigation
  const navigateToHistoryIndex = (index: number) => {
    if (index >= -1 && index < historyFens.length) {
      setViewedMoveIndex(index);
      const targetFen = index === -1 ? historyFens[0] : historyFens[index + 1];
      setFen(targetFen);
      const turnChar = targetFen.split(" ")[1];
      setCurrentTurn(turnChar === "b" ? "black" : "white");
    }
  };

  // Import FEN
  const handleImportFen = async (fenString: string): Promise<boolean> => {
    try {
      const response = await api.importFen(fenString);
      updateGameState(
        response.fen,
        [],
        [response.fen],
        null,
        response.status,
        response.captured_pieces
      );
      addToast("success", "Position Loaded", "Physical board position synchronized.");
      return true;
    } catch (err: unknown) {
      addToast("error", "Invalid FEN", (err as Error).message);
      return false;
    }
  };

  // Import PGN
  const handleImportPgn = async (pgnString: string): Promise<boolean> => {
    try {
      const response = await api.importPgn(pgnString);
      // Reconstruct FEN history through client-side chess
      const chess = new Chess();
      const newFens = [chess.fen()];
      for (const san of response.move_history) {
        chess.move(san);
        newFens.push(chess.fen());
      }

      updateGameState(
        response.fen,
        response.move_history,
        newFens,
        null,
        response.status,
        response.captured_pieces
      );
      addToast("success", "PGN Imported", `Loaded game with ${response.move_history.length} moves.`);
      return true;
    } catch (err: unknown) {
      addToast("error", "Invalid PGN", (err as Error).message);
      return false;
    }
  };

  // Export PGN
  const handleExportPgn = async () => {
    try {
      const pgn = await api.exportPgn(moveHistory, fen);
      // Create download blob
      const blob = new Blob([pgn], { type: "application/x-chess-pgn" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chessmate_session_${new Date().toISOString().slice(0, 10)}.pgn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("success", "PGN Exported", "Game record downloaded successfully.");
    } catch (err: unknown) {
      addToast("error", "Export Failed", (err as Error).message);
    }
  };

  // Determine board orientation
  const effectiveOrientation: "white" | "black" =
    settings.orientation === "auto" ? settings.playerColor : settings.orientation;

  // Toggle orientation
  const handleFlipOrientation = () => {
    setSettings((prev) => {
      const newOrient: "white" | "black" = effectiveOrientation === "white" ? "black" : "white";
      const updated: AppSettings = { ...prev, orientation: newOrient };
      saveSettings(updated);
      return updated;
    });
  };

  // Arrows & Highlights for hints
  let hintArrow: ArrowHint | null = null;
  let hintSquare: string | null = null;
  if (activeHintLevel === 1 && analysis?.hints.level1_square) {
    hintSquare = analysis.hints.level1_square;
  } else if (activeHintLevel === 2 && analysis?.hints.level2_arrow) {
    hintArrow = analysis.hints.level2_arrow;
  } else if (activeHintLevel === 3 && analysis?.hints) {
    hintArrow = {
      from_square: analysis.from_square,
      to_square: analysis.to_square,
    };
  }

  const bestMoveArrow: ArrowHint | null =
    analysis && analysis.from_square && analysis.to_square && !analysis.is_game_over
      ? { from_square: analysis.from_square, to_square: analysis.to_square }
      : null;

  return (
    <>
      <ResponsiveLayout
        header={
          <AppHeader
            engineStatus={engineStatus}
            backendOnline={backendOnline}
            onRefreshStatus={checkHealthAndEngine}
            onNewGame={() => setShowNewGameModal(true)}
            onOpenImport={() => setShowImportModal(true)}
            onExportPgn={handleExportPgn}
            onOpenSettings={() => setShowSettingsModal(true)}
            playerColor={settings.playerColor}
          />
        }
        workflowGuide={
          <PhysicalWorkflowGuide
            playerColor={settings.playerColor}
            currentTurn={currentTurn}
            gameStatus={gameStatus}
            bestMoveSan={analysis?.best_move_san}
            isAnalyzing={isAnalyzing}
          />
        }
        boardSection={
          <div
            className="glass-card"
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {/* Captured Pieces Bar */}
            <CapturedPieces captured={capturedPieces} />

            {/* Chessboard with Evaluation Bar */}
            <div style={{ display: "flex", alignItems: "stretch", gap: "0.75rem" }}>
              <EvaluationBar
                evaluation={analysis?.evaluation || "+0.00"}
                scorePawns={analysis?.score_pawns || 0}
                mate={analysis?.mate}
                sideToMove={currentTurn}
                orientation={effectiveOrientation}
                isVertical={true}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <ChessBoard
                  fen={fen}
                  orientation={effectiveOrientation}
                  showCoordinates={settings.showCoordinates}
                  showLegalMoves={settings.showLegalMoves}
                  showBestMoveArrow={settings.showBestMoveArrow}
                  bestMoveArrow={bestMoveArrow}
                  hintArrow={hintArrow}
                  hintSquare={hintSquare}
                  lastMove={lastMove}
                  isCheck={gameStatus.is_check}
                  boardTheme={settings.boardTheme}
                  onMakeMove={handleMakeMove}
                  onRequestPromotion={handleRequestPromotion}
                />
              </div>
            </div>

            {/* Board Controls Toolbar */}
            <BoardControls
              onFlipBoard={handleFlipOrientation}
              onUndoMove={handleUndoMove}
              onResetBoard={handleResetBoard}
              onAnalyzeNow={() => triggerAnalysis(fen, settings.playerColor)}
              onNavigateFirst={() => navigateToHistoryIndex(-1)}
              onNavigatePrev={() => navigateToHistoryIndex(viewedMoveIndex - 1)}
              onNavigateNext={() => navigateToHistoryIndex(viewedMoveIndex + 1)}
              onNavigateLatest={() => navigateToHistoryIndex(moveHistory.length - 1)}
              canUndo={moveHistory.length > 0}
              canNavigatePrev={viewedMoveIndex > -1}
              canNavigateNext={viewedMoveIndex < moveHistory.length - 1}
              isAnalyzing={isAnalyzing}
            />

            {/* Move History Table */}
            <MoveHistory
              moveHistory={moveHistory}
              currentMoveIndex={viewedMoveIndex}
              onSelectMove={navigateToHistoryIndex}
            />
          </div>
        }
        analysisSection={
          <AnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            activeHintLevel={activeHintLevel}
            onSelectHintLevel={setActiveHintLevel}
            playerColor={settings.playerColor}
            currentTurn={currentTurn}
          />
        }
      />

      {/* Dialogs */}
      <NewGameDialog
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        onStartGame={handleStartNewGame}
        hasActiveMoves={moveHistory.length > 0}
        currentColor={settings.playerColor}
      />

      <PromotionDialog
        isOpen={Boolean(pendingPromotion)}
        color={currentTurn}
        onSelectPiece={handleSelectPromotionPiece}
        onClose={() => setPendingPromotion(null)}
      />

      <ImportPositionDialog
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportFen={handleImportFen}
        onImportPgn={handleImportPgn}
      />

      <SettingsDialog
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClearSavedGame={() => {
          clearSavedGame();
          handleStartNewGame(settings.playerColor);
          setShowSettingsModal(false);
          addToast("info", "Data Cleared", "Saved game session has been reset.");
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

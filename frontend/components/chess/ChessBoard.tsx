import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Color, MoveDetails, ArrowHint } from "../../lib/types";

interface ChessBoardProps {
  fen: string;
  orientation: "white" | "black";
  showCoordinates: boolean;
  showLegalMoves: boolean;
  showBestMoveArrow: boolean;
  bestMoveArrow?: ArrowHint | null;
  hintArrow?: ArrowHint | null;
  hintSquare?: string | null;
  lastMove?: MoveDetails | null;
  isCheck: boolean;
  boardTheme: "charcoal" | "classic" | "wood" | "emerald";
  onMakeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  onRequestPromotion: (from: string, to: string) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation,
  showCoordinates,
  showLegalMoves,
  showBestMoveArrow,
  bestMoveArrow,
  hintArrow,
  hintSquare,
  lastMove,
  isCheck,
  boardTheme,
  onMakeMove,
  onRequestPromotion,
}) => {
  const [boardWidth, setBoardWidth] = useState<number>(480);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer to ensure board is always responsive and fits container width
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        // Limit max width for desktop aesthetics and ensure board doesn't overflow
        const newSize = Math.max(280, Math.min(width, 560));
        setBoardWidth(newSize);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Compute legal moves from current selected square using client-side chess.js
  const getLegalMovesForSquare = (square: string): string[] => {
    try {
      const chess = new Chess(fen);
      const moves = chess.moves({ square: square as any, verbose: true });
      return moves.map((m) => m.to);
    } catch {
      return [];
    }
  };

  // Find King square if currently in check
  const getKingInCheckSquare = (): string | null => {
    if (!isCheck) return null;
    try {
      const chess = new Chess(fen);
      const turn = chess.turn();
      const board = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === "k" && piece.color === turn) {
            return piece.square;
          }
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const kingCheckSquare = getKingInCheckSquare();
  const legalDestinations = selectedSquare && showLegalMoves ? getLegalMovesForSquare(selectedSquare) : [];

  // Handle Drag-and-Drop
  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (sourceSquare === targetSquare) return false;

    // Check for pawn promotion
    try {
      const chess = new Chess(fen);
      const piece = chess.get(sourceSquare as any);
      if (piece && piece.type === "p") {
        const targetRank = targetSquare[1];
        if ((piece.color === "w" && targetRank === "8") || (piece.color === "b" && targetRank === "1")) {
          // Check if valid destination
          const legal = getLegalMovesForSquare(sourceSquare);
          if (legal.includes(targetSquare)) {
            onRequestPromotion(sourceSquare, targetSquare);
            setSelectedSquare(null);
            return true;
          }
        }
      }
    } catch {
      // Ignore
    }

    // Normal move
    onMakeMove(sourceSquare, targetSquare);
    setSelectedSquare(null);
    return true;
  };

  // Handle Tap-to-Select and Tap-to-Move
  const handleSquareClick = (square: string) => {
    // If a square is already selected, try to move to this square
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // Check if clicked square is a legal destination
      const legal = getLegalMovesForSquare(selectedSquare);
      if (legal.includes(square)) {
        // Check promotion
        try {
          const chess = new Chess(fen);
          const piece = chess.get(selectedSquare as any);
          if (piece && piece.type === "p") {
            const targetRank = square[1];
            if ((piece.color === "w" && targetRank === "8") || (piece.color === "b" && targetRank === "1")) {
              onRequestPromotion(selectedSquare, square);
              setSelectedSquare(null);
              return;
            }
          }
        } catch {}

        onMakeMove(selectedSquare, square);
        setSelectedSquare(null);
        return;
      }
    }

    // Otherwise, select the clicked square if it contains a piece of the current turn
    try {
      const chess = new Chess(fen);
      const piece = chess.get(square as any);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    } catch {
      setSelectedSquare(null);
    }
  };

  // Build custom square styles
  const customSquareStyles: Record<string, React.CSSProperties> = {};

  // 1. Last move highlights (from and to)
  if (lastMove) {
    customSquareStyles[lastMove.from_square] = {
      backgroundColor: "rgba(212, 175, 55, 0.22)",
    };
    customSquareStyles[lastMove.to_square] = {
      backgroundColor: "rgba(212, 175, 55, 0.32)",
    };
  }

  // 2. Selected square highlight
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: "rgba(212, 175, 55, 0.45)",
      boxShadow: "inset 0 0 0 3px var(--accent-gold)",
    };
  }

  // 3. Hint square highlight (Gentle hint)
  if (hintSquare && !selectedSquare) {
    customSquareStyles[hintSquare] = {
      backgroundColor: "rgba(59, 130, 246, 0.35)",
      boxShadow: "inset 0 0 0 2px var(--accent-blue)",
    };
  }

  // 4. King in check highlight
  if (kingCheckSquare) {
    customSquareStyles[kingCheckSquare] = {
      backgroundColor: "rgba(239, 68, 68, 0.55)",
      boxShadow: "inset 0 0 0 3px #ef4444",
    };
  }

  // 5. Legal move indicators
  legalDestinations.forEach((dest) => {
    let hasPiece = false;
    try {
      const chess = new Chess(fen);
      hasPiece = Boolean(chess.get(dest as any));
    } catch {}

    customSquareStyles[dest] = {
      ...customSquareStyles[dest],
      background: hasPiece
        ? "radial-gradient(circle, rgba(212, 175, 55, 0.4) 80%, transparent 85%)"
        : "radial-gradient(circle, rgba(212, 175, 55, 0.6) 24%, transparent 26%)",
      borderRadius: "50%",
      cursor: "pointer",
    };
  });

  // Custom arrows
  const customArrows: [string, string, string?][] = [];
  if (showBestMoveArrow && bestMoveArrow?.from_square && bestMoveArrow?.to_square) {
    customArrows.push([
      bestMoveArrow.from_square,
      bestMoveArrow.to_square,
      "rgba(212, 175, 55, 0.85)", // Elegant Gold
    ]);
  }
  if (hintArrow?.from_square && hintArrow?.to_square) {
    customArrows.push([
      hintArrow.from_square,
      hintArrow.to_square,
      "rgba(59, 130, 246, 0.85)", // Radiant Blue
    ]);
  }

  // Theme colors
  const themeColors = {
    charcoal: { light: "#cfd3dc", dark: "#4a5263" },
    classic: { light: "#f0d9b5", dark: "#b58863" },
    wood: { light: "#e1be87", dark: "#8b5a2b" },
    emerald: { light: "#ffffdd", dark: "#4f7a55" },
  }[boardTheme];

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0.5rem 0",
      }}
    >
      <div
        style={{
          width: `${boardWidth}px`,
          height: `${boardWidth}px`,
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <Chessboard
          position={fen}
          boardOrientation={orientation}
          boardWidth={boardWidth}
          showBoardNotation={showCoordinates}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={customSquareStyles}
          customArrows={customArrows as any}
          customDarkSquareStyle={{ backgroundColor: themeColors.dark }}
          customLightSquareStyle={{ backgroundColor: themeColors.light }}
          animationDuration={200}
        />
      </div>
    </div>
  );
};

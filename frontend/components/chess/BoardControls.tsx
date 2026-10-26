import React from "react";
import {
  RotateCcw,
  Undo2,
  RefreshCw,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
} from "lucide-react";
import { Button } from "../ui/Button";

interface BoardControlsProps {
  onFlipBoard: () => void;
  onUndoMove: () => void;
  onResetBoard: () => void;
  onAnalyzeNow: () => void;
  onNavigateFirst: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateLatest: () => void;
  canUndo: boolean;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
  isAnalyzing: boolean;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  onFlipBoard,
  onUndoMove,
  onResetBoard,
  onAnalyzeNow,
  onNavigateFirst,
  onNavigatePrev,
  onNavigateNext,
  onNavigateLatest,
  canUndo,
  canNavigatePrev,
  canNavigateNext,
  isAnalyzing,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: "0.5rem 0",
      }}
    >
      {/* Navigation Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <Button
          variant="icon"
          onClick={onNavigateFirst}
          disabled={!canNavigatePrev}
          title="Jump to start"
          aria-label="Jump to start"
        >
          <ChevronsLeft size={16} />
        </Button>
        <Button
          variant="icon"
          onClick={onNavigatePrev}
          disabled={!canNavigatePrev}
          title="Previous move"
          aria-label="Previous move"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="icon"
          onClick={onNavigateNext}
          disabled={!canNavigateNext}
          title="Next move"
          aria-label="Next move"
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          variant="icon"
          onClick={onNavigateLatest}
          disabled={!canNavigateNext}
          title="Jump to latest position"
          aria-label="Jump to latest position"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onUndoMove}
          disabled={!canUndo}
          title="Undo last move"
        >
          <Undo2 size={14} />
          <span>Undo</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onFlipBoard}
          title="Flip board orientation"
        >
          <RotateCcw size={14} />
          <span>Flip</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onAnalyzeNow}
          loading={isAnalyzing}
          title="Request engine analysis for current position"
        >
          <Search size={14} />
          <span>Analyze</span>
        </Button>
      </div>
    </div>
  );
};

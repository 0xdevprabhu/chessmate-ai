import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Color } from "../../lib/types";

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (color: Color) => void;
  hasActiveMoves: boolean;
  currentColor?: Color;
}

export const NewGameDialog: React.FC<NewGameDialogProps> = ({
  isOpen,
  onClose,
  onStartGame,
  hasActiveMoves,
  currentColor = "white",
}) => {
  const [selectedColor, setSelectedColor] = useState<Color>(currentColor);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedColor(currentColor);
    }
  }, [isOpen, currentColor]);

  const handleConfirm = () => {
    onStartGame(selectedColor);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Practice Game"
      description="Select your playing color on the physical chessboard."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {hasActiveMoves && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fbbf24",
              fontSize: "0.825rem",
            }}
          >
            Starting a new game will reset the current board position and move history.
          </div>
        )}

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
            Choose Your Side:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setSelectedColor("white")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: selectedColor === "white" ? "var(--accent-gold-subtle)" : "var(--bg-surface)",
                border: selectedColor === "white" ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                color: selectedColor === "white" ? "var(--accent-gold)" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "2rem" }}>♔</span>
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Play White</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>You make the first move</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedColor("black")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: selectedColor === "black" ? "var(--accent-gold-subtle)" : "var(--bg-surface)",
                border: selectedColor === "black" ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                color: selectedColor === "black" ? "var(--accent-gold)" : "var(--text-primary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "2rem" }}>♚</span>
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Play Black</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Enter opponent's move first</span>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleConfirm}>
            Start Game
          </Button>
        </div>
      </div>
    </Modal>
  );
};

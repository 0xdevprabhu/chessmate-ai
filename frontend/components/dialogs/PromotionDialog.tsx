import React from "react";
import { Modal } from "../ui/Modal";
import { Color } from "../../lib/types";

interface PromotionDialogProps {
  isOpen: boolean;
  color: Color;
  onSelectPiece: (piece: "q" | "r" | "b" | "n") => void;
  onClose: () => void;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  isOpen,
  color,
  onSelectPiece,
  onClose,
}) => {
  const pieces = [
    { key: "q" as const, name: "Queen", whiteSymbol: "♕", blackSymbol: "♛" },
    { key: "r" as const, name: "Rook", whiteSymbol: "♖", blackSymbol: "♜" },
    { key: "b" as const, name: "Bishop", whiteSymbol: "♗", blackSymbol: "♝" },
    { key: "n" as const, name: "Knight", whiteSymbol: "♘", blackSymbol: "♞" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pawn Promotion"
      description="Choose a piece to promote your pawn to:"
      maxWidth="380px"
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
        {pieces.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              onSelectPiece(p.key);
            }}
            className="btn-secondary"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem 0.5rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "2.4rem", lineHeight: 1 }}>
              {color === "white" ? p.whiteSymbol : p.blackSymbol}
            </span>
            <span style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "var(--text-secondary)" }}>
              {p.name}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
};

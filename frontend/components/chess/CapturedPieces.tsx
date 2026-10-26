import React from "react";
import { CapturedPieces as ICapturedPieces } from "../../lib/types";

interface CapturedPiecesProps {
  captured: ICapturedPieces;
}

const PIECE_ICONS: Record<string, string> = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ captured }) => {
  const whiteLost = captured.white || [];
  const blackLost = captured.black || [];
  const diff = captured.material_difference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        padding: "0.4rem 0.75rem",
        borderRadius: "var(--radius-sm)",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        fontSize: "0.8rem",
      }}
    >
      {/* Black lost pieces (captured by White) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: "4px" }}>White +</span>
          {blackLost.map((p, idx) => (
            <span key={idx} style={{ fontSize: "1.1rem", lineHeight: 1, color: "#e2e8f0" }}>
              {PIECE_ICONS[p] || p}
            </span>
          ))}
        </div>
        {diff > 0 && (
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold)" }}>
            +{diff}
          </span>
        )}
      </div>

      {/* White lost pieces (captured by Black) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: "4px" }}>Black +</span>
          {whiteLost.map((p, idx) => (
            <span key={idx} style={{ fontSize: "1.1rem", lineHeight: 1, color: "#94a3b8" }}>
              {PIECE_ICONS[p] || p}
            </span>
          ))}
        </div>
        {diff < 0 && (
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold)" }}>
            +{Math.abs(diff)}
          </span>
        )}
      </div>
    </div>
  );
};

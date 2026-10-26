import React from "react";
import { User, Users, ChevronRight, CheckCircle, Sparkles } from "lucide-react";
import { Color, GameStatus } from "../../lib/types";

interface PhysicalWorkflowGuideProps {
  playerColor: Color;
  currentTurn: Color;
  gameStatus: GameStatus;
  bestMoveSan?: string;
  isAnalyzing: boolean;
}

export const PhysicalWorkflowGuide: React.FC<PhysicalWorkflowGuideProps> = ({
  playerColor,
  currentTurn,
  gameStatus,
  bestMoveSan,
  isAnalyzing,
}) => {
  const isMyTurn = playerColor === currentTurn;

  if (gameStatus.is_game_over) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: "rgba(212, 175, 55, 0.08)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <CheckCircle size={20} style={{ color: "var(--accent-gold)" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--accent-gold)" }}>
            {gameStatus.status_text}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Physical board session completed. You can start a new game or export the PGN.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        borderLeft: isMyTurn ? "4px solid var(--accent-gold)" : "4px solid var(--accent-blue)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isMyTurn ? "var(--accent-gold-subtle)" : "rgba(59, 130, 246, 0.12)",
            color: isMyTurn ? "var(--accent-gold)" : "var(--accent-blue)",
          }}
        >
          {isMyTurn ? <User size={18} /> : <Users size={18} />}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {isMyTurn ? "Your Turn" : "Opponent's Turn"}
            </span>
            <span
              className={isMyTurn ? "badge badge-gold" : "badge badge-gray"}
              style={{ textTransform: "capitalize" }}
            >
              {currentTurn} to move
            </span>
            {gameStatus.is_check && (
              <span className="badge badge-red">In Check</span>
            )}
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            {isMyTurn ? (
              bestMoveSan && !isAnalyzing ? (
                <span>
                  Recommended: <strong style={{ color: "var(--accent-gold)" }}>{bestMoveSan}</strong> — Play it on your board, then enter it here.
                </span>
              ) : isAnalyzing ? (
                <span className="animate-pulse-subtle">Engine calculating strongest move for you...</span>
              ) : (
                <span>Enter your physical move on the board to analyze.</span>
              )
            ) : (
              <span>Wait for opponent's physical move, then enter it on this screen.</span>
            )}
          </div>
        </div>
      </div>

      {isMyTurn && bestMoveSan && !isAnalyzing && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--accent-gold-subtle)",
            border: "1px solid rgba(212, 175, 55, 0.25)",
          }}
        >
          <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
          <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
            Engine recommends <strong style={{ color: "var(--accent-gold)", fontSize: "0.9rem" }}>{bestMoveSan}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

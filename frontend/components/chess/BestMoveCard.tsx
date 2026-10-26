import React from "react";
import { Sparkles, ArrowRight, Activity, Gauge } from "lucide-react";
import { AnalysisResponse } from "../../lib/types";

interface BestMoveCardProps {
  analysis: AnalysisResponse | null;
  isAnalyzing: boolean;
}

export const BestMoveCard: React.FC<BestMoveCardProps> = ({
  analysis,
  isAnalyzing,
}) => {
  if (isAnalyzing && !analysis) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "150px",
        }}
      >
        <span className="animate-pulse-subtle" style={{ color: "var(--accent-gold)", fontSize: "0.9rem" }}>
          Engine calculating best move...
        </span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "1.25rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        Play a move or click Analyze to receive Stockfish recommendations.
      </div>
    );
  }

  if (analysis.is_game_over) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "1.25rem",
          textAlign: "center",
          border: "1px solid rgba(212, 175, 55, 0.3)",
        }}
      >
        <h4 style={{ color: "var(--accent-gold)", fontSize: "1.1rem", fontWeight: 700 }}>
          {analysis.game_status || "Game Concluded"}
        </h4>
        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          {analysis.explanation}
        </p>
      </div>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        borderTop: "3px solid var(--accent-gold)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--accent-gold)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <Sparkles size={12} />
            Recommended Move
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginTop: "0.25rem" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {analysis.best_move_san}
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "monospace",
              }}
            >
              {analysis.from_square} <ArrowRight size={12} /> {analysis.to_square}
            </span>
          </div>
        </div>

        {/* Evaluation Score Badge */}
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              display: "block",
              textTransform: "uppercase",
            }}
          >
            Evaluation
          </span>
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: analysis.score_pawns >= 0 ? "var(--accent-gold)" : "#94a3b8",
            }}
          >
            {analysis.evaluation}
          </span>
        </div>
      </div>

      {/* Move Explanation */}
      <div
        style={{
          padding: "0.625rem 0.875rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.825rem",
          color: "var(--text-primary)",
          lineHeight: 1.45,
        }}
      >
        {analysis.explanation}
      </div>

      {/* Metadata bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.725rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.5rem",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <Gauge size={13} />
          Depth: <strong style={{ color: "var(--text-secondary)" }}>{analysis.depth}</strong>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <Activity size={13} />
          Time: <strong style={{ color: "var(--text-secondary)" }}>{analysis.duration_ms}ms</strong>
        </span>
        <span style={{ textTransform: "capitalize" }}>
          Side: <strong style={{ color: "var(--text-secondary)" }}>{analysis.side_to_move}</strong>
        </span>
      </div>
    </div>
  );
};

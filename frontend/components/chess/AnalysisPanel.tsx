import React from "react";
import { Sparkles, Layers, ListOrdered, AlertTriangle } from "lucide-react";
import { BestMoveCard } from "./BestMoveCard";
import { HintControls } from "./HintControls";
import { LoadingState } from "../ui/LoadingState";
import { AnalysisResponse, Color } from "../../lib/types";

interface AnalysisPanelProps {
  analysis: AnalysisResponse | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  activeHintLevel: 0 | 1 | 2 | 3;
  onSelectHintLevel: (level: 0 | 1 | 2 | 3) => void;
  playerColor: Color;
  currentTurn: Color;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  isAnalyzing,
  analysisError,
  activeHintLevel,
  onSelectHintLevel,
  playerColor,
  currentTurn,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {/* Engine Analysis Error Warning */}
      {analysisError && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "0.825rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={16} />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Best Move Card */}
      <BestMoveCard analysis={analysis} isAnalyzing={isAnalyzing} />

      {/* Progressive Hint System */}
      <HintControls
        hints={analysis?.hints || null}
        activeHintLevel={activeHintLevel}
        onSelectHintLevel={onSelectHintLevel}
        disabled={isAnalyzing || !analysis || analysis.is_game_over}
      />

      {/* Alternative Candidate Lines (Multi-PV) */}
      {analysis && analysis.alternative_lines && analysis.alternative_lines.length > 1 && (
        <div
          className="glass-card"
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Layers size={14} style={{ color: "var(--accent-gold)" }} />
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Alternative Candidate Lines
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {analysis.alternative_lines.map((line) => (
              <div
                key={line.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-surface-elevated)",
                  fontSize: "0.8rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "0.75rem" }}>
                    #{line.rank}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    {line.move_san}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    ({line.pv_san.slice(0, 4).join(" ")})
                  </span>
                </div>

                <span
                  style={{
                    fontWeight: 700,
                    color: line.evaluation.startsWith("+") ? "var(--accent-gold)" : "var(--text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  {line.evaluation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Principal Variation */}
      {analysis && analysis.pv_san && analysis.pv_san.length > 0 && !analysis.is_game_over && (
        <div
          className="glass-card"
          style={{
            padding: "0.875rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ListOrdered size={14} style={{ color: "var(--accent-gold)" }} />
            <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Principal Variation
            </h4>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              fontFamily: "monospace",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {analysis.pv_san.join("  ")}
          </div>
        </div>
      )}
    </div>
  );
};

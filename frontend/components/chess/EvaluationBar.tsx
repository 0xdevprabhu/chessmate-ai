import React from "react";

interface EvaluationBarProps {
  evaluation: string;
  scorePawns: number;
  mate?: number | null;
  sideToMove: "white" | "black";
  orientation: "white" | "black";
  isVertical?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  scorePawns,
  mate,
  orientation,
  isVertical = true,
}) => {
  // Compute percentage for White advantage
  // Max out at +/- 5 pawns (or 100 for mate)
  let whitePercent = 50;
  if (mate != null) {
    whitePercent = mate > 0 ? 100 : 0;
  } else {
    // Sigmoid-like or linear clamped conversion (-5 to +5 maps to 5% - 95%)
    const clamped = Math.max(-5, Math.min(5, scorePawns));
    whitePercent = 50 + (clamped / 5) * 45;
  }

  // If orientation is black, flip the bar so Black is on bottom
  const displayWhitePercent = orientation === "white" ? whitePercent : 100 - whitePercent;

  if (isVertical) {
    return (
      <div
        style={{
          width: "28px",
          height: "100%",
          minHeight: "420px",
          backgroundColor: "#1e222b",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          border: "1px solid var(--border-subtle)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        }}
        title={`Evaluation: ${evaluation} (White: ${whitePercent.toFixed(1)}%)`}
      >
        {/* White evaluation fill */}
        <div
          style={{
            height: `${displayWhitePercent}%`,
            backgroundColor: "#f3f5f8",
            width: "100%",
            transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Evaluation score label */}
        <div
          style={{
            position: "absolute",
            top: displayWhitePercent > 50 ? "auto" : "8px",
            bottom: displayWhitePercent > 50 ? "8px" : "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "0.65rem",
            fontWeight: 800,
            color: displayWhitePercent > 50 ? "#0d0f12" : "#f3f5f8",
            pointerEvents: "none",
            transform: "rotate(0deg)",
            letterSpacing: "-0.02em",
          }}
        >
          {evaluation}
        </div>
      </div>
    );
  }

  // Horizontal bar for compact or mobile view
  return (
    <div
      style={{
        width: "100%",
        height: "14px",
        backgroundColor: "#1e222b",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        position: "relative",
        border: "1px solid var(--border-subtle)",
      }}
      title={`Evaluation: ${evaluation}`}
    >
      <div
        style={{
          width: `${displayWhitePercent}%`,
          height: "100%",
          backgroundColor: "#f3f5f8",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "8px",
          display: "flex",
          alignItems: "center",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: displayWhitePercent > 20 ? "#0d0f12" : "#f3f5f8",
        }}
      >
        {evaluation}
      </div>
    </div>
  );
};

import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Analyzing position with Stockfish...",
  size = "md",
}) => {
  const sizePx = { sm: 20, md: 32, lg: 48 }[size];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "1rem",
        color: "var(--text-muted)",
      }}
    >
      <svg
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          animation: "spin 1s linear infinite",
          color: "var(--accent-gold)",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="15" />
      </svg>
      {message && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );
};

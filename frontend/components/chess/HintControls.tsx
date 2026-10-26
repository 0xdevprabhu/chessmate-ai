import React from "react";
import { HelpCircle, Eye, Compass, Lightbulb } from "lucide-react";
import { HintInfo } from "../../lib/types";

interface HintControlsProps {
  hints: HintInfo | null;
  activeHintLevel: 0 | 1 | 2 | 3;
  onSelectHintLevel: (level: 0 | 1 | 2 | 3) => void;
  disabled: boolean;
}

export const HintControls: React.FC<HintControlsProps> = ({
  hints,
  activeHintLevel,
  onSelectHintLevel,
  disabled,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "0.875rem 1rem",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Lightbulb size={15} style={{ color: "var(--accent-gold)" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Assistance Hints
          </span>
        </div>
        {activeHintLevel > 0 && (
          <button
            onClick={() => onSelectHintLevel(0)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Clear hint
          </button>
        )}
      </div>

      {/* 3 Level Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
        <button
          type="button"
          disabled={disabled || !hints}
          onClick={() => onSelectHintLevel(activeHintLevel === 1 ? 0 : 1)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.5rem 0.25rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeHintLevel === 1 ? "rgba(59, 130, 246, 0.15)" : "var(--bg-surface-elevated)",
            border: activeHintLevel === 1 ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
            color: activeHintLevel === 1 ? "var(--accent-blue)" : "var(--text-secondary)",
            cursor: disabled || !hints ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
            opacity: disabled || !hints ? 0.4 : 1,
          }}
        >
          <HelpCircle size={14} />
          <span>1. Gentle</span>
        </button>

        <button
          type="button"
          disabled={disabled || !hints}
          onClick={() => onSelectHintLevel(activeHintLevel === 2 ? 0 : 2)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.5rem 0.25rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeHintLevel === 2 ? "rgba(245, 158, 11, 0.15)" : "var(--bg-surface-elevated)",
            border: activeHintLevel === 2 ? "1px solid var(--accent-amber)" : "1px solid var(--border-subtle)",
            color: activeHintLevel === 2 ? "var(--accent-amber)" : "var(--text-secondary)",
            cursor: disabled || !hints ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
            opacity: disabled || !hints ? 0.4 : 1,
          }}
        >
          <Compass size={14} />
          <span>2. Direction</span>
        </button>

        <button
          type="button"
          disabled={disabled || !hints}
          onClick={() => onSelectHintLevel(activeHintLevel === 3 ? 0 : 3)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.5rem 0.25rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeHintLevel === 3 ? "var(--accent-gold-subtle)" : "var(--bg-surface-elevated)",
            border: activeHintLevel === 3 ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
            color: activeHintLevel === 3 ? "var(--accent-gold)" : "var(--text-secondary)",
            cursor: disabled || !hints ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
            opacity: disabled || !hints ? 0.4 : 1,
          }}
        >
          <Eye size={14} />
          <span>3. Full Move</span>
        </button>
      </div>

      {/* Active Hint Description Card */}
      {activeHintLevel > 0 && hints && (
        <div
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-surface-elevated)",
            borderLeft: `3px solid ${
              activeHintLevel === 1
                ? "var(--accent-blue)"
                : activeHintLevel === 2
                ? "var(--accent-amber)"
                : "var(--accent-gold)"
            }`,
            fontSize: "0.8rem",
            color: "var(--text-primary)",
            lineHeight: 1.4,
          }}
        >
          {activeHintLevel === 1 && hints.level1_gentle}
          {activeHintLevel === 2 && hints.level2_direction}
          {activeHintLevel === 3 && hints.level3_full}
        </div>
      )}
    </div>
  );
};

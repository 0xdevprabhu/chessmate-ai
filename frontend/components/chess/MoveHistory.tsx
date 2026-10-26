import React, { useEffect, useRef } from "react";
import { History } from "lucide-react";
import { Card } from "../ui/Card";

interface MoveHistoryProps {
  moveHistory: string[];
  currentMoveIndex: number; // -1 for start position, 0 for move 1 White, 1 for move 1 Black, etc.
  onSelectMove: (index: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveHistory,
  currentMoveIndex,
  onSelectMove,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  // Group moves into pairs: [ { moveNum: 1, white: "e4", black: "e5" }, ... ]
  const pairs: { moveNum: number; white?: string; black?: string; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < moveHistory.length ? i + 1 : undefined,
    });
  }

  // Scroll active move into view smoothly
  useEffect(() => {
    if (activeMoveRef.current) {
      activeMoveRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentMoveIndex]);

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <History size={15} style={{ color: "var(--accent-gold)" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Move History</span>
          <span className="badge badge-gray" style={{ fontSize: "0.7rem", marginLeft: "auto" }}>
            {moveHistory.length} ply
          </span>
        </div>
      }
      style={{ padding: "0.75rem 1rem" }}
    >
      <div
        ref={scrollRef}
        style={{
          maxHeight: "180px",
          minHeight: "110px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          paddingRight: "0.25rem",
        }}
      >
        {pairs.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            No moves recorded yet. Enter moves on the board.
          </div>
        ) : (
          pairs.map((p) => {
            const isWhiteActive = currentMoveIndex === p.whiteIdx;
            const isBlackActive = p.blackIdx !== undefined && currentMoveIndex === p.blackIdx;

            return (
              <div
                key={p.moveNum}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr 1fr",
                  alignItems: "center",
                  fontSize: "0.825rem",
                  padding: "2px 0",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: p.moveNum % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                }}
              >
                {/* Move Number */}
                <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.75rem" }}>
                  {p.moveNum}.
                </span>

                {/* White Move */}
                <button
                  ref={isWhiteActive ? activeMoveRef : undefined}
                  onClick={() => onSelectMove(p.whiteIdx)}
                  style={{
                    textAlign: "left",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    backgroundColor: isWhiteActive ? "var(--accent-gold-subtle)" : "transparent",
                    color: isWhiteActive ? "var(--accent-gold)" : "var(--text-primary)",
                    fontWeight: isWhiteActive ? 700 : 500,
                    cursor: "pointer",
                    outline: isWhiteActive ? "1px solid var(--accent-gold)" : "none",
                  }}
                >
                  {p.white}
                </button>

                {/* Black Move */}
                {p.black && p.blackIdx !== undefined ? (
                  <button
                    ref={isBlackActive ? activeMoveRef : undefined}
                    onClick={() => onSelectMove(p.blackIdx!)}
                    style={{
                      textAlign: "left",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      backgroundColor: isBlackActive ? "var(--accent-gold-subtle)" : "transparent",
                      color: isBlackActive ? "var(--accent-gold)" : "var(--text-primary)",
                      fontWeight: isBlackActive ? 700 : 500,
                      cursor: "pointer",
                      outline: isBlackActive ? "1px solid var(--accent-gold)" : "none",
                    }}
                  >
                    {p.black}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

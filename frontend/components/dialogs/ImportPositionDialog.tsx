import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface ImportPositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFen: (fen: string) => Promise<boolean>;
  onImportPgn: (pgn: string) => Promise<boolean>;
}

export const ImportPositionDialog: React.FC<ImportPositionDialogProps> = ({
  isOpen,
  onClose,
  onImportFen,
  onImportPgn,
}) => {
  const [activeTab, setActiveTab] = useState<"fen" | "pgn">("fen");
  const [fenInput, setFenInput] = useState("");
  const [pgnInput, setPgnInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fenInput.trim()) {
      setError("Please enter a valid FEN string.");
      return;
    }
    setLoading(true);
    const success = await onImportFen(fenInput.trim());
    setLoading(false);
    if (success) {
      setFenInput("");
      onClose();
    }
  };

  const handlePgnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pgnInput.trim()) {
      setError("Please enter valid PGN text.");
      return;
    }
    setLoading(true);
    const success = await onImportPgn(pgnInput.trim());
    setLoading(false);
    if (success) {
      setPgnInput("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Position or Game"
      description="Synchronize a physical board position using FEN or replay a PGN game."
      maxWidth="560px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
          <button
            type="button"
            onClick={() => { setActiveTab("fen"); setError(null); }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: activeTab === "fen" ? "var(--bg-surface-hover)" : "transparent",
              color: activeTab === "fen" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Import FEN Position
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("pgn"); setError(null); }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: activeTab === "pgn" ? "var(--bg-surface-hover)" : "transparent",
              color: activeTab === "pgn" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Import PGN Game
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.825rem",
            }}
          >
            {error}
          </div>
        )}

        {activeTab === "fen" ? (
          <form onSubmit={handleFenSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Forsyth-Edwards Notation (FEN):
              </label>
              <input
                type="text"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={loading}>
                Load Position
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePgnSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Portable Game Notation (PGN):
              </label>
              <textarea
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="gold" type="submit" loading={loading}>
                Import PGN
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

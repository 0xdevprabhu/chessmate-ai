import React from "react";
import {
  RotateCcw,
  PlusCircle,
  Upload,
  Download,
  Settings as SettingsIcon,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/Button";
import { EngineStatusResponse, Color } from "../../lib/types";

interface AppHeaderProps {
  engineStatus: EngineStatusResponse | null;
  backendOnline: boolean;
  onRefreshStatus: () => void;
  onNewGame: () => void;
  onOpenImport: () => void;
  onExportPgn: () => void;
  onOpenSettings: () => void;
  playerColor: Color;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  engineStatus,
  backendOnline,
  onRefreshStatus,
  onNewGame,
  onOpenImport,
  onExportPgn,
  onOpenSettings,
  playerColor,
}) => {
  return (
    <header
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "0.75rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, #d4af37 0%, #9a7b1c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3)",
          }}
        >
          <span style={{ fontSize: "1.4rem", color: "#0d0f12", fontWeight: "bold" }}>♞</span>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              ChessMate AI
            </h1>
            <span className="badge badge-gold">Physical Board</span>
          </div>
          <p style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
            Personal Chess Analysis Assistant
          </p>
        </div>
      </div>

      {/* Engine Status Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {backendOnline && engineStatus?.ready ? (
          <div
            className="badge badge-green"
            title={`Stockfish ready (Depth ${engineStatus.default_depth})`}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
            onClick={onRefreshStatus}
          >
            <Cpu size={13} />
            <span>Stockfish Active</span>
          </div>
        ) : backendOnline ? (
          <div
            className="badge badge-gray"
            title="Stockfish executable missing or not initialized"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
            onClick={onRefreshStatus}
          >
            <Cpu size={13} />
            <span>Engine Inactive</span>
          </div>
        ) : (
          <button
            onClick={onRefreshStatus}
            className="badge badge-red"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", border: "1px solid rgba(239, 68, 68, 0.4)" }}
            title="Backend disconnected. Click to retry connection."
          >
            <RefreshCw size={12} />
            <span>Backend Offline - Retry</span>
          </button>
        )}

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-surface-elevated)",
            padding: "0.3rem 0.6rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          Playing as: <strong style={{ color: "var(--accent-gold)", textTransform: "capitalize" }}>{playerColor}</strong>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Button variant="gold" size="sm" onClick={onNewGame}>
          <PlusCircle size={15} />
          <span>New Game</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onOpenImport} title="Import FEN or PGN">
          <Upload size={14} />
          <span>Import</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onExportPgn} title="Export Game PGN">
          <Download size={14} />
          <span>PGN</span>
        </Button>

        <Button variant="icon" size="sm" onClick={onOpenSettings} aria-label="Open settings">
          <SettingsIcon size={16} />
        </Button>
      </div>
    </header>
  );
};

import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AppSettings, Color } from "../../lib/types";
import { DEFAULT_SETTINGS } from "../../lib/storage";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearSavedGame: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearSavedGame,
}) => {
  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Preferences"
      description="Customize board appearance, engine behavior, and practice options."
      maxWidth="580px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "70vh", overflowY: "auto", paddingRight: "0.25rem" }}>
        {/* Practice Preferences */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Practice Mode
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.825rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.35rem" }}>
                Player Color
              </label>
              <select
                value={settings.playerColor}
                onChange={(e) => {
                  const newColor = e.target.value as Color;
                  onUpdateSettings({
                    ...settings,
                    playerColor: newColor,
                    orientation: newColor,
                  });
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.825rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.35rem" }}>
                Board Orientation
              </label>
              <select
                value={settings.orientation}
                onChange={(e) => update("orientation", e.target.value as "white" | "black" | "auto")}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              >
                <option value="auto">Auto (Follows Player Color)</option>
                <option value="white">White at Bottom</option>
                <option value="black">Black at Bottom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Engine Settings */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Stockfish Engine Limits
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                <span>Analysis Time Limit</span>
                <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>{settings.analysisTimeLimit}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={settings.analysisTimeLimit}
                onChange={(e) => update("analysisTimeLimit", parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-gold)" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                <span>Search Depth Limit</span>
                <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>{settings.analysisDepthLimit} plies</span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={settings.analysisDepthLimit}
                onChange={(e) => update("analysisDepthLimit", parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-gold)" }}
              />
            </div>
          </div>
        </div>

        {/* Visual & Audio Toggles */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Display & Sound
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => update("soundEnabled", e.target.checked)}
                style={{ accentColor: "var(--accent-gold)", width: "16px", height: "16px" }}
              />
              Sound Effects
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.showCoordinates}
                onChange={(e) => update("showCoordinates", e.target.checked)}
                style={{ accentColor: "var(--accent-gold)", width: "16px", height: "16px" }}
              />
              Board Coordinates
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.showLegalMoves}
                onChange={(e) => update("showLegalMoves", e.target.checked)}
                style={{ accentColor: "var(--accent-gold)", width: "16px", height: "16px" }}
              />
              Legal Move Highlights
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.showBestMoveArrow}
                onChange={(e) => update("showBestMoveArrow", e.target.checked)}
                style={{ accentColor: "var(--accent-gold)", width: "16px", height: "16px" }}
              />
              Best Move Arrow
            </label>
          </div>
        </div>

        {/* Board Theme */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <label style={{ fontSize: "0.825rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
            Board Color Theme
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
            {[
              { id: "charcoal", name: "Charcoal", light: "#cfd3dc", dark: "#4a5263" },
              { id: "classic", name: "Classic", light: "#f0d9b5", dark: "#b58863" },
              { id: "wood", name: "Walnut", light: "#e1be87", dark: "#8b5a2b" },
              { id: "emerald", name: "Emerald", light: "#ffffdd", dark: "#4f7a55" },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => update("boardTheme", th.id as AppSettings["boardTheme"])}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  border: settings.boardTheme === th.id ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", width: "24px", height: "24px", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
                  <div style={{ width: "12px", height: "24px", backgroundColor: th.light }} />
                  <div style={{ width: "12px", height: "24px", backgroundColor: th.dark }} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{th.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Persistence Actions */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to clear locally saved game moves and analysis?")) {
                onClearSavedGame();
              }
            }}
          >
            Clear Saved Game Data
          </Button>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Reset Defaults
          </Button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <Button variant="gold" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

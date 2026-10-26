import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "380px",
        width: "calc(100vw - 3rem)",
      }}
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 size={18} style={{ color: "var(--accent-green)" }} />,
          warning: <AlertTriangle size={18} style={{ color: "var(--accent-amber)" }} />,
          error: <AlertCircle size={18} style={{ color: "var(--accent-red)" }} />,
          info: <Info size={18} style={{ color: "var(--accent-blue)" }} />,
        };

        const borderColors = {
          success: "rgba(16, 185, 129, 0.4)",
          warning: "rgba(245, 158, 11, 0.4)",
          error: "rgba(239, 68, 68, 0.4)",
          info: "rgba(59, 130, 246, 0.4)",
        };

        return (
          <div
            key={toast.id}
            className="glass-card"
            style={{
              padding: "0.875rem 1rem",
              backgroundColor: "var(--bg-surface-elevated)",
              border: `1px solid ${borderColors[toast.type]}`,
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ marginTop: "2px" }}>{icons[toast.type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="btn-icon"
              style={{ width: "24px", height: "24px", border: "none", background: "transparent" }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

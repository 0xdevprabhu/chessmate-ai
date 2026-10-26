import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "secondary" | "icon" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  let baseClass = "btn-secondary";
  if (variant === "gold") baseClass = "btn-gold";
  else if (variant === "icon") baseClass = "btn-icon";
  else if (variant === "danger") baseClass = "btn-secondary border-red-500/40 text-red-400 hover:bg-red-500/10";
  else if (variant === "ghost") baseClass = "bg-transparent border-none text-gray-400 hover:text-white";

  const sizeStyles = {
    sm: { padding: "0.4rem 0.75rem", fontSize: "0.8rem" },
    md: {},
    lg: { padding: "0.8rem 1.5rem", fontSize: "1rem" },
  }[size];

  return (
    <button
      className={`${baseClass} ${className}`}
      style={variant !== "icon" ? sizeStyles : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <svg
            style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
          {typeof children === "string" ? "Loading..." : children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

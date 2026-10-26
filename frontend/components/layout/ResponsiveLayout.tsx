import React from "react";

interface ResponsiveLayoutProps {
  header: React.ReactNode;
  workflowGuide: React.ReactNode;
  boardSection: React.ReactNode;
  analysisSection: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  header,
  workflowGuide,
  boardSection,
  analysisSection,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {header}

      <main
        style={{
          flex: 1,
          maxWidth: "1380px",
          width: "100%",
          margin: "0 auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {workflowGuide}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 540px), 1fr))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: Board, Controls, Move History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
            {boardSection}
          </div>

          {/* Right Column: Analysis, Recommended Move, Hints */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
            {analysisSection}
          </div>
        </div>
      </main>
    </div>
  );
};

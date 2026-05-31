import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#1e293b",
          margin: 0,
          paddingBottom: "8px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {title}
      </h2>
      <div style={{ height: "220px", width: "100%", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
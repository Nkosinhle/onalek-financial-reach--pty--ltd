"use client";

export default function AdminNav() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 24px",
        borderBottom: "1px solid #eee",
        fontFamily: "sans-serif",
      }}
    >
      <a href="/admin" style={linkStyle}>Admin Home</a>
      <a href="/admin/dashboard" style={linkStyle}>Dashboard</a>
      <a href="/dashboard" style={linkStyle}>User Dashboard</a>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  fontWeight: 700,
};
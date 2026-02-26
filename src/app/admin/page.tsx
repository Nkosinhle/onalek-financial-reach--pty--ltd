"use client";

export default function AdminHomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 800 }}>
      <h1>Admin</h1>
      <p>Welcome to the admin panel.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <a
          href="/admin/dashboard"
          style={cardStyle}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Dashboard</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            View applications and counts
          </div>
        </a>

        <a
          href="/admin/dashboard"
          style={cardStyle}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>Applications</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Review and update applications
          </div>
        </a>
      </div>

      <div style={{ marginTop: 18 }}>
        <a href="/dashboard">Go to user dashboard →</a>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  width: 280,
  textDecoration: "none",
  color: "inherit",
};
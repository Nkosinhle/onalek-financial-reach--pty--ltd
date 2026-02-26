"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";

type Status = "PENDING" | "APPROVED" | "DECLINED" | "NEEDS_INFO";

type AppRow = {
  id: string;
  fullName: string;
  saIdNumber: string;
  amountRequested: number;
  repayDays: number;
  status: Status;
  createdAt: string;
  user: { email: string };
};

type Metrics = {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  needsInfo: number;
  thisWeek: number;
};

export default function AdminDashboardPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsErr, setMetricsErr] = useState("");

  async function loadApps() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/applications");
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setErr(data?.error || raw || "Failed to load applications");
      setLoading(false);
      return;
    }

    setApps(data?.applications || []);
    setLoading(false);
  }

  async function loadMetrics() {
    setMetricsErr("");

    const res = await fetch("/api/admin/metrics");
    const raw = await res.text();

    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMetricsErr(data?.error || raw || "Failed to load metrics");
      return;
    }

    setMetrics(data as Metrics);
  }

  async function refreshAll() {
    await Promise.all([loadApps(), loadMetrics()]);
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <AdminNav />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Metrics + applications list.
          </div>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          style={{ padding: "10px 12px", cursor: "pointer" }}
        >
          Refresh
        </button>
      </div>

      {/* ✅ Metrics cards (NO duplicates) */}
      {metrics ? (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <MetricCard title="Total" value={metrics.total} />
          <MetricCard title="Pending" value={metrics.pending} />
          <MetricCard title="Approved" value={metrics.approved} />
          <MetricCard title="Declined" value={metrics.declined} />
          <MetricCard title="Needs info" value={metrics.needsInfo} />
          <MetricCard title="This week" value={metrics.thisWeek} />
        </div>
      ) : (
        <div style={{ marginTop: 16, opacity: 0.8 }}>
          {metricsErr ? (
            <span style={{ color: "salmon" }}>{metricsErr}</span>
          ) : (
            "Loading metrics..."
          )}
        </div>
      )}

      {loading ? <p style={{ marginTop: 16 }}>Loading applications...</p> : null}
      {err ? (
        <p style={{ color: "salmon", marginTop: 16 }}>{err}</p>
      ) : null}

      <div
  className="card"
  style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 14,
  }}
>
  <div style={{ fontWeight: 900, marginBottom: 6 }}>Compliance</div>
  <div style={{ opacity: 0.9, lineHeight: 1.5, fontSize: 14 }}>
    Uploaded documents are retained for compliance, audit, and fraud-prevention purposes in accordance
    with Onalek Financial Reach (PTY) LTD policies. Access is restricted to authorized personnel only.
  </div>
  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
    POPIA note: Users may request access/correction/deletion where legally permissible (see Privacy page).
  </div>
</div>

      <h2 style={{ marginTop: 22 }}>Applications</h2>

      {/* ✅ Better table layout: no squashing + scroll if needed */}
      <div style={{ borderRadius: 12 }}>
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              minWidth: 1100, // important: prevents squashing
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* header */}
            <div
              style={{
                display: "grid",
                gap: 10,
                alignItems: "center",
                padding: 12,
                fontWeight: 700,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                gridTemplateColumns:
                  "minmax(180px, 1.2fr) minmax(260px, 1.6fr) minmax(200px, 1.2fr) minmax(120px, 0.8fr) minmax(90px, 0.6fr) minmax(140px, 0.9fr)",
              }}
            >
              <div>Name</div>
              <div>Email</div>
              <div>SA ID</div>
              <div>Amount</div>
              <div>Term</div>
              <div>Status</div>
            </div>

            {/* rows */}
            {apps.map((a) => (
              <a
                key={a.id}
                href={`/admin/applications/${a.id}`}
                style={{
                  display: "grid",
                  gap: 10,
                  alignItems: "center",
                  padding: 12,
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  gridTemplateColumns:
                    "minmax(180px, 1.2fr) minmax(260px, 1.6fr) minmax(200px, 1.2fr) minmax(120px, 0.8fr) minmax(90px, 0.6fr) minmax(140px, 0.9fr)",
                }}
              >
                <Cell title={a.fullName}>{a.fullName}</Cell>

                <Cell title={a.user?.email} dim>
                  {a.user?.email}
                </Cell>

                {/* SA ID: monospace, readable, tooltip, ellipsis */}
                <Cell mono title={a.saIdNumber}>
                  {a.saIdNumber}
                </Cell>

                <Cell title={`R${a.amountRequested}`}>
                  R{a.amountRequested}
                </Cell>

                <Cell
                  title={`${a.repayDays} ${a.repayDays === 1 ? "day" : "days"}`}
                >
                  {a.repayDays} {a.repayDays === 1 ? "day" : "days"}
                </Cell>

                <Cell title={a.status} strong>
                  {a.status}
                </Cell>
              </a>
            ))}

            {!loading && apps.length === 0 ? (
              <div style={{ padding: 12 }}>No applications yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        Back: <a href="/admin">Admin Home</a>
      </p>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}

function Cell({
  children,
  title,
  mono,
  dim,
  strong,
}: {
  children: React.ReactNode;
  title?: string;
  mono?: boolean;
  dim?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      title={title}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: mono
          ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          : undefined,
        opacity: dim ? 0.85 : 0.95,
        fontWeight: strong ? 800 : undefined,
      }}
    >
      {children}
    </div>
  );
}
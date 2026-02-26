"use client";

import { useEffect, useState } from "react";

type Status = "PENDING" | "APPROVED" | "DECLINED" | "NEEDS_INFO";

type App = {
  id: string;
  fullName: string;
  saIdNumber: string;
  amountRequested: number;
  repayDays: number;
  status: Status;
  adminNotes?: string | null;
  clientMessage?: string | null;
  createdAt: string;
  docsUpdatedAt?: string | null;
  reviewedAt?: string | null;
  decisionAt?: string | null;
};

function badgeForStatus(status: Status) {
  if (status === "APPROVED") return "badge badgeGreen";
  if (status === "DECLINED") return "badge badgeRed";
  if (status === "NEEDS_INFO") return "badge badgeBlue";
  return "badge badgeBlue";
}

function labelForStatus(status: Status) {
  if (status === "PENDING") return "Pending review";
  if (status === "NEEDS_INFO") return "Needs more info";
  if (status === "APPROVED") return "Approved";
  return "Declined";
}

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [app, setApp] = useState<App | null>(null);
  const [history, setHistory] = useState<App[]>([]);

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/me/application/history");
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        setMsg("You are not logged in (or the API returned HTML). Please sign in, then refresh.");
      } else {
        setMsg(data?.error || "Failed to load status");
      }
      setLoading(false);
      return;
}

    setApp(data?.application || null);
    setHistory(data?.history || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="card" style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>Status</h1>
            <p className="help" style={{ marginTop: 6 }}>
              Track your latest application and view recent history.
            </p>
          </div>

          <div className="row">
            <button className="btn" type="button" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <a className="btn" href="/apply">
              New application
            </a>
          </div>
        </div>

        <div className="hr" style={{ marginTop: 12 }} />

        {loading ? <p className="help">Loading...</p> : null}
        {msg ? (
          <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ fontWeight: 900 }}>Message</div>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{msg}</div>
          </div>
        ) : null}

        {!loading && !app ? (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="badge badgeRed" style={{ width: "fit-content" }}>
              No application found
            </div>
            <h2 style={{ marginTop: 10 }}>You haven’t submitted an application yet</h2>
            <p className="help">Go to Apply, submit your details, then upload documents.</p>
            <div className="row" style={{ marginTop: 10 }}>
              <a className="btn btnPrimary" href="/apply">
                Go to Apply
              </a>
              <a className="btn" href="/">
                Back home
              </a>
            </div>
          </div>
        ) : null}

        {app ? (
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div className={badgeForStatus(app.status)}>{labelForStatus(app.status)}</div>
                <h2 style={{ marginTop: 10, marginBottom: 0 }}>Latest application</h2>
                <div className="help" style={{ marginTop: 6 }}>
                  Application ID: <span style={{ fontFamily: "monospace" }}>{app.id}</span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="help">Amount</div>
                <div style={{ fontSize: 22, fontWeight: 1000 }}>R{app.amountRequested}</div>
                <div className="help">Term: {app.repayDays} days</div>
              </div>
            </div>

            <div className="hr" style={{ marginTop: 12, marginBottom: 12 }} />

            <div className="grid2">
              <div>
                <div className="help">Full name</div>
                <div style={{ fontWeight: 900 }}>{app.fullName}</div>
              </div>
              <div>
                <div className="help">SA ID</div>
                <div style={{ fontFamily: "monospace" }}>{app.saIdNumber}</div>
              </div>
              <div>
                <div className="help">Created</div>
                <div>{new Date(app.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="help">Documents last updated</div>
                <div>{app.docsUpdatedAt ? new Date(app.docsUpdatedAt).toLocaleString() : "never"}</div>
              </div>
              <div>
                <div className="help">Last reviewed</div>
                <div>{app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : "not yet"}</div>
              </div>
              <div>
                <div className="help">Decision date</div>
                <div>{app.decisionAt ? new Date(app.decisionAt).toLocaleString() : "not yet"}</div>
              </div>
            </div>

            {(app.clientMessage || app.adminNotes) ? (
              <div className="card" style={{ marginTop: 12, background: "rgba(255,255,255,0.04)" }}>
                <div style={{ fontWeight: 1000 }}>Message from admin</div>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {app.clientMessage || app.adminNotes}
                </div>
              </div>
            ) : (
              <div className="help" style={{ marginTop: 12 }}>
                No admin message yet.
              </div>
            )}

            <div className="row" style={{ marginTop: 12 }}>
              <a className="btn btnPrimary" href={`/upload?applicationId=${encodeURIComponent(app.id)}`}>
                Upload / update documents
              </a>
            </div>
          </div>
        ) : null}

        <div className="hr" style={{ marginTop: 18, marginBottom: 12 }} />

        <h2 style={{ margin: 0 }}>Recent history</h2>
        <p className="help" style={{ marginTop: 6 }}>
          Last 3 applications (most recent first).
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {history.map((h) => (
            <div key={h.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div className={badgeForStatus(h.status)}>{labelForStatus(h.status)}</div>
                  <div className="help" style={{ marginTop: 6 }}>
                    ID: <span style={{ fontFamily: "monospace" }}>{h.id}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 1000 }}>R{h.amountRequested}</div>
                  <div className="help">{h.repayDays} Days</div>
                </div>
              </div>

              <div className="help" style={{ marginTop: 10 }}>
                Created: {new Date(h.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          {!loading && history.length === 0 ? (
            <div className="help">No history yet.</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "PENDING" | "APPROVED" | "DECLINED" | "NEEDS_INFO";
type DocType = "ID_DOCUMENT" | "SELFIE_WITH_ID" | "PAYSLIP" | "PROOF_OF_RESIDENCE";

const DOCS: { type: DocType; label: string }[] = [
  { type: "ID_DOCUMENT", label: "ID Document" },
  { type: "SELFIE_WITH_ID", label: "Selfie holding ID" },
  { type: "PAYSLIP", label: "Payslip" },
  { type: "PROOF_OF_RESIDENCE", label: "Proof of residence" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<{ type: DocType }[]>([]);

  const uploadedSet = useMemo(() => new Set(documents.map((d) => d.type)), [documents]);

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/me/application");
    const raw = await res.text();

    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMsg(data?.error || raw || "Failed to load dashboard");
      setLoading(false);
      return;
    }

    setApplication(data?.application || null);
    setDocuments(data?.documents || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>My Dashboard</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!application) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>My Dashboard</h1>
        {msg ? <p style={{ color: "red" }}>{msg}</p> : null}
        <p>You have no application yet.</p>
        <p>
          Start here: <a href="/apply">Apply for a loan</a>
        </p>
      </main>
    );
  }

  const status: Status = application.status;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 800 }}>
      <h1>My Dashboard</h1>

      {msg ? <p style={{ color: "red" }}>{msg}</p> : null}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Application</h2>

        <p>
          <strong>Status:</strong>{" "}
          <span style={{ fontWeight: 800 }}>{status}</span>
        </p>

        {application.adminNotes ? (
          <div style={{ background: "#fafafa", padding: 12, borderRadius: 10 }}>
            <strong>Admin notes:</strong>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{application.adminNotes}</div>
          </div>
        ) : (
          <p style={{ opacity: 0.8 }}>No admin notes yet.</p>
        )}

        <p style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
          <strong>Application ID:</strong> {application.id} <br />
          <strong>Created:</strong> {new Date(application.createdAt).toLocaleString()}
        </p>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Documents checklist</h2>

        <div style={{ display: "grid", gap: 8 }}>
          {DOCS.map((d) => {
            const ok = uploadedSet.has(d.type);
            return (
              <div
                key={d.type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 10,
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              >
                <span>{d.label}</span>
                <strong>{ok ? "Uploaded ✅" : "Missing ❌"}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`/upload?applicationId=${encodeURIComponent(application.id)}`}
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Upload / Update documents
          </a>

          <button
            type="button"
            onClick={load}
            style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {status === "NEEDS_INFO" ? (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      border: "1px solid #f59e0b",
      background: "#fff7ed",
    }}
  >
    <strong>Action needed:</strong> Admin requested more information.
    <div style={{ marginTop: 6 }}>
      Please read the admin notes and re-upload the requested documents.
    </div>

    <div style={{ marginTop: 10 }}>
      <a
        href={`/upload?applicationId=${encodeURIComponent(application.id)}`}
        style={{
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: 10,
          textDecoration: "none",
          color: "inherit",
          display: "inline-block",
          background: "white",
        }}
      >
        Upload requested documents →
      </a>
    </div>
  </div>
) : null}
      </div>
    </main>
  );
}
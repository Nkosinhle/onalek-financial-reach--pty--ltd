"use client";

import AdminNav from "@/components/AdminNav";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Status = "PENDING" | "APPROVED" | "DECLINED" | "NEEDS_INFO";
type DocType = "ID_DOCUMENT" | "SELFIE_WITH_ID" | "PAYSLIP" | "PROOF_OF_RESIDENCE";

type Application = {
  id: string;
  fullName: string;
  saIdNumber: string;
  amountRequested: number;
  repayDays: number;
  status: Status;
  adminNotes?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  user: { email: string };
  docsUpdatedAt?: string | null;
};

type ReviewStatus = "PENDING" | "VERIFIED" | "REJECTED";

type AdminDoc = {
  id: string;
  type: DocType;
  storagePath: string;
  uploadedAt: string;
  signedUrl: string | null;
  signedUrlError: string | null;

  // ✅ new fields
  reviewStatus: ReviewStatus;
  reviewedAt: string | null;
  reviewedByClerkId: string | null;
  reviewNotes: string | null;
};

type AuditLog =
  | {
      id: string;
      kind: "REVIEW";
      createdAt: string;
      oldStatus: string | null;
      newStatus: string | null;
      oldNotes: string | null;
      newNotes: string | null;
      meta: null;
    }
  | {
      id: string;
      kind: "UPLOAD";
      createdAt: string;
      oldStatus: null;
      newStatus: null;
      oldNotes: null;
      newNotes: null;
      meta: {
        documentType: string;
        storagePath: string;
        uploadedByClerkId: string;
      };
    };

const DOC_LABELS: Record<DocType, string> = {
  ID_DOCUMENT: "ID Document",
  SELFIE_WITH_ID: "Selfie holding ID",
  PAYSLIP: "Payslip",
  PROOF_OF_RESIDENCE: "Proof of residence",
};

export default function AdminApplicationDetailPage() {
  const routeParams = useParams();
  const id = String(routeParams?.id || "");

  const [app, setApp] = useState<Application | null>(null);
  const [status, setStatus] = useState<Status>("PENDING");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsMsg, setDocsMsg] = useState("");

  // ✅ Combined audit trail (REVIEW + UPLOAD)
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsMsg, setLogsMsg] = useState("");

  const [docEdits, setDocEdits] = useState<
    Record<string, { reviewStatus: "PENDING" | "VERIFIED" | "REJECTED"; reviewNotes: string }>
  >({});

  const [docSaving, setDocSaving] = useState<Record<string, boolean>>({});

  async function loadApp() {
    setLoading(true);
    setMsg("");

    const res = await fetch(`/api/admin/applications/${id}`);
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMsg(data?.error || raw || "Failed to load application");
      setLoading(false);
      return;
    }

    const a: Application = data.application;
    setApp(a);
    setStatus(a.status);
    setNotes(a.adminNotes || "");
    setLoading(false);
  }

  async function loadDocs() {
    setDocsLoading(true);
    setDocsMsg("");

    const res = await fetch(`/api/admin/applications/${id}/documents`);
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setDocsMsg(data?.error || raw || "Failed to load documents");
      setDocsLoading(false);
      return;
    }

    const incoming = (data?.documents || []) as AdminDoc[];
    const next: Record<string, { reviewStatus: "PENDING" | "VERIFIED" | "REJECTED"; reviewNotes: string }> = {};

    for (const d of incoming) {
      next[d.id] = {
        reviewStatus: d.reviewStatus || "PENDING",
        reviewNotes: d.reviewNotes || "",
      };
    }

    setDocEdits(next);
    setDocs(incoming);
    setDocsLoading(false);
  }

  async function saveDocReview(docId: string) {
  const edit = docEdits[docId];
  if (!edit) return;

  setDocSaving((p) => ({ ...p, [docId]: true }));

  const res = await fetch(`/api/admin/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewStatus: edit.reviewStatus,
      reviewNotes: edit.reviewNotes,
    }),
  });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {}

  if (!res.ok) {
    alert(data?.error || raw || "Failed to save document review");
    setDocSaving((p) => ({ ...p, [docId]: false }));
    return;
  }

  await loadDocs();
  await loadApp();

  setDocSaving((p) => ({ ...p, [docId]: false }));
}


  async function loadLogs() {
    setLogsLoading(true);
    setLogsMsg("");

    const res = await fetch(`/api/admin/applications/${id}/logs`);
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setLogsMsg(data?.error || raw || "Failed to load audit logs");
      setLogsLoading(false);
      return;
    }

    setLogs((data?.logs || []) as AuditLog[]);
    setLogsLoading(false);
  }

  async function saveReview() {
    setSaving(true);
    setMsg("Saving...");

    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMsg(data?.error || raw || "Failed to save");
      setSaving(false);
      return;
    }

    setMsg("Saved ✅");
    setSaving(false);

    await loadApp();
    await loadLogs(); // ✅ review changes create logs, so refresh audit too
  }

  useEffect(() => {
    if (!id) return;
    loadApp();
    loadDocs();
    async function saveDocReview(docId: string) {
  const edit = docEdits[docId];
  if (!edit) return;

  setDocSaving((p) => ({ ...p, [docId]: true }));

  const res = await fetch(`/api/admin/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewStatus: edit.reviewStatus,
      reviewNotes: edit.reviewNotes,
    }),
  });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {}

  if (!res.ok) {
    alert(data?.error || raw || "Failed to save document review");
    setDocSaving((p) => ({ ...p, [docId]: false }));
    return;
  }

  // refresh docs so admin sees reviewedAt, etc.
  await loadDocs();
  setDocSaving((p) => ({ ...p, [docId]: false }));
}
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id) {
    return (
      <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <AdminNav />
        <p>Loading route...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <AdminNav />
      <div className="card" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div className="badge" style={{ width: "fit-content" }}>
            Admin • Application detail
          </div>
          <h1 style={{ margin: 0 }}>Application Detail</h1>
          <div className="hr" />
        </div>

      <div
        className="card"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Document retention</div>
        <div style={{ opacity: 0.9, lineHeight: 1.5, fontSize: 14 }}>
          Documents uploaded for this application are stored securely and retained for compliance and audit
          purposes. Only authorized staff may access these files.
        </div>
      </div>

      {loading ? <p>Loading...</p> : null}
      {msg ? <p>{msg}</p> : null}

      {app ? (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <SectionTitle title="Applicant" />
          <p>
            <strong>Name:</strong> {app.fullName}
          </p>
          <p>
            <strong>Email:</strong> {app.user.email}
          </p>
          <p>
            <strong>SA ID:</strong> {app.saIdNumber}
          </p>

          <SectionTitle title="Loan request" />
          <p>
            <strong>Amount:</strong> R{app.amountRequested}
          </p>
          <p>
            <strong>Repayment:</strong> {app.repayDays} day{app.repayDays === 1 ? "" : "s"}
          </p>

          <SectionTitle title="Admin review (manual)" />
          <label style={{ display: "block", marginBottom: 10 }}>
            <strong>Status</strong>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              style={{ display: "block", padding: 8, marginTop: 6, width: 220 }}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DECLINED">DECLINED</option>
              <option value="NEEDS_INFO">NEEDS_INFO</option>
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <strong>Admin notes</strong>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
              placeholder="Write reasons, what docs are missing, next steps, etc."
            />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={saveReview} disabled={saving} style={{ padding: 10 }}>
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button type="button" onClick={loadApp} disabled={saving} style={{ padding: 10 }}>
              Reload
            </button>
          </div>

          <SectionTitle title="Documents" />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={loadDocs} disabled={docsLoading} style={{ padding: 10 }}>
              {docsLoading ? "Loading..." : "Refresh documents"}
            </button>
            {docsMsg ? <span style={{ color: "red" }}>{docsMsg}</span> : null}
          </div>

          <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr",
                padding: 10,
                fontWeight: 700,
                background: "#fafafa",
              }}
            >
              <div>Type</div>
              <div>Uploaded</div>
              <div>Link</div>
              <div>Review</div>
            </div>

            {docs.map((d) => (
  <div
    key={d.id}
    style={{
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr",
      padding: 10,
      borderTop: "1px solid #eee",
    }}
  >
    {/* 1) Type */}
    <div>{DOC_LABELS[d.type] || d.type}</div>

    {/* 2) Uploaded */}
    <div>{new Date(d.uploadedAt).toLocaleString()}</div>

    {/* 3) Link */}
    <div>
      {d.signedUrl ? (
        <a href={d.signedUrl} target="_blank" rel="noreferrer">
          View / Download
        </a>
      ) : (
        <span style={{ color: "red" }}>{d.signedUrlError || "No link"}</span>
      )}
    </div>

    
    <div>
      <div style={{ display: "grid", gap: 6 }}>
        <select
          value={docEdits[d.id]?.reviewStatus || "PENDING"}
          onChange={(e) =>
            setDocEdits((p) => ({
              ...p,
              [d.id]: {
                ...(p[d.id] || { reviewStatus: "PENDING", reviewNotes: "" }),
                reviewStatus: e.target.value as any,
              },
            }))
          }
          style={{ padding: 8 }}
        >
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <textarea
          value={docEdits[d.id]?.reviewNotes || ""}
          onChange={(e) =>
            setDocEdits((p) => ({
              ...p,
              [d.id]: {
                ...(p[d.id] || { reviewStatus: "PENDING", reviewNotes: "" }),
                reviewNotes: e.target.value,
              },
            }))
          }
          rows={2}
          placeholder="Notes (optional)"
          style={{ padding: 8, width: "100%" }}
        />

        <button
          type="button"
          onClick={() => saveDocReview(d.id)}
          disabled={!!docSaving[d.id]}
          style={{ padding: 8 }}
        >
          {docSaving[d.id] ? "Saving..." : "Save"}
        </button>

        {d.reviewedAt ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Reviewed: {new Date(d.reviewedAt).toLocaleString()}
          </div>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.75 }}>Not reviewed yet</div>
        )}
      </div>
    </div>
  </div>
))}

            {!docsLoading && docs.length === 0 ? <div style={{ padding: 10 }}>No documents uploaded yet.</div> : null}
          </div>

          <SectionTitle title="Audit trail" />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={loadLogs} disabled={logsLoading} style={{ padding: 10 }}>
              {logsLoading ? "Loading..." : "Refresh logs"}
            </button>
            {logsMsg ? <span style={{ color: "red" }}>{logsMsg}</span> : null}
          </div>

          <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 2fr",
                padding: 10,
                fontWeight: 700,
                background: "#fafafa",
              }}
            >
              <div>When</div>
              <div>Type</div>
              <div>Details</div>
            </div>

            {logs.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 2fr",
                  padding: 10,
                  borderTop: "1px solid #eee",
                }}
              >
                <div>{new Date(l.createdAt).toLocaleString()}</div>

                <div>
                  {l.kind === "REVIEW" ? <span>REVIEW</span> : <span>UPLOAD</span>}
                </div>

                <div style={{ whiteSpace: "pre-wrap" }}>
                  {l.kind === "UPLOAD" ? (
                    <>
                      <div style={{ fontWeight: 700 }}>Document uploaded</div>
                      <div style={{ opacity: 0.85, marginTop: 4 }}>
                        <div>
                          <strong>Type:</strong> {labelDocType(l.meta.documentType)}
                        </div>
                        <div>
                          <strong>By:</strong> {l.meta.uploadedByClerkId}
                        </div>
                        <div style={{ opacity: 0.8 }}>
                          <strong>Path:</strong> {l.meta.storagePath}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700 }}>
                        {(l.oldStatus || "-") + " → " + (l.newStatus || "-")}
                      </div>

                      {(l.oldNotes || "") !== (l.newNotes || "") ? (
                        <div style={{ opacity: 0.85, marginTop: 4 }}>
                          <div>
                            <strong>Old:</strong> {shorten(l.oldNotes)}
                          </div>
                          <div>
                            <strong>New:</strong> {shorten(l.newNotes)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ opacity: 0.8, marginTop: 4 }}>No notes change</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {!logsLoading && logs.length === 0 ? <div style={{ padding: 10 }}>No audit logs yet.</div> : null}
          </div>

          <SectionTitle title="Application info" />
          <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12, lineHeight: 1.6 }}>
            <div>
              <strong>Application ID:</strong> {app.id}
            </div>
            <div>
              <strong>Created:</strong> {new Date(app.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Docs last updated:</strong>{" "}
              {app.docsUpdatedAt ? new Date(app.docsUpdatedAt).toLocaleString() : "never"}
            </div>
            {app.reviewedAt ? (
              <div>
                <strong>Last reviewed:</strong> {new Date(app.reviewedAt).toLocaleString()}
              </div>
            ) : (
              <div>
                <strong>Last reviewed:</strong> never
              </div>
            )}
          </div>
           </div>
        </div>
      ) : null}

      <p style={{ marginTop: 16 }}>
        Back: <a href="/admin/dashboard">Dashboard</a>
      </p>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>{title}</h2>;
}

function shorten(text: string | null, max = 120) {
  const t = (text ?? "").trim();
  if (!t) return "(empty)";
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function labelDocType(t: string) {
  const map: Record<string, string> = {
    ID_DOCUMENT: "ID Document",
    SELFIE_WITH_ID: "Selfie holding ID",
    PAYSLIP: "Payslip",
    PROOF_OF_RESIDENCE: "Proof of residence",
  };
  return map[t] || t;
}
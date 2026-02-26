"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type DocType = "ID_DOCUMENT" | "SELFIE_WITH_ID" | "PAYSLIP" | "PROOF_OF_RESIDENCE";

const DOCS: { type: DocType; label: string; hint: string }[] = [
  { type: "ID_DOCUMENT", label: "ID Document", hint: "PDF or clear photo of your ID" },
  { type: "SELFIE_WITH_ID", label: "Selfie holding ID", hint: "Clear face + ID visible" },
  { type: "PAYSLIP", label: "Payslip", hint: "Latest payslip" },
  { type: "PROOF_OF_RESIDENCE", label: "Proof of residence", hint: "Not older than 3 months" },
];

function allUploaded(map: Record<DocType, boolean>) {
  return Object.values(map).every(Boolean);
}

function successKey(appId: string) {
  return `docs_success_shown:${appId}`;
}

export default function UploadClient() {
  const sp = useSearchParams();
  const applicationId = useMemo(() => sp.get("applicationId") || "", [sp]);

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<DocType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [uploaded, setUploaded] = useState<Record<DocType, boolean>>({
    ID_DOCUMENT: false,
    SELFIE_WITH_ID: false,
    PAYSLIP: false,
    PROOF_OF_RESIDENCE: false,
  });

  async function refreshStatus() {
    setMsg("");
    const res = await fetch(`/api/uploads/status?applicationId=${encodeURIComponent(applicationId)}`);
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMsg(data?.error || raw || "Failed to load upload status");
      return;
    }

    const docs = (data?.documents || []) as { type: DocType }[];
    const map: Record<DocType, boolean> = {
      ID_DOCUMENT: false,
      SELFIE_WITH_ID: false,
      PAYSLIP: false,
      PROOF_OF_RESIDENCE: false,
    };
    for (const d of docs) map[d.type] = true;

    setUploaded(map);

    // ✅ show success popup ONCE when all docs are uploaded
    if (applicationId && allUploaded(map)) {
      const already = localStorage.getItem(successKey(applicationId));
      if (!already) {
        localStorage.setItem(successKey(applicationId), "1");
        setShowSuccess(true);
      }
    }
  }

  async function uploadOne(type: DocType, file: File) {
    setBusy(type);
    setMsg("");

    const form = new FormData();
    form.append("applicationId", applicationId);
    form.append("type", type);
    form.append("file", file);

    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      setMsg(data?.error || raw || "Upload failed");
      setBusy(null);
      return;
    }

    setMsg("Uploaded ✅");
    setBusy(null);
    await refreshStatus();
  }

  useEffect(() => {
    if (!applicationId) return;
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  if (!applicationId) {
    return (
      <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1>Upload Documents</h1>
          <p style={{ color: "red" }}>
            Missing <code>applicationId</code> in the URL.
          </p>
          <p>
            Go to <a href="/apply">/apply</a>, submit, then come back with the applicationId.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      {/* ✅ SUCCESS POPUP */}
      {showSuccess ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 520, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <div className="badge badgeBlue" style={{ width: "fit-content" }}>
                Submitted ✅
              </div>

              <h2 style={{ margin: 0 }}>Documents submitted successfully</h2>

              <p className="help" style={{ margin: 0 }}>
                Thank you. We’ve received all your documents. Please wait for communication from
                Onalek Financial Reach (PTY) LTD.
              </p>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                <button className="btn btnPrimary" type="button" onClick={() => setShowSuccess(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Upload Documents</h1>
        <p>
          <strong>Application ID:</strong> {applicationId}
        </p>

        {msg ? <p>{msg}</p> : null}

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {DOCS.map((d) => (
            <div
              key={d.type}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{d.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{d.hint}</div>
                </div>
                <div style={{ fontWeight: 900 }}>{uploaded[d.type] ? "Uploaded ✅" : "Missing ❌"}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    uploadOne(d.type, f);
                  }}
                  // optional: lock uploads once all are uploaded
                  disabled={busy !== null || allUploaded(uploaded)}
                />
                {busy === d.type ? <span style={{ marginLeft: 10 }}>Uploading...</span> : null}
                {allUploaded(uploaded) ? (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                    All documents submitted ✅
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
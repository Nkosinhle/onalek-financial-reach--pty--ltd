"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [saIdNumber, setSaIdNumber] = useState("");
  const [amountRequested, setAmountRequested] = useState("");
  const [repayDays, setRepayDays] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    // ✅ enforce consent on client
    if (!agreeTerms) {
      setMsg("Please accept the Terms & Privacy to continue.");
      return;
    }

    setBusy(true);
    setMsg("Saving...");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        saIdNumber,
        amountRequested,
        repayDays,
        agreeTerms, // ✅ send to server too
      }),
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      const message =
        data?.error ||
        (raw?.slice(0, 200) ? `Error: ${raw.slice(0, 200)}` : "Empty response from server");
      setMsg(message);
      setBusy(false);
      return;
    }

    const appId = data?.application?.id;
    setMsg(`Saved ✅ Application ID: ${appId || "unknown"}`);

    setBusy(false);

    if (appId) {
      router.push(`/upload?applicationId=${encodeURIComponent(appId)}`);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div className="badge badgeBlue" style={{ width: "fit-content" }}>
            Step 1 of 2
          </div>
          <h1 style={{ margin: 0 }}>Apply for a loan</h1>
          <p className="help" style={{ marginTop: 2 }}>
            Fill in your details. After submitting, you’ll be taken to upload your documents.
          </p>
          <div className="hr" />
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <label className="label">
            Full name
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nkosi Mbuyisa"
              disabled={busy}
            />
          </label>

          <label className="label">
            SA ID number
            <input
              className="input"
              value={saIdNumber}
              onChange={(e) => setSaIdNumber(e.target.value)}
              placeholder="13 digits"
              inputMode="numeric"
              disabled={busy}
            />
            <span className="help">Must be exactly 13 digits (checksum validated).</span>
          </label>

          <div className="row">
            <label className="label" style={{ flex: "1 1 240px" }}>
              Loan amount (R)
              <input
                className="input"
                value={amountRequested}
                onChange={(e) => setAmountRequested(e.target.value)}
                placeholder="e.g. 5000"
                inputMode="numeric"
                disabled={busy}
              />
              <span className="help">Min R500, max R50 000.</span>
            </label>

            <label className="label" style={{ flex: "1 1 240px" }}>
              Term (days)
              <input
                className="input"
                type="number"
                min={1}
                max={30}
                value={repayDays}
                onChange={(e) => setRepayDays(e.target.value)}
                placeholder="e.g. 7"
                disabled={busy}
              />
              <span className="help">Repayment must be between 1 and 30 days.</span>
            </label>
          </div>

          {/* ✅ CONSENT CHECKBOX (place: right before the submit row) */}
          <div
            className="card"
            style={{
              background: "rgba(255,255,255,0.04)",
              padding: 12,
              borderRadius: 14,
            }}
          >
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={busy}
                style={{ marginTop: 4 }}
              />
              <span style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.4 }}>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noreferrer">
                  Terms &amp; Conditions
                </a>
                ,{" "}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  Privacy Policy
                </a>
                , and I confirm that the information provided is true.
              </span>
            </label>
          </div>

          <div className="row" style={{ marginTop: 6 }}>
            <button
              type="button"
              onClick={submit}
              className="btn btnPrimary"
              disabled={busy}
              style={{ minWidth: 200 }}
            >
              {busy ? "Submitting..." : "Submit application"}
            </button>

            <a className="btn" href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              Back home
            </a>

            <a className="btn" href="/status" style={{ display: "inline-flex", alignItems: "center" }}>
              View status
            </a>
          </div>

          {msg ? (
            <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ fontWeight: 900 }}>Message</div>
              <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{msg}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
export const metadata = {
  title: "Privacy Policy | Onalek Financial Reach (PTY) LTD",
};

export default function PrivacyPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Privacy Policy</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <section style={{ marginTop: 18 }}>
        <h2>1. Overview</h2>
        <p>
          This policy explains how <strong>Onalek Financial Reach (PTY) LTD</strong> collects, uses, stores, and protects
          personal information. We aim to comply with South Africa’s POPIA requirements.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>2. What we collect</h2>
        <ul>
          <li>Account info (e.g., email, authentication identifiers).</li>
          <li>Application info (full name, SA ID number, amount requested, term, status updates).</li>
          <li>Documents you upload (ID document, selfie holding ID, payslip, proof of residence).</li>
          <li>Audit logs (admin review actions and upload logs).</li>
          <li>Technical data (limited logs for security, rate limiting, and troubleshooting).</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>3. Why we collect it</h2>
        <ul>
          <li>To process and review loan applications.</li>
          <li>To verify identity and prevent fraud.</li>
          <li>To perform affordability checks and responsible lending assessments.</li>
          <li>To meet legal/compliance obligations where applicable.</li>
          <li>To keep the system secure and reliable.</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>4. Legal basis (POPIA)</h2>
        <p>
          We process information where it is necessary to provide services, to meet legal obligations, for legitimate interests
          (like fraud prevention), and/or with your consent (e.g., document uploads).
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>5. Storage & security</h2>
        <p>
          Documents are stored in secure cloud storage and access is restricted. We use authentication, access controls,
          and logging. No system is 100% secure, but we take reasonable steps to protect your information.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>6. Sharing</h2>
        <p>
          We do not sell your personal information. We may share limited data with:
        </p>
        <ul>
          <li>Service providers (hosting, storage, database) only to operate the platform.</li>
          <li>Authorities where required by law.</li>
          <li>Professional advisors where necessary (e.g., compliance/legal), under confidentiality.</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>7. Retention</h2>
        <p>
          We keep information only for as long as needed to process applications and meet legal/compliance requirements.
          We may retain certain logs for security and auditing.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>8. Your POPIA rights</h2>
        <ul>
          <li>Access: request a copy of your personal information.</li>
          <li>Correction: request corrections if information is inaccurate.</li>
          <li>Deletion: request deletion where appropriate and lawful.</li>
          <li>Objection: object to processing in certain cases.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
            To exercise these rights, email us at{" "}
            <a href="mailto:onalekfinances25@gmail.com">onalekfinances25@gmail.com</a>{" "}
            and include enough information to verify your identity.
            </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>9. Cookies</h2>
        <p>
          This site may use essential cookies for authentication and security. We do not use cookies to sell data.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>10. Changes</h2>
        <p>
          We may update this policy from time to time. Continued use means you accept the latest version.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Downloads</h2>
        <ul>
            <li>
            <a href="/legal/onalek-loan-agreement.pdf" target="_blank" rel="noreferrer">
                Financial Loan Agreement (PDF)
            </a>
            </li>
            <li>
            <a href="/legal/onalek-internal-policies.pdf" target="_blank" rel="noreferrer">
                Internal Policies (PDF)
            </a>
            </li>
        </ul>
        </section>

        <section style={{ marginTop: 28 }}>
            <div
                style={{
                padding: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                }}
            >
                <h2>POPIA Data Requests</h2>

                <p>
                In terms of the Protection of Personal Information Act (POPIA),
                you may request:
                </p>

                <ul style={{ marginTop: 8 }}>
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion (where legally permissible)</li>
                <li>Objection to certain processing</li>
                </ul>

                <p style={{ marginTop: 12 }}>
                To exercise these rights, please contact us using our official
                support channel and include sufficient information to verify your identity.
                </p>

                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85 }}>
                We may require identity verification before processing requests.
                </div>
            </div>
            </section>

    </main>
  );
}
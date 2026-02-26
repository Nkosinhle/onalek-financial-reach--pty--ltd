export const metadata = {
  title: "Terms & Conditions | Onalek Financial Reach (PTY) LTD",
};

export default function TermsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Terms & Conditions</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <section style={{ marginTop: 18 }}>
        <h2>1. Who we are</h2>
        <p>
          This website and the services on it are provided by <strong>Onalek Financial Reach (PTY) LTD</strong> (“we”, “us”).
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>2. What this system does</h2>
        <p>
          This platform lets users submit a loan application and upload supporting documents (such as identification and proof of income/residence)
          for review. Loan decisions are currently reviewed manually by an administrator.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>3. Eligibility</h2>
        <p>
          You confirm that the information you submit is accurate and that you are legally allowed to apply for credit.
          We may reject or pause an application if we suspect fraud or inaccurate information.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>4. No guarantee</h2>
        <p>
          Submitting an application does <strong>not</strong> guarantee approval or that credit will be granted.
          We may request additional information at any time.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>5. User responsibilities</h2>
        <ul>
          <li>Provide truthful and complete details.</li>
          <li>Upload documents that are yours and not altered.</li>
          <li>Keep your account secure and do not share login access.</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>6. Platform acceptable use</h2>
        <p>Do not attempt to:</p>
        <ul>
          <li>Upload malicious files or content.</li>
          <li>Access admin endpoints or another user’s application.</li>
          <li>Reverse engineer, disrupt, or attack the service.</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>7. Data and privacy</h2>
        <p>
          We process personal information as described in our <a href="/privacy">Privacy Policy</a>.
          By using this platform you consent to that processing.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>8. Credit and affordability</h2>
        <p>
          We may assess affordability and may decline applications where repayment may not be sustainable.
          See our <a href="/responsible-lending">Responsible Lending</a> page for more.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>9. Limitation of liability</h2>
        <p>
          To the extent permitted by law, we are not liable for indirect losses, lost profits, or damages caused by interruptions,
          delays, or technical issues. This does not limit liability where it cannot legally be limited.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>10. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the platform means you accept the updated terms.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>11. Contact</h2>
        <p>If you have questions, contact us using the official support channel used by Onalek Financial Reach (PTY) LTD.</p>
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
    </main>
  );
}
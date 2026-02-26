export const metadata = {
  title: "Responsible Lending | Onalek Financial Reach (PTY) LTD",
};

export default function ResponsibleLendingPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Responsible Lending</h1>
      <p style={{ opacity: 0.8 }}>Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <section style={{ marginTop: 18 }}>
        <h2>Affordability and responsible lending</h2>
        <p>
          We support responsible lending. We may assess your information and documentation to help determine whether
          repayment appears affordable.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>What we may check</h2>
        <ul>
          <li>Income indicators (e.g., payslip amount)</li>
          <li>Identity match across submitted documents</li>
          <li>Document authenticity signals and missing information</li>
          <li>Consistency between requested amount/term and available income</li>
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>Important notice</h2>
        <p>
          This platform does not provide financial advice. Decisions may be manual and may require additional information.
          Approval is not guaranteed.
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>If you are struggling</h2>
        <p>
          If you believe a loan would cause financial hardship, consider speaking to a qualified financial advisor and
          consider alternatives before applying.
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
    </main>
  );
}
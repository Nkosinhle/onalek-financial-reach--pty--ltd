export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: 24 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            maxWidth: 980,
          }}
        >
          {[
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
            { href: "/responsible-lending", label: "Responsible lending" },
            { href: "/legal/onalek-loan-agreement.pdf", label: "Loan Agreement (PDF)", external: true },
            { href: "/legal/onalek-internal-policies.pdf", label: "Policies (PDF)", external: true },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 18, paddingBottom: 18 }}>
        <div style={{ fontWeight: 900 }}>Holding hands, uplifting fallen hopes</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          © {new Date().getFullYear()} Onalek Financial Reach (PTY) LTD
        </div>
        <p>For any queries email: 
        <a href="mailto:onalekfinances25@gmail.com"> onalekfinances25@gmail.com</a>
        </p>
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          fontSize: 13,
          opacity: 0.75,
        }}
      >
        System designed, engineered & developed by{" "}
        <a
          href="https://nkosinhle-site.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 700,
            textDecoration: "none",
            color: "rgba(35, 73, 155, 0.9)",
          }}
        >
          CLICK HERE
        </a>
      </div>
    </footer>
  );
}
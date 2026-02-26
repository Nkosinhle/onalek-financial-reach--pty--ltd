import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <SignUp
          appearance={{
            elements: {
              headerTitle: { display: "none" },
              headerSubtitle: { display: "none" },
            },
          }}
        />
        <div style={{ marginTop: 14, textAlign: "center", opacity: 0.85 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>ONALEK</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            Financial Reach (PTY) LTD
          </div>
        </div>
      </div>
    </div>
  );
}
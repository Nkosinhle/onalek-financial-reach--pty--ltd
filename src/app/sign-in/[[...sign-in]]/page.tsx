import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
        <SignIn
          appearance={{
            elements: {
              headerTitle: { display: "none" }, // hides "Sign in to ..."
              headerSubtitle: { display: "none" },
            },
          }}
        />
        {/* Our own title above Clerk */}
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
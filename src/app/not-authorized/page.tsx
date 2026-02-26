export default function NotAuthorizedPage() {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Not authorized</h1>
        <p>You are signed in, but you are not allowed to access the admin area.</p>
        <p>
          Back: <a href="/">Home</a>
        </p>
      </main>
    );
  }
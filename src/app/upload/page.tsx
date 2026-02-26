import { Suspense } from "react";
import UploadClient from "./UploadClient";

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <main className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
            <p>Loading upload page…</p>
          </div>
        </main>
      }
    >
      <UploadClient />
    </Suspense>
  );
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");
  if (!isAdmin(sessionClaims)) redirect("/status");

  return <>{children}</>;
}
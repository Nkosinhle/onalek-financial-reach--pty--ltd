export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ signedIn: false, role: "GUEST" });
  }

  return NextResponse.json({
    signedIn: true,
    role: isAdmin(sessionClaims) ? "ADMIN" : "USER",
  });
}
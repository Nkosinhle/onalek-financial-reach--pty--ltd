import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isAdmin(sessionClaims)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const reviewLogs = await prisma.reviewLog.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const uploadLogs = await prisma.uploadLog.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Normalize into one list
    const logs = [
      ...reviewLogs.map((l) => ({
        id: l.id,
        kind: "REVIEW" as const,
        createdAt: l.createdAt,
        oldStatus: l.oldStatus,
        newStatus: l.newStatus,
        oldNotes: l.oldNotes,
        newNotes: l.newNotes,
        meta: null as any,
      })),
      ...uploadLogs.map((u) => ({
        id: u.id,
        kind: "UPLOAD" as const,
        createdAt: u.createdAt,
        oldStatus: null,
        newStatus: null,
        oldNotes: null,
        newNotes: null,
        meta: {
          documentType: u.documentType,
          storagePath: u.storagePath,
          uploadedByClerkId: u.uploadedByClerkId,
        },
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("GET logs error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
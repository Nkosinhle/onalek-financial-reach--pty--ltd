export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!isAdmin(sessionClaims)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });

    const countsRaw = await prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      DECLINED: 0,
      NEEDS_INFO: 0,
    };

    for (const c of countsRaw) {
      counts[c.status] = c._count.status;
    }

    return NextResponse.json({ applications, counts });
  } catch (err: any) {
    console.error("GET /api/admin/applications error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
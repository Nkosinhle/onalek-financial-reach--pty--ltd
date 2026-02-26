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
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isAdmin(sessionClaims)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const [
      total,
      pending,
      approved,
      declined,
      needsInfo,
      thisWeek,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "DECLINED" } }),
      prisma.application.count({ where: { status: "NEEDS_INFO" } }),
      prisma.application.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      pending,
      approved,
      declined,
      needsInfo,
      thisWeek,
    });
  } catch (err: any) {
    console.error("GET /api/admin/metrics error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

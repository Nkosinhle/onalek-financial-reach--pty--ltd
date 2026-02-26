import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ application: null, history: [] });
    }

    const apps = await prisma.application.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        fullName: true,
        saIdNumber: true,
        amountRequested: true,
        repayDays: true,
        status: true,
        adminNotes: true,
        clientMessage: true,
        createdAt: true,
        docsUpdatedAt: true,
        reviewedAt: true,
        decisionAt: true,
      },
    });

    return NextResponse.json({
      application: apps[0] || null,
      history: apps,
    });
  } catch (err: any) {
    console.error("GET /api/me/application error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
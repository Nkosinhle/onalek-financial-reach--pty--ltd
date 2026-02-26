export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const applicationId = url.searchParams.get("applicationId") || "";
  if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.user.clerkId !== userId) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const docs = await prisma.document.findMany({
    where: { applicationId },
    select: { type: true, storagePath: true, uploadedAt: true },
  });

  return NextResponse.json({ documents: docs });
}
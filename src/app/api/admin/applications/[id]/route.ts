export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(sessionClaims)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const application = await prisma.application.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ application });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(sessionClaims)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const status = body?.status as string | undefined;
  const adminNotes = body?.adminNotes as string | undefined;

  const allowed = ["PENDING", "APPROVED", "DECLINED", "NEEDS_INFO"];
  if (status && !allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // 1) Read current values (for diff + audit trail)
  const current = await prisma.application.findUnique({
    where: { id },
    select: { status: true, adminNotes: true },
  });

  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Normalize notes for comparison
  const currentNotes = current.adminNotes ?? "";
  const nextNotes = adminNotes !== undefined ? adminNotes : currentNotes;

  const statusChanged = status !== undefined && status !== current.status;
  const notesChanged = adminNotes !== undefined && nextNotes !== currentNotes;

  // 2) If nothing changed, don't update, don't log
  if (!statusChanged && !notesChanged) {
    const unchanged = await prisma.application.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json({ application: unchanged });
  }

  // 3) Update application
  const updated = await prisma.application.update({
    where: { id },
    data: {
  ...(status ? { status: status as any } : {}),
  ...(adminNotes !== undefined ? { adminNotes } : {}),

  // ✅ NEW (decision fields stored on Application)
  ...(body?.clientMessage !== undefined ? { clientMessage: String(body.clientMessage) } : {}),
  decisionAt: new Date(),
  decidedByClerkId: userId,

  // keep your existing reviewed tracking
  reviewedAt: new Date(),
  reviewedById: userId,
},
  });

  // 4) Write audit trail (only when changed)
  await prisma.reviewLog.create({
    data: {
      applicationId: id,
      adminClerkId: userId,
      oldStatus: current.status,
      newStatus: statusChanged ? status! : current.status,
      oldNotes: current.adminNotes ?? null,
      newNotes: adminNotes !== undefined ? adminNotes : current.adminNotes ?? null,
    },
  });

  return NextResponse.json({ application: updated });
}
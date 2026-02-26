import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function isAdmin(sessionClaims: unknown) {
  return (sessionClaims as any)?.metadata?.role === "admin";
}

type Ctx = { params: Promise<{ id: string }> };

const REQUIRED_DOC_TYPES = [
  "ID_DOCUMENT",
  "SELFIE_WITH_ID",
  "PAYSLIP",
  "PROOF_OF_RESIDENCE",
] as const;

type ReviewStatus = "PENDING" | "VERIFIED" | "REJECTED";

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isAdmin(sessionClaims)) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const body = await req.json();
    const reviewStatus = String(body?.reviewStatus || "").toUpperCase() as ReviewStatus;
    const reviewNotes = body?.reviewNotes !== undefined ? String(body.reviewNotes) : undefined;

    const allowed: ReviewStatus[] = ["PENDING", "VERIFIED", "REJECTED"];
    if (!allowed.includes(reviewStatus)) {
      return NextResponse.json({ error: "Invalid reviewStatus" }, { status: 400 });
    }

    // 1) Update the document
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        reviewStatus,
        reviewedAt: new Date(),
        reviewedByClerkId: userId,
        ...(reviewNotes !== undefined ? { reviewNotes } : {}),
      },
      select: { id: true, applicationId: true },
    });

    const applicationId = updatedDoc.applicationId;

    // 2) Load all docs for this application (required set)
    const docs = await prisma.document.findMany({
      where: { applicationId, type: { in: [...REQUIRED_DOC_TYPES] as any } },
      select: { type: true, reviewStatus: true },
    });

    // 3) Decide new application status
    // Missing types count as not verified
    const byType = new Map<string, ReviewStatus>();
    for (const d of docs) byType.set(d.type, d.reviewStatus as ReviewStatus);

    const missingAny = REQUIRED_DOC_TYPES.some((t) => !byType.has(t));
    const anyRejected = REQUIRED_DOC_TYPES.some((t) => byType.get(t) === "REJECTED");
    const allVerified = !missingAny && REQUIRED_DOC_TYPES.every((t) => byType.get(t) === "VERIFIED");

    let nextStatus: "PENDING" | "NEEDS_INFO" = "PENDING";
    if (anyRejected) nextStatus = "NEEDS_INFO";
    else if (allVerified) nextStatus = "PENDING"; // later we can switch to READY_FOR_DECISION

    // 4) Update application status automatically
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: nextStatus as any,
        reviewedAt: new Date(),
        reviewedById: userId,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({
      document: { id: updatedDoc.id },
      application: updatedApp,
      summary: { missingAny, anyRejected, allVerified, nextStatus },
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/documents/[id] error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
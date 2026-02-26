export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, recordRateLimitEvent } from "@/lib/rateLimit";

const ALLOWED_TYPES = new Set([
  "ID_DOCUMENT",
  "SELFIE_WITH_ID",
  "PAYSLIP",
  "PROOF_OF_RESIDENCE",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

function extFromFilename(name: string) {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    // 1) Auth
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // ✅ Force non-null string for TS + Prisma
    const clerkId = userId;

    // 2) Rate limit (before heavy work)
    const rl = await checkRateLimit({
      clerkId,
      action: "UPLOAD",
      windowMinutes: 60,
      max: 20,
    });

    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    // 3) Read form
    const form = await req.formData();
    const applicationId = String(form.get("applicationId") || "");
    const type = String(form.get("type") || "");
    const file = form.get("file");

    // 4) Validate inputs
    if (!applicationId) return bad("Missing applicationId.");
    if (!type) return bad("Missing document type.");
    if (!ALLOWED_TYPES.has(type)) return bad("Invalid document type.");

    if (!(file instanceof File)) return bad("Missing file.");

    // size
    if (file.size > MAX_BYTES) return bad("File too large. Max size is 5MB.");

    // mime
    if (!ALLOWED_MIME.has(file.type)) {
      return bad("Invalid file type. Only PDF, JPG, JPEG, PNG are allowed.");
    }

    // extension extra safety
    const ext = extFromFilename(file.name);
    const okExt = ext === ".pdf" || ext === ".jpg" || ext === ".jpeg" || ext === ".png";
    if (!okExt) return bad("Invalid file extension. Use .pdf, .jpg, .jpeg, or .png.");

    // 5) Confirm user owns the application
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (app.user.clerkId !== clerkId) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // 6) Build safe storage path
    const safeExt = ext || ".bin";
    const storagePath = `applications/${applicationId}/${type}${safeExt}`;

    // 7) Upload to Supabase Storage
        // 7) Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseAdmin = getSupabaseAdmin();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 8) Upsert Document row
    const doc = await prisma.document.upsert({
      where: { applicationId_type: { applicationId, type: type as any } },
      update: { storagePath, uploadedByClerkId: clerkId },
      create: { applicationId, type: type as any, storagePath, uploadedByClerkId: clerkId },
    });

    // 9) Update docsUpdatedAt
    await prisma.application.update({
      where: { id: applicationId },
      data: { docsUpdatedAt: new Date() },
    });

    // 10) Audit log (UPLOAD)
    await prisma.uploadLog.create({
      data: {
        applicationId,
        uploadedByClerkId: clerkId,
        documentType: type,
        storagePath,
      },
    });

    // 11) Record rate limit event AFTER success
    await recordRateLimitEvent({ clerkId, action: "UPLOAD" });

    // 12) Success
    return NextResponse.json({ document: doc });
  } catch (err: any) {
    console.error("POST /api/uploads error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
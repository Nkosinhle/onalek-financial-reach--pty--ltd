import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docs = await prisma.document.findMany({
      where: { applicationId: id },
      select: { id: true, type: true, storagePath: true, uploadedAt: true },
      orderBy: { uploadedAt: "desc" },
    });

    const results = [];
    for (const d of docs) {
      const { data, error } = await supabaseAdmin.storage
        .from("documents")
        .createSignedUrl(d.storagePath, 60 * 10); // 10 minutes

      results.push({
        ...d,
        signedUrl: error ? null : data?.signedUrl || null,
        signedUrlError: error ? error.message : null,
      });
    }

    return NextResponse.json({ documents: results });
  } catch (err: any) {
    console.error("GET /api/admin/applications/[id]/documents error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
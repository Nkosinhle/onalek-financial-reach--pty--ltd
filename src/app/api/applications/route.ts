export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordRateLimitEvent } from "@/lib/rateLimit";

function isDigits(str: string) {
  return /^[0-9]+$/.test(str);
}

// Luhn check (SA ID uses a checksum like Luhn)
function luhnCheck(value: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = value.length - 1; i >= 0; i--) {
    let digit = Number(value[i]);
    if (Number.isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const rl = await checkRateLimit({
    clerkId: userId,
    action: "APPLY",
    windowMinutes: 60,
    max: 3,
  });

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many applications. Please try again later." },
      { status: 429 }
    );
  }

    const body = await req.json();

    const agreeTerms = Boolean(body?.agreeTerms);
      if (!agreeTerms) return bad("You must accept Terms & Privacy to continue.");

    // ✅ Parse + normalize
    const fullName = String(body?.fullName || "").trim();
    const saIdNumber = String(body?.saIdNumber || "").trim();

    const amountRequested = Number(body?.amountRequested);
    const repayDaysRaw = body?.repayDays;
    const repayDays = Number(repayDaysRaw);

    // ✅ Validations
    if (fullName.length < 2) return bad("Full name is required.");

    if (saIdNumber.length !== 13 || !isDigits(saIdNumber)) {
      return bad("SA ID number must be exactly 13 digits.");
    }
    if (!luhnCheck(saIdNumber)) {
      return bad("SA ID number is invalid.");
    }

    if (!Number.isFinite(amountRequested)) return bad("Amount requested must be a number.");
    if (amountRequested < 500) return bad("Minimum loan amount is R500.");
    if (amountRequested > 50000) return bad("Maximum loan amount is R50,000.");

    if (!Number.isFinite(repayDays)) return bad("Repayment days must be a number.");
    if (repayDays < 1 || repayDays > 31) return bad("Repayment must be between 1 and 31 days.");

    // ✅ Clerk email
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) return bad("No email found on your account.", 400);

    // ✅ Upsert user
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email },
      create: { clerkId: userId, email },
    });

    // ✅ Only one active application at a time (PENDING or NEEDS_INFO)
    const existingActive = await prisma.application.findFirst({
      where: {
        userId: dbUser.id,
        status: { in: ["PENDING", "NEEDS_INFO"] },
      },
      select: { id: true, status: true },
    });

    if (existingActive) {
      return NextResponse.json(
        {
          error: `You already have an active application (${existingActive.status}). Please upload documents or wait for review.`,
          existingApplicationId: existingActive.id,
        },
        { status: 409 }
      );
    }

    
    // ✅ Create application (ints if your schema expects Int)
    const app = await prisma.application.create({
      data: {
        userId: dbUser.id,
        fullName,
        saIdNumber,
        amountRequested: Math.round(amountRequested),
        repayDays: Number(repayDays),
      },
    });

    await recordRateLimitEvent({ clerkId: userId, action: "APPLY" });

    return NextResponse.json({ application: app });
  } catch (err: any) {
    console.error("POST /api/applications error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
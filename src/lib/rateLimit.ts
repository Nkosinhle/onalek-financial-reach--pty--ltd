import { prisma } from "@/lib/prisma";

type Action = "APPLY" | "UPLOAD";

export async function checkRateLimit(opts: {
  clerkId: string;
  action: Action;
  windowMinutes: number;
  max: number;
}) {
  const { clerkId, action, windowMinutes, max } = opts;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const count = await prisma.rateLimitEvent.count({
    where: {
      clerkId,
      action,
      createdAt: { gte: since },
    },
  });

  if (count >= max) {
    return { ok: false as const };
  }

  return { ok: true as const };
}

export async function recordRateLimitEvent(opts: { clerkId: string; action: Action }) {
  const { clerkId, action } = opts;

  await prisma.rateLimitEvent.create({
    data: { clerkId, action },
  });
}
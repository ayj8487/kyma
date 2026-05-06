import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export interface RateLimitResult {
  ok: boolean;
  count: number;
  limit: number;
  resetIn: number; // seconds until reset
}

/**
 * Extract a stable identifier from the request for rate limiting.
 * Priority: x-forwarded-for (first IP) > x-real-ip > "anon".
 */
export function getClientId(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}

/**
 * Check + increment a rate-limit counter using the database.
 * Each unique `key` has an independent counter that resets every `windowSeconds`.
 *
 * @param key  Identifier like "login:1.2.3.4" or "ai:user@example.com"
 * @param limit Maximum allowed requests within the window
 * @param windowSeconds Window length in seconds
 * @returns {ok: true} if under limit, {ok: false} if exceeded
 *
 * Best-effort: if the DB call fails, requests are allowed through (fail-open)
 * to avoid breaking core flows. In production, consider Upstash Ratelimit.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

  try {
    // Atomic upsert: if window expired, reset; otherwise increment
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.windowEnd <= now) {
      // New window
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowEnd },
        update: { count: 1, windowEnd },
      });
      return { ok: true, count: 1, limit, resetIn: windowSeconds };
    }

    if (existing.count >= limit) {
      const resetIn = Math.max(
        1,
        Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000)
      );
      return { ok: false, count: existing.count, limit, resetIn };
    }

    // Increment
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    const resetIn = Math.max(
      1,
      Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000)
    );
    return { ok: true, count: updated.count, limit, resetIn };
  } catch (err) {
    console.error("[rate-limit] DB error, failing open:", err);
    return { ok: true, count: 0, limit, resetIn: 0 };
  }
}

/** Convenience: 429 Response with helpful headers */
export function rateLimitResponse(result: RateLimitResult, message?: string) {
  return new Response(
    JSON.stringify({
      error: message ?? `요청이 너무 많습니다. ${result.resetIn}초 후에 다시 시도해주세요.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.resetIn),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(Math.max(0, result.limit - result.count)),
      },
    }
  );
}

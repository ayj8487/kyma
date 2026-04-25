import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const runtime = "nodejs";

/**
 * GET /api/sync
 * Returns the user's persisted study state stored on the server.
 * Shape: { userData: object, syncedAt: string | null, totals: {...} }
 */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userData: true,
      syncedAt: true,
      totalPoints: true,
      streakCount: true,
      lastStudyDate: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    userData: user.userData ?? {},
    syncedAt: user.syncedAt,
    totals: {
      totalPoints: user.totalPoints,
      streakCount: user.streakCount,
      lastStudyDate: user.lastStudyDate,
    },
  });
}

/**
 * POST /api/sync
 * Body: { userData: object, totals?: { totalPoints, streakCount, lastStudyDate } }
 * Persists the entire study state blob along with denormalized stats.
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: {
    userData?: unknown;
    totals?: {
      totalPoints?: number;
      streakCount?: number;
      lastStudyDate?: string | null;
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  if (!body.userData || typeof body.userData !== "object") {
    return NextResponse.json({ error: "userData가 필요합니다." }, { status: 400 });
  }

  // Sanity check: avoid storing absurdly large blobs (1 MB cap).
  const serialized = JSON.stringify(body.userData);
  if (serialized.length > 1024 * 1024) {
    return NextResponse.json(
      { error: "동기화 데이터가 너무 큽니다 (최대 1MB)." },
      { status: 413 }
    );
  }

  const totals = body.totals ?? {};
  const lastStudyDate =
    typeof totals.lastStudyDate === "string" && totals.lastStudyDate
      ? new Date(totals.lastStudyDate)
      : null;

  const now = new Date();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      userData: body.userData as object,
      syncedAt: now,
      totalPoints:
        typeof totals.totalPoints === "number" ? totals.totalPoints : undefined,
      streakCount:
        typeof totals.streakCount === "number" ? totals.streakCount : undefined,
      lastStudyDate: lastStudyDate ?? undefined,
    },
    select: {
      syncedAt: true,
      totalPoints: true,
      streakCount: true,
      lastStudyDate: true,
    },
  });

  return NextResponse.json({
    success: true,
    syncedAt: updated.syncedAt,
    totals: {
      totalPoints: updated.totalPoints,
      streakCount: updated.streakCount,
      lastStudyDate: updated.lastStudyDate,
    },
  });
}

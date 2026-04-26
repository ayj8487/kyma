import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";

export const runtime = "nodejs";

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email as string | undefined)?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // Block if already a registered account
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // Cooldown: don't allow resending within 60s
    const recent = await prisma.emailVerificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      const elapsed = (Date.now() - recent.createdAt.getTime()) / 1000;
      if (elapsed < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed);
        return NextResponse.json(
          { error: `${wait}초 후에 다시 시도해주세요.` },
          { status: 429 }
        );
      }
    }

    // Invalidate any previous unused codes
    await prisma.emailVerificationCode.deleteMany({ where: { email } });

    // Generate 6-digit code
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await prisma.emailVerificationCode.create({
      data: {
        email,
        code: hashCode(code), // store hash, not plaintext
        expiresAt,
      },
    });

    const result = await sendVerificationCode(email, code);
    if (!result.success) {
      // Roll back the code so the user can retry without hitting cooldown
      await prisma.emailVerificationCode.deleteMany({ where: { email } });
      return NextResponse.json(
        { error: result.error || "이메일 발송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expiresInSeconds: CODE_TTL_MINUTES * 60,
      devMode: result.devMode === true,
    });
  } catch (err) {
    console.error("[/api/auth/send-code]", err);
    return NextResponse.json(
      { error: "인증 코드 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

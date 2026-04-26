import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth-server";

export const runtime = "nodejs";

const MAX_CODE_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, code } = body as {
      name?: string;
      email?: string;
      password?: string;
      code?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "이름, 이메일, 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "6자리 인증 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify the code
    const stored = await prisma.emailVerificationCode.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!stored) {
      return NextResponse.json(
        { error: "인증 코드를 먼저 발송해주세요." },
        { status: 400 }
      );
    }

    if (stored.expiresAt < new Date()) {
      await prisma.emailVerificationCode.deleteMany({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "인증 코드가 만료되었습니다. 다시 발송해주세요." },
        { status: 400 }
      );
    }

    if (stored.attempts >= MAX_CODE_ATTEMPTS) {
      await prisma.emailVerificationCode.deleteMany({ where: { email: normalizedEmail } });
      return NextResponse.json(
        { error: "잘못된 시도가 너무 많습니다. 코드를 다시 발송해주세요." },
        { status: 429 }
      );
    }

    if (stored.code !== hashCode(code)) {
      await prisma.emailVerificationCode.update({
        where: { id: stored.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_CODE_ATTEMPTS - stored.attempts - 1;
      return NextResponse.json(
        {
          error: `인증 코드가 일치하지 않습니다. (남은 시도: ${Math.max(0, remaining)}회)`,
        },
        { status: 400 }
      );
    }

    // Check email duplicate AFTER code verification
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Burn the verification code (one-time use)
    await prisma.emailVerificationCode.deleteMany({
      where: { email: normalizedEmail },
    });

    const token = signSession(user.id);
    const res = NextResponse.json({ success: true, user });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

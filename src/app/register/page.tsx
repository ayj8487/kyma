"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, Send, ShieldCheck } from "lucide-react";
import { register, sendVerificationCode } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // resend cooldown seconds
  const [expiresIn, setExpiresIn] = useState(0); // code expiration seconds

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Expiration timer for the code
  useEffect(() => {
    if (expiresIn <= 0) return;
    const t = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [expiresIn]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleSendCode = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!validateEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setSending(true);
    const result = await sendVerificationCode(email);
    setSending(false);

    if (!result.success) {
      setError(result.error || "인증 코드 발송에 실패했습니다.");
      return;
    }

    setCodeSent(true);
    setCooldown(60);
    setExpiresIn(600); // 10 minutes
    setInfo(
      result.devMode
        ? "✅ 인증 코드를 발송했습니다. (개발 모드: 서버 콘솔에서 코드를 확인하세요)"
        : "✅ 인증 코드를 발송했습니다. 이메일을 확인해주세요."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (!validateEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!codeSent) {
      setError("이메일 인증 코드를 먼저 발송해주세요.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("6자리 인증 코드를 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password, code);

    if (result.success && result.user) {
      setUser(result.user);
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "회원가입에 실패했습니다.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">회원가입</h1>
            <p className="mt-2 text-sm sm:text-base text-accent-indigo dark:text-warm-400">
              Kyma와 함께 일본어 학습을 시작하세요
            </p>
          </div>

          <div className="rounded-2xl border border-warm-200 bg-white p-5 sm:p-8 shadow-sm dark:border-warm-200 dark:bg-warm-100">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  이름
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-foreground placeholder:text-warm-400 focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                  />
                </div>
              </div>

              {/* Email + Send Code */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  이메일
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (codeSent) {
                          // If user changes email, force re-verification
                          setCodeSent(false);
                          setCode("");
                          setExpiresIn(0);
                        }
                      }}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-foreground placeholder:text-warm-400 focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sending || cooldown > 0 || !email}
                    className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-sakura-100 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-sakura-700 transition-colors hover:bg-sakura-200 disabled:opacity-50 dark:bg-sakura-200 dark:text-sakura-800"
                  >
                    {sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sakura-700 border-t-transparent" />
                    ) : cooldown > 0 ? (
                      <span>{cooldown}초</span>
                    ) : (
                      <>
                        <Send size={14} />
                        {codeSent ? "재발송" : "인증"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verification Code (shown after sending) */}
              {codeSent && (
                <div>
                  <label htmlFor="code" className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-sakura-500" />
                      인증 코드
                    </span>
                    {expiresIn > 0 && (
                      <span className="text-xs font-normal text-warm-500">
                        남은 시간 {formatTime(expiresIn)}
                      </span>
                    )}
                    {expiresIn === 0 && (
                      <span className="text-xs font-normal text-red-500">코드 만료됨</span>
                    )}
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6자리 숫자"
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-center text-lg font-mono tracking-[0.4em] text-foreground placeholder:text-warm-400 placeholder:tracking-normal placeholder:text-base placeholder:font-sans focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6자 이상 입력"
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-foreground placeholder:text-warm-400 focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력"
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-foreground placeholder:text-warm-400 focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                  />
                </div>
              </div>

              {info && !error && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  {info}
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !codeSent}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sakura-500 to-sakura-600 py-3 font-semibold text-white transition-all hover:from-sakura-600 hover:to-sakura-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    회원가입
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-accent-indigo dark:text-warm-400">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-semibold text-sakura-500 hover:text-sakura-600">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

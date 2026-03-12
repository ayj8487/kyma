"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Github } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(email, password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "로그인에 실패했습니다.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">로그인</h1>
            <p className="mt-2 text-accent-indigo dark:text-warm-400">
              Kyma에 오신 것을 환영합니다
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-warm-200 bg-white p-8 shadow-sm dark:border-warm-200 dark:bg-warm-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  이메일
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-foreground placeholder:text-warm-400 focus:border-sakura-400 focus:outline-none focus:ring-2 focus:ring-sakura-200 dark:border-warm-300 dark:bg-warm-50 dark:focus:ring-sakura-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                  />
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

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sakura-500 to-sakura-600 py-3 font-semibold text-white transition-all hover:from-sakura-600 hover:to-sakura-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn size={18} />
                    로그인
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-warm-200 dark:bg-warm-300" />
              <span className="text-xs text-warm-400">소셜 로그인</span>
              <div className="h-px flex-1 bg-warm-200 dark:bg-warm-300" />
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-warm-200 bg-warm-50 py-3 text-sm font-medium text-warm-400 dark:border-warm-300 dark:bg-warm-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google (준비 중)
              </button>

              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-warm-200 bg-warm-50 py-3 text-sm font-medium text-warm-400 dark:border-warm-300 dark:bg-warm-100"
              >
                <Github size={20} />
                GitHub (준비 중)
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-accent-indigo dark:text-warm-400">
              계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="font-semibold text-sakura-500 hover:text-sakura-600"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { register } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password);

    if (result.success && result.user) {
      // Push the new user into AuthProvider so the Navbar updates immediately.
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
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">회원가입</h1>
            <p className="mt-2 text-sm sm:text-base text-accent-indigo dark:text-warm-400">
              Kyma와 함께 일본어 학습을 시작하세요
            </p>
          </div>

          {/* Register Card */}
          <div className="rounded-2xl border border-warm-200 bg-white p-5 sm:p-8 shadow-sm dark:border-warm-200 dark:bg-warm-100">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  이름
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                  />
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
                  />
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
                    <UserPlus size={18} />
                    회원가입
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-accent-indigo dark:text-warm-400">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-semibold text-sakura-500 hover:text-sakura-600"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

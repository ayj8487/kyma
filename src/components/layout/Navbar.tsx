"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  GraduationCap,
  FileQuestion,
  BarChart3,
  Menu,
  X,
  BookText,
  Keyboard,
  Bot,
  Newspaper,
  Film,
  RotateCcw,
  Bookmark,
  Target,
  Camera,
  ChevronDown,
  MoreHorizontal,
  Sun,
  Moon,
  Monitor,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
} from "lucide-react";
import { useThemeStore, applyTheme } from "@/store/useThemeStore";
import { useAuth } from "@/components/AuthProvider";
import { logout as authLogout } from "@/lib/auth";
import { useStudyStore } from "@/store/useStudyStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navLinks: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: Home },
  { href: "/kana", label: "가나", icon: BookOpen },
  { href: "/words", label: "단어", icon: GraduationCap },
  { href: "/grammar", label: "문법", icon: BookText },
  { href: "/quiz", label: "퀴즈", icon: FileQuestion },
  { href: "/review", label: "복습", icon: RotateCcw },
  { href: "/typing", label: "타자", icon: Keyboard },
  { href: "/ai", label: "AI", icon: Bot },
  { href: "/news", label: "뉴스", icon: Newspaper },
  { href: "/anime", label: "애니", icon: Film },
];

const moreLinks: NavItem[] = [
  { href: "/progress", label: "진행도", icon: BarChart3 },
  { href: "/goals", label: "목표", icon: Target },
  { href: "/bookmarks", label: "단어장", icon: Bookmark },
  { href: "/camera", label: "카메라", icon: Camera },
];

const themeOptions = [
  { value: "light" as const, label: "라이트", icon: Sun },
  { value: "dark" as const, label: "다크", icon: Moon },
  { value: "system" as const, label: "시스템", icon: Monitor },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useThemeStore();
  const { user, setUser } = useAuth();
  const syncStatus = useStudyStore((s) => s.syncStatus);
  const lastSyncedAt = useStudyStore((s) => s.lastSyncedAt);
  const pushToServer = useStudyStore((s) => s.pushToServer);

  const [now, setNow] = useState(() => Date.now());

  // Refresh "n minutes ago" label every 30s (only while a user is signed in).
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
    setIsUserOpen(false);
    setIsMobileMenuOpen(false);
  };

  const formatSyncTime = (iso: string | null, nowMs: number) => {
    if (!iso) return "동기화 기록 없음";
    const diff = nowMs - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 동기화됨";
    if (mins < 60) return `${mins}분 전 동기화`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전 동기화`;
    return `${Math.floor(hours / 24)}일 전 동기화`;
  };

  const cycleTheme = () => {
    const order = ["light", "dark", "system"] as const;
    const next = order[(order.indexOf(theme) + 1) % 3];
    setTheme(next);
    applyTheme(next);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close "더보기" / user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMoreActive = moreLinks.some(
    (link) => pathname === link.href || pathname.startsWith(link.href + "/")
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-1.5" onClick={closeMobileMenu}>
            <span className="text-xl font-bold text-pink-400">Kyma</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              きょうま
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-pink-50 text-pink-500 dark:bg-pink-950/30"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  isMoreActive
                    ? "bg-pink-50 text-pink-500 dark:bg-pink-950/30"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <MoreHorizontal size={15} />
                더보기
                <ChevronDown size={12} className={`transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-zinc-900/50">
                  {moreLinks.map(({ href, label, icon: Icon }) => {
                    const isActive =
                      pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-pink-50 text-pink-500 dark:bg-pink-950/30"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  })}

                  {/* Theme toggle */}
                  <div className="mx-3 my-1.5 border-t border-gray-100 dark:border-zinc-700" />
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 mb-1.5">테마</p>
                    <div className="flex gap-0.5 rounded-lg bg-gray-100 dark:bg-zinc-700 p-0.5">
                      {themeOptions.map((opt) => {
                        const ThemeIcon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => { setTheme(opt.value); applyTheme(opt.value); }}
                            className={`flex-1 flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                              theme === opt.value
                                ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-600 dark:text-zinc-100"
                                : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            }`}
                          >
                            <ThemeIcon size={12} />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative ml-1" ref={userRef}>
              {user ? (
                <button
                  onClick={() => setIsUserOpen((p) => !p)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  aria-label="사용자 메뉴"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  {syncStatus === "syncing" ? (
                    <RefreshCw size={11} className="animate-spin text-pink-400" />
                  ) : syncStatus === "error" ? (
                    <CloudOff size={11} className="text-red-400" />
                  ) : null}
                  <ChevronDown size={12} className={`transition-transform ${isUserOpen ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-pink-500 transition-colors hover:bg-pink-50 dark:hover:bg-pink-950/30"
                >
                  <LogIn size={15} />
                  로그인
                </Link>
              )}

              {user && isUserOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-zinc-900/50">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-700">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {user.name || "사용자"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                  </div>
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                        {syncStatus === "syncing" ? (
                          <RefreshCw size={12} className="animate-spin text-pink-400" />
                        ) : syncStatus === "error" ? (
                          <CloudOff size={12} className="text-red-400" />
                        ) : syncStatus === "success" ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Cloud size={12} />
                        )}
                        <span>{formatSyncTime(lastSyncedAt, now)}</span>
                      </div>
                      <button
                        onClick={() => pushToServer()}
                        disabled={syncStatus === "syncing"}
                        className="rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600 hover:bg-pink-100 disabled:opacity-50 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50"
                      >
                        지금 동기화
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-zinc-700">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                    >
                      <LogOut size={15} />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-900 max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="space-y-0.5 px-4 py-3">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-pink-50 text-pink-500 dark:bg-pink-950/30"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            {/* Separator */}
            <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />
            <p className="px-3 py-1 text-xs font-medium text-gray-300 dark:text-zinc-600">
              더보기
            </p>

            {moreLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-pink-50 text-pink-500 dark:bg-pink-950/30"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            {/* Theme toggle */}
            <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />
            <p className="px-3 py-1 text-xs font-medium text-gray-300 dark:text-zinc-600">
              테마
            </p>
            <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-zinc-800 p-0.5 mx-3">
              {themeOptions.map((opt) => {
                const ThemeIcon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { setTheme(opt.value); applyTheme(opt.value); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      theme === opt.value
                        ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <ThemeIcon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* User section (mobile) */}
            <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />
            {user ? (
              <div className="px-3 py-2">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600 dark:bg-pink-950/40 dark:text-pink-300">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {user.name || "사용자"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                    {syncStatus === "syncing" ? (
                      <RefreshCw size={12} className="animate-spin text-pink-400" />
                    ) : syncStatus === "error" ? (
                      <CloudOff size={12} className="text-red-400" />
                    ) : syncStatus === "success" ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <Cloud size={12} />
                    )}
                    <span>{formatSyncTime(lastSyncedAt, now)}</span>
                  </div>
                  <button
                    onClick={() => pushToServer()}
                    disabled={syncStatus === "syncing"}
                    className="rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600 hover:bg-pink-100 disabled:opacity-50 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50"
                  >
                    동기화
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30"
              >
                <LogIn size={18} />
                로그인 / 회원가입
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

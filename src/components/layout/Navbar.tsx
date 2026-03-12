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
  Settings,
  MoreHorizontal,
} from "lucide-react";

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
  { href: "/bookmarks", label: "북마크", icon: Bookmark },
  { href: "/camera", label: "카메라", icon: Camera },
  { href: "/admin", label: "관리자", icon: Settings },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close "더보기" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMoreActive = moreLinks.some(
    (link) => pathname === link.href || pathname.startsWith(link.href + "/")
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-1.5" onClick={closeMobileMenu}>
            <span className="text-xl font-bold text-pink-400">Kyma</span>
            <span className="text-xs text-gray-400">
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
                      ? "bg-pink-50 text-pink-500"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
                    ? "bg-pink-50 text-pink-500"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <MoreHorizontal size={15} />
                더보기
                <ChevronDown size={12} className={`transition-transform ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-gray-100">
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
                            ? "bg-pink-50 text-pink-500"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 md:hidden"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
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
                      ? "bg-pink-50 text-pink-500"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            {/* Separator */}
            <div className="my-2 border-t border-gray-100" />
            <p className="px-3 py-1 text-xs font-medium text-gray-300">
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
                      ? "bg-pink-50 text-pink-500"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

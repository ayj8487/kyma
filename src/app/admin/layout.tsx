"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  Menu,
  X,
  Shield,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/words", label: "단어 관리", icon: BookOpen },
  { href: "/admin/quiz", label: "퀴즈 관리", icon: FileQuestion },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r border-warm-200 bg-white transition-transform duration-200 ease-in-out dark:border-warm-300 dark:bg-[#0f0f1a] lg:relative lg:top-0 lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2 border-b border-warm-200 px-4 py-4 dark:border-warm-300">
          <Shield size={20} className="text-sakura-500" />
          <h2 className="text-lg font-bold text-accent-indigo dark:text-warm-400">
            관리자 패널
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-200 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 p-3">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sakura-50 text-sakura-600 dark:bg-sakura-100 dark:text-sakura-500"
                    : "text-accent-indigo hover:bg-warm-100 hover:text-sakura-500 dark:text-warm-400 dark:hover:bg-warm-200 dark:hover:text-sakura-400"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1">
        {/* Mobile menu button */}
        <div className="border-b border-warm-200 px-4 py-3 dark:border-warm-300 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-accent-indigo hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-200"
          >
            <Menu size={18} />
            관리자 메뉴
          </button>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  Users,
  Activity,
  BookOpen,
  FileQuestion,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statsCards = [
  {
    label: "총 사용자 수",
    value: "1,247",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    label: "오늘 활성 사용자",
    value: "89",
    icon: Activity,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    label: "총 학습 콘텐츠",
    value: "312",
    icon: BookOpen,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    label: "총 퀴즈 시도",
    value: "5,832",
    icon: FileQuestion,
    color: "text-sakura-500",
    bgColor: "bg-sakura-50",
  },
];

const dailyActiveUsersData = [
  { day: "월", users: 65 },
  { day: "화", users: 78 },
  { day: "수", users: 92 },
  { day: "목", users: 81 },
  { day: "금", users: 56 },
  { day: "토", users: 110 },
  { day: "일", users: 89 },
];

const quickLinks = [
  {
    href: "/admin/words",
    label: "단어 관리",
    description: "단어를 추가, 수정, 삭제합니다",
    icon: BookOpen,
  },
  {
    href: "/admin/quiz",
    label: "퀴즈 관리",
    description: "퀴즈 문제를 관리합니다",
    icon: FileQuestion,
  },
  {
    href: "/admin/users",
    label: "사용자 관리",
    description: "사용자 목록을 확인합니다",
    icon: Users,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-accent-indigo dark:text-warm-400">
          관리자 대시보드
        </h1>
        <p className="mt-1 text-sm text-warm-500">
          Kyma 학습 플랫폼 관리 현황
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(({ label, value, icon: Icon, color, bgColor }) => (
          <div
            key={label}
            className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm dark:border-warm-300 dark:bg-[#1a1a2e]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warm-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-accent-indigo dark:text-warm-400">
                  {value}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${bgColor}`}>
                <Icon size={22} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and quick links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily active users chart */}
        <div className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm dark:border-warm-300 dark:bg-[#1a1a2e] lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-accent-indigo dark:text-warm-400">
            일별 활성 사용자
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActiveUsersData}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value) => [`${value}명`, "활성 사용자"]}
                />
                <Bar
                  dataKey="users"
                  fill="#f472b6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm dark:border-warm-300 dark:bg-[#1a1a2e]">
          <h2 className="mb-4 text-lg font-semibold text-accent-indigo dark:text-warm-400">
            빠른 링크
          </h2>
          <div className="space-y-3">
            {quickLinks.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-lg border border-warm-200 p-3 transition-colors hover:border-sakura-300 hover:bg-sakura-50 dark:border-warm-300 dark:hover:border-sakura-400 dark:hover:bg-sakura-100"
              >
                <div className="rounded-lg bg-warm-100 p-2 dark:bg-warm-200">
                  <Icon
                    size={18}
                    className="text-warm-500 group-hover:text-sakura-500"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-accent-indigo dark:text-warm-400">
                    {label}
                  </p>
                  <p className="text-xs text-warm-500">{description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-warm-400 transition-transform group-hover:translate-x-1 group-hover:text-sakura-500"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileQuestion,
  Target,
  Flame,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";

const quickAccessCards = [
  {
    href: "/kana/hiragana",
    label: "히라가나",
    description: "기본 문자 학습",
    icon: BookOpen,
    color: "from-pink-500 to-rose-400",
  },
  {
    href: "/kana/katakana",
    label: "가타카나",
    description: "외래어 문자 학습",
    icon: BookOpen,
    color: "from-purple-500 to-violet-400",
  },
  {
    href: "/words",
    label: "단어",
    description: "어휘력 키우기",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-400",
  },
  {
    href: "/quiz",
    label: "퀴즈",
    description: "실력 테스트",
    icon: FileQuestion,
    color: "from-emerald-500 to-teal-400",
  },
];

export default function DashboardPage() {
  const {
    progress,
    streakCount,
    todayStudyCount,
    todayDate,
    getCorrectRate,
  } = useStudyStore();

  const today = new Date().toISOString().split("T")[0];
  const displayStudyCount = todayDate === today ? todayStudyCount : 0;

  const kanaEntries = Object.values(progress).filter(
    (p) => p.contentType === "hiragana" || p.contentType === "katakana"
  );
  const wordEntries = Object.values(progress).filter(
    (p) => p.contentType === "word"
  );
  const correctRate = getCorrectRate();

  const stats = [
    {
      label: "학습한 가나 수",
      value: kanaEntries.length,
      unit: "개",
      icon: BookOpen,
      accent: "text-sakura-500",
      bg: "bg-sakura-50 dark:bg-sakura-100",
    },
    {
      label: "학습한 단어 수",
      value: wordEntries.length,
      unit: "개",
      icon: GraduationCap,
      accent: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "퀴즈 정답률",
      value: correctRate,
      unit: "%",
      icon: Target,
      accent: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "연속 학습일",
      value: streakCount,
      unit: "일",
      icon: Flame,
      accent: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            오늘도 일본어 공부 화이팅! 💪
          </h1>
          <p className="mt-2 text-accent-indigo dark:text-warm-400">
            꾸준한 학습이 실력 향상의 비결입니다
          </p>
        </div>

        {/* Today's Study Count */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-sakura-200 bg-gradient-to-r from-sakura-50 to-warm-50 p-4 dark:border-sakura-300 dark:from-sakura-100 dark:to-warm-100 sm:p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sakura-100 dark:bg-sakura-200">
            <Zap size={24} className="text-sakura-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-accent-indigo dark:text-warm-400">
              오늘의 학습
            </p>
            <p className="text-2xl font-bold text-foreground">
              {displayStudyCount}
              <span className="ml-1 text-base font-normal text-accent-indigo dark:text-warm-400">
                회
              </span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, unit, icon: Icon, accent, bg }) => (
            <div
              key={label}
              className="rounded-2xl border border-warm-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-warm-200 dark:bg-warm-100"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${bg}`}>
                  <Icon size={20} className={accent} />
                </div>
                <TrendingUp size={16} className="text-warm-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {value}
                  <span className="ml-0.5 text-sm font-normal text-accent-indigo dark:text-warm-400">
                    {unit}
                  </span>
                </p>
                <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="mb-5 text-xl font-bold text-foreground">
            빠른 학습
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickAccessCards.map(
              ({ href, label, description, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative overflow-hidden rounded-2xl border border-warm-200 bg-white p-6 transition-all hover:border-sakura-200 hover:shadow-lg dark:border-warm-200 dark:bg-warm-100 dark:hover:border-sakura-300"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {label}
                  </h3>
                  <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                    {description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-sakura-500 transition-transform group-hover:translate-x-1">
                    학습하기
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

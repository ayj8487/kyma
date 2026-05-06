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
  Bookmark,
  Sparkles,
  Camera,
  Bell,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { useStudyStore } from "@/store/useStudyStore";
import { useAuth } from "@/components/AuthProvider";
import { meigen } from "@/data/meigen";
import { kaomoji } from "@/data/kaomoji";

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
  {
    href: "/bookmarks",
    label: "단어장",
    description: "저장한 학습 항목",
    icon: Bookmark,
    color: "from-yellow-500 to-amber-400",
  },
  {
    href: "/ai/conversation",
    label: "AI 자유대화",
    description: "AI와 일본어 회화",
    icon: Sparkles,
    color: "from-pink-500 to-fuchsia-400",
  },
  {
    href: "/camera",
    label: "카메라 번역",
    description: "사진으로 일본어 번역",
    icon: Camera,
    color: "from-cyan-500 to-blue-400",
  },
];


const getDayIndex = () => {
  const now = new Date();
  const start = new Date(2025, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    progress,
    streakCount,
    todayStudyCount,
    todayDate,
    dailyGoal,
    getCorrectRate,
    getDueItems,
  } = useStudyStore();

  const dueItems = getDueItems();

  // 마우스 드래그 스크롤
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft - (x - startX);
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  const today = new Date().toISOString().split("T")[0];
  const todayCount = todayDate === today ? todayStudyCount : 0;
  const displayStudyCount = todayCount;
  const goalProgress = Math.min(100, Math.round((todayCount / dailyGoal) * 100));
  const goalReached = todayCount >= dailyGoal;
  const userName = user?.name || (user?.email ? user.email.split("@")[0] : null);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "늦은 시간까지 화이팅";
    if (h < 12) return "좋은 아침이에요";
    if (h < 18) return "오늘도 화이팅";
    return "수고 많으셨어요";
  })();
  const hasKanaProgress = Object.values(progress).some(
    (p) => p.contentType === "hiragana" || p.contentType === "katakana"
  );
  const hasWordProgress = Object.values(progress).some(
    (p) => p.contentType === "word"
  );
  const resumeHref =
    dueItems.length > 0
      ? "/review"
      : !hasKanaProgress
        ? "/kana/hiragana"
        : !hasWordProgress
          ? "/words/N5"
          : "/review";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 로그인 사용자 환영 카드 */}
        {user && (
          <div className="mb-6 rounded-2xl border border-sakura-200 bg-gradient-to-br from-sakura-50 via-white to-warm-50 p-5 sm:p-6 dark:border-sakura-300 dark:from-sakura-100 dark:via-warm-50 dark:to-warm-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-sakura-500 font-medium">{greeting}</span>
                  {streakCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                      <Flame size={11} className="fill-orange-500 text-orange-500" />
                      {streakCount}일 연속
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {userName}님 🌸
                </h2>
                <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                  {goalReached
                    ? `오늘 목표 달성! 멋져요 (${todayCount}/${dailyGoal})`
                    : todayCount === 0
                      ? `오늘 학습을 시작해보세요 (목표 ${dailyGoal}회)`
                      : `오늘 ${todayCount}/${dailyGoal}회 학습 중`}
                </p>

                {/* 진행 바 */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-warm-200 dark:bg-warm-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goalReached
                        ? "bg-gradient-to-r from-emerald-400 to-green-500"
                        : "bg-gradient-to-r from-sakura-400 to-rose-400"
                    }`}
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <Link
                  href={resumeHref}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sakura-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
                >
                  {dueItems.length > 0 ? <RotateCcw size={16} /> : <PlayCircle size={16} />}
                  {dueItems.length > 0 ? `복습 ${dueItems.length}개` : "이어서 학습"}
                </Link>
                <Link
                  href="/goals"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-warm-300 bg-white dark:bg-warm-50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-warm-50 dark:hover:bg-warm-100 transition-colors"
                >
                  <Target size={15} />
                  목표
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 비로그인 사용자: 가입 유도 */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-sakura-200 bg-gradient-to-br from-sakura-50 to-warm-50 p-5 sm:p-6 dark:border-sakura-300 dark:from-sakura-100 dark:to-warm-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  학습 데이터를 모든 기기에서 동기화하세요 🌸
                </h2>
                <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                  무료 회원가입 후 진도, 북마크, 퀴즈 기록을 안전하게 보관하세요
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sakura-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-[0.97] transition-all"
                >
                  회원가입
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-warm-300 bg-white dark:bg-warm-50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-warm-50 dark:hover:bg-warm-100 transition-colors"
                >
                  로그인
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 今日の名言 */}
        {(() => {
          const idx = getDayIndex();
          const todayMeigen = meigen[((idx % meigen.length) + meigen.length) % meigen.length];
          const todayKaomoji = kaomoji[((idx % kaomoji.length) + kaomoji.length) % kaomoji.length];
          return (
            <div className="mb-8">
              <p className="text-xs text-indigo-400 mb-1">今日の名言（きょうのめいげん）</p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {todayMeigen.text}
              </h1>
              <p className="text-xs text-gray-400 mt-1">{todayMeigen.reading}</p>
              <p className="text-sm text-gray-500 mt-0.5">{todayMeigen.korean}</p>
              <p className="mt-2 text-accent-indigo dark:text-warm-400">
                꾸준한 학습이 실력 향상의 비결입니다 {todayKaomoji}
              </p>
            </div>
          );
        })()}

        {/* SRS 복습 알림 */}
        {dueItems.length > 0 && (
          <Link
            href="/review"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 transition-all hover:border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
              <Bell size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                복습할 항목이 {dueItems.length}개 있습니다!
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                SRS 복습을 통해 기억을 강화하세요
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-amber-500 dark:text-amber-400" />
          </Link>
        )}

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
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
          >
            {quickAccessCards.map(
              ({ href, label, description, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex min-w-[160px] flex-shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-warm-200 bg-white px-5 py-4 transition-all hover:border-sakura-200 hover:shadow-lg active:scale-[0.97] dark:border-warm-200 dark:bg-warm-100 dark:hover:border-sakura-300"
                >
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {label}
                  </h3>
                  <p className="text-xs text-accent-indigo dark:text-warm-400 whitespace-nowrap">
                    {description}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

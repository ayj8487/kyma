"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStudyStore } from "@/store/useStudyStore";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { grammarPoints } from "@/data/grammar";
import { animeQuotes } from "@/data/anime-quotes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Languages,
  BookOpen,
  Target,
  Flame,
  Star,
  TrendingUp,
  RotateCcw,
  Bookmark,
} from "lucide-react";

export default function ProgressPage() {
  const [showResetModal, setShowResetModal] = useState(false);

  const progress = useStudyStore((s) => s.progress);
  const quizHistory = useStudyStore((s) => s.quizHistory);
  const streakCount = useStudyStore((s) => s.streakCount);
  const totalPoints = useStudyStore((s) => s.totalPoints);
  const getCorrectRate = useStudyStore((s) => s.getCorrectRate);
  const getMasteredCount = useStudyStore((s) => s.getMasteredCount);
  const resetAllProgress = useStudyStore((s) => s.resetAllProgress);

  const correctRate = getCorrectRate();
  const hiraganaMastered = getMasteredCount("kana");
  const katakanaMastered = getMasteredCount("katakana");
  const wordsMastered = getMasteredCount("word");
  const bookmarkedWords = useStudyStore((s) =>
    Object.keys(s.bookmarks).filter((k) => k.startsWith("word:")).length
  );
  const bookmarkedGrammar = useStudyStore((s) =>
    Object.keys(s.bookmarks).filter((k) => k.startsWith("grammar:")).length
  );
  const bookmarkedAnime = useStudyStore((s) =>
    Object.keys(s.bookmarks).filter((k) => k.startsWith("anime:")).length
  );

  const totalHiragana = hiraganaData.length;
  const totalKatakana = katakanaData.length;
  const totalN5 = n5Words.length;
  const totalN4 = n4Words.length;
  const totalN3 = n3Words.length;
  const totalN2 = n2Words.length;
  const totalAllWords = totalN5 + totalN4 + totalN3 + totalN2;
  void grammarPoints; // available for future grammar progress
  void animeQuotes;  // available for future anime progress

  // Per-level word mastery (we use word IDs to determine level)
  const n5MasteredCount = useMemo(() => {
    const n5Ids = new Set(n5Words.map((w) => w.id));
    return Object.values(progress).filter(
      (p) => p.contentType === "word" && n5Ids.has(p.contentId) && p.status === "mastered"
    ).length;
  }, [progress]);

  const n4MasteredCount = useMemo(() => {
    const n4Ids = new Set(n4Words.map((w) => w.id));
    return Object.values(progress).filter(
      (p) => p.contentType === "word" && n4Ids.has(p.contentId) && p.status === "mastered"
    ).length;
  }, [progress]);

  const n3MasteredCount = useMemo(() => {
    const n3Ids = new Set(n3Words.map((w) => w.id));
    return Object.values(progress).filter(
      (p) => p.contentType === "word" && n3Ids.has(p.contentId) && p.status === "mastered"
    ).length;
  }, [progress]);

  const n2MasteredCount = useMemo(() => {
    const n2Ids = new Set(n2Words.map((w) => w.id));
    return Object.values(progress).filter(
      (p) => p.contentType === "word" && n2Ids.has(p.contentId) && p.status === "mastered"
    ).length;
  }, [progress]);

  const kanaLearned = useMemo(() => {
    return Object.values(progress).filter(
      (p) =>
        (p.contentType === "kana" || p.contentType === "katakana") &&
        (p.status === "learning" || p.status === "mastered")
    ).length;
  }, [progress]);

  const wordsLearned = useMemo(() => {
    return Object.values(progress).filter(
      (p) =>
        p.contentType === "word" &&
        (p.status === "learning" || p.status === "mastered")
    ).length;
  }, [progress]);

  // Weekly study data for the chart
  const weeklyData = useMemo(() => {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    return days.map((dayLabel, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + idx);
      const dateStr = date.toISOString().split("T")[0];

      const quizzesOnDay = quizHistory.filter((q) => q.date === dateStr);
      const count = quizzesOnDay.length;

      return {
        day: dayLabel,
        학습: count,
      };
    });
  }, [quizHistory]);

  const recentQuizzes = useMemo(() => {
    return [...quizHistory].reverse().slice(0, 10);
  }, [quizHistory]);

  const hiraganaPercent = totalHiragana > 0 ? Math.round((hiraganaMastered / totalHiragana) * 100) : 0;
  const katakanaPercent = totalKatakana > 0 ? Math.round((katakanaMastered / totalKatakana) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                학습 현황
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                나의 학습 진도와 통계를 확인하세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Languages className="mb-2 h-5 w-5 text-violet-500" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {kanaLearned}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              학습한 가나
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <BookOpen className="mb-2 h-5 w-5 text-indigo-500" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {wordsLearned}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              학습한 단어
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Target className="mb-2 h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {correctRate}%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              퀴즈 정답률
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Flame className="mb-2 h-5 w-5 text-orange-500" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {streakCount}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              연속 학습일
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <Star className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {totalPoints}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              총 포인트
            </p>
          </div>
        </div>

        {/* Mastery progress - Kana */}
        <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Languages className="h-5 w-5 text-violet-500" />
            가나 진행도
          </h2>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">히라가나</span>
              <span className="text-zinc-500 dark:text-zinc-400">{hiraganaMastered} / {totalHiragana}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${hiraganaPercent}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">카타카나</span>
              <span className="text-zinc-500 dark:text-zinc-400">{katakanaMastered} / {totalKatakana}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
              <div className="h-full rounded-full bg-pink-500 transition-all duration-500" style={{ width: `${katakanaPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Mastery progress - Words */}
        <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            단어 마스터 진행도
            <span className="ml-auto text-sm font-normal text-zinc-400">{wordsMastered} / {totalAllWords}</span>
          </h2>
          {[
            { label: "N5", mastered: n5MasteredCount, total: totalN5, color: "bg-emerald-500" },
            { label: "N4", mastered: n4MasteredCount, total: totalN4, color: "bg-blue-500" },
            { label: "N3", mastered: n3MasteredCount, total: totalN3, color: "bg-indigo-500" },
            { label: "N2", mastered: n2MasteredCount, total: totalN2, color: "bg-violet-500" },
          ].map(({ label, mastered, total, color }) => {
            const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
            return (
              <div key={label} className="mb-4 last:mb-0">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
                    {label}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">{mastered} / {total} <span className="text-xs opacity-60">({pct}%)</span></span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
                  <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bookmarks summary */}
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Bookmark className="h-5 w-5 text-yellow-500" />
            단어장 저장 현황
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{bookmarkedWords}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">저장된 단어</p>
            </div>
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{bookmarkedGrammar}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">저장된 문법</p>
            </div>
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 text-center">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{bookmarkedAnime}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">저장된 대사</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 justify-center">
            <Link href="/bookmarks" className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400">단어장 바로가기 →</Link>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            주간 학습 활동
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="학습"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz history */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            최근 퀴즈 기록
          </h2>

          {recentQuizzes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                아직 퀴즈 기록이 없습니다.
              </p>
              <Link
                href="/quiz"
                className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                퀴즈 풀러 가기 &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((quiz, idx) => {
                const accuracy = Math.round(
                  (quiz.correctAnswers / quiz.totalQuestions) * 100
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                          quiz.type === "가나"
                            ? "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                            : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                        }`}
                      >
                        {quiz.type === "가나" ? "あ" : "漢"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {quiz.type} 퀴즈
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {quiz.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          accuracy >= 80
                            ? "text-emerald-600 dark:text-emerald-400"
                            : accuracy >= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {accuracy}%
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {quiz.correctAnswers}/{quiz.totalQuestions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              학습 현황 초기화
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              모든 학습 데이터가 삭제됩니다. 진행도, 퀴즈 기록, 포인트, 연속 학습일, 단어장이 모두 초기화됩니다.
            </p>
            <p className="mt-1 text-xs text-red-500">
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  resetAllProgress();
                  setShowResetModal(false);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

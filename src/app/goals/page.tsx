"use client";

import { useStudyStore } from "@/store/useStudyStore";
import { Target, Flame, Calendar, TrendingUp } from "lucide-react";

export default function GoalsPage() {
  const { dailyGoal, setDailyGoal, todayStudyCount, streakCount, studyHistory, totalPoints } = useStudyStore();

  const today = new Date().toISOString().split("T")[0];
  const dailyProgress = Math.min((todayStudyCount / dailyGoal) * 100, 100);

  // Weekly progress
  const weekDays: { date: string; count: number; label: string }[] = [];
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weekDays.push({ date: dateStr, count: studyHistory[dateStr] || 0, label: dayLabels[d.getDay()] });
  }
  const weeklyTotal = weekDays.reduce((s, d) => s + d.count, 0);

  // 30-day calendar
  const calendarDays: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    calendarDays.push({ date: dateStr, count: studyHistory[dateStr] || 0 });
  }
  const maxCount = Math.max(...calendarDays.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "bg-green-600";
    if (intensity > 0.5) return "bg-green-500";
    if (intensity > 0.25) return "bg-green-400";
    return "bg-green-200";
  };

  const messages = [
    { min: 0, max: 0, msg: "오늘 첫 학습을 시작해보세요! 🚀" },
    { min: 1, max: 4, msg: "좋은 시작입니다! 계속 화이팅! 💪" },
    { min: 5, max: 9, msg: "훌륭해요! 목표에 거의 다 왔어요! 🔥" },
    { min: 10, max: 999, msg: "목표 달성! 대단합니다! 🎉" },
  ];
  const motivMsg = messages.find((m) => todayStudyCount >= m.min && todayStudyCount <= m.max)?.msg || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Target className="text-indigo-600" /> 학습 목표</h1>
      <p className="text-gray-600 mb-8">매일 꾸준히 학습 목표를 달성하세요</p>

      {/* Daily Goal Setting */}
      <div className="bg-white border rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">일일 학습 목표</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {[5, 10, 15, 20, 30].map((g) => (
            <button key={g} onClick={() => setDailyGoal(g)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dailyGoal === g ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {g}개/일
            </button>
          ))}
        </div>

        {/* Circular Progress */}
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#4f46e5" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - dailyProgress / 100)}`} strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{todayStudyCount}</span>
              <span className="text-xs text-gray-400">/ {dailyGoal}</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-medium mb-1">{motivMsg}</p>
            <p className="text-sm text-gray-500">오늘 {todayStudyCount}개 학습 완료 ({Math.round(dailyProgress)}%)</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4 text-center">
          <Flame className="mx-auto text-orange-500 mb-2" size={24} />
          <div className="text-2xl font-bold">{streakCount}</div>
          <div className="text-xs text-gray-500">연속 학습일</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <Calendar className="mx-auto text-blue-500 mb-2" size={24} />
          <div className="text-2xl font-bold">{weeklyTotal}</div>
          <div className="text-xs text-gray-500">이번 주 학습</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-xs text-gray-500">총 포인트</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <Target className="mx-auto text-violet-500 mb-2" size={24} />
          <div className="text-2xl font-bold">{dailyGoal * 7}</div>
          <div className="text-xs text-gray-500">주간 목표</div>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="bg-white border rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">이번 주 학습량</h2>
        <div className="flex items-end gap-2 h-32">
          {weekDays.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{d.count}</span>
              <div className={`w-full rounded-t-lg transition-all ${d.count > 0 ? "bg-indigo-500" : "bg-gray-100"}`} style={{ height: `${Math.max((d.count / Math.max(...weekDays.map((x) => x.count), 1)) * 100, 4)}%` }} />
              <span className={`text-xs ${d.date === today ? "font-bold text-indigo-600" : "text-gray-400"}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day Calendar */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">최근 30일 학습 현황</h2>
        <div className="grid grid-cols-10 gap-1">
          {calendarDays.map((d) => (
            <div key={d.date} className={`w-full aspect-square rounded-sm ${getColor(d.count)} transition-colors`} title={`${d.date}: ${d.count}개`} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end text-xs text-gray-400">
          <span>적음</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>많음</span>
        </div>
      </div>
    </div>
  );
}

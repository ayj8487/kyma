"use client";

import { useState, useMemo, useCallback } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";

type TabType = "today" | "wrong" | "all";

function getContentInfo(contentType: string, contentId: string) {
  if (contentType === "hiragana") {
    const kana = hiraganaData.find((k) => k.id === contentId);
    return kana
      ? { display: kana.character, sub: kana.romaji, label: "히라가나" }
      : null;
  }
  if (contentType === "katakana") {
    const kana = katakanaData.find((k) => k.id === contentId);
    return kana
      ? { display: kana.character, sub: kana.romaji, label: "가타카나" }
      : null;
  }
  if (contentType === "word") {
    const word = n5Words.find((w) => w.id === contentId);
    return word
      ? { display: word.word, sub: `${word.reading} - ${word.meaning}`, label: "단어" }
      : null;
  }
  return null;
}

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  const {
    progress,
    getDueItems,
    getWrongItems,
    updateSRS,
    incrementStudyCount,
  } = useStudyStore();

  const dueItems = useMemo(() => getDueItems(), [progress]);
  const wrongItems = useMemo(() => getWrongItems(), [progress]);
  const allItems = useMemo(() => Object.values(progress), [progress]);

  const learningItems = useMemo(
    () => allItems.filter((p) => p.status === "learning"),
    [allItems]
  );
  const masteredItems = useMemo(
    () => allItems.filter((p) => p.status === "mastered"),
    [allItems]
  );

  const currentReviewItems = activeTab === "today" ? dueItems : wrongItems;
  const currentItem = currentReviewItems[currentIndex];

  const handleAnswer = useCallback(
    (quality: number) => {
      if (!currentItem) return;

      updateSRS(currentItem.contentType, currentItem.contentId, quality);
      incrementStudyCount();

      setSessionStats((prev) => ({
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
      }));

      setShowAnswer(false);

      if (currentIndex < currentReviewItems.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setReviewMode(false);
        setCurrentIndex(0);
      }
    },
    [currentItem, currentIndex, currentReviewItems.length, updateSRS, incrementStudyCount]
  );

  const startReview = () => {
    setReviewMode(true);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const tabs = [
    { id: "today" as TabType, label: "오늘의 복습", count: dueItems.length },
    { id: "wrong" as TabType, label: "틀린 문제", count: wrongItems.length },
    { id: "all" as TabType, label: "전체 복습", count: allItems.length },
  ];

  const contentInfo = currentItem
    ? getContentInfo(currentItem.contentType, currentItem.contentId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            복습하기
          </h1>
          <p className="mt-2 text-accent-indigo dark:text-warm-400">
            간격 반복 학습으로 효과적으로 복습하세요
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-1 rounded-xl bg-warm-100 p-1 dark:bg-warm-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setReviewMode(false);
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm dark:bg-warm-100 dark:text-foreground"
                  : "text-accent-indigo hover:text-foreground dark:text-warm-400"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sakura-100 px-1.5 text-xs font-semibold text-sakura-600 dark:bg-sakura-200 dark:text-sakura-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Today's Review Tab */}
        {activeTab === "today" && (
          <div>
            {!reviewMode ? (
              <div className="text-center">
                {dueItems.length > 0 ? (
                  <div className="rounded-2xl border border-warm-200 bg-white p-8 dark:border-warm-200 dark:bg-warm-100">
                    <div className="mb-4 inline-flex rounded-full bg-sakura-50 p-4 dark:bg-sakura-100">
                      <BookOpen size={32} className="text-sakura-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      오늘 복습할 단어: {dueItems.length}개
                    </h2>
                    <p className="mt-2 text-accent-indigo dark:text-warm-400">
                      간격 반복 학습으로 기억을 강화하세요
                    </p>
                    <button
                      onClick={startReview}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sakura-500 to-sakura-600 px-8 py-3 font-semibold text-white transition-all hover:from-sakura-600 hover:to-sakura-700"
                    >
                      <Sparkles size={18} />
                      복습 시작하기
                    </button>

                    {sessionStats.correct + sessionStats.incorrect > 0 && (
                      <div className="mt-6 flex justify-center gap-6">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span className="text-sm font-medium">
                            정답: {sessionStats.correct}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle size={16} />
                          <span className="text-sm font-medium">
                            오답: {sessionStats.incorrect}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-warm-200 bg-white p-8 dark:border-warm-200 dark:bg-warm-100">
                    <div className="mb-4 inline-flex rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/30">
                      <Trophy size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      오늘의 복습을 모두 마쳤습니다!
                    </h2>
                    <p className="mt-2 text-accent-indigo dark:text-warm-400">
                      훌륭합니다! 내일 다시 만나요
                    </p>
                    {sessionStats.correct + sessionStats.incorrect > 0 && (
                      <div className="mt-6 flex justify-center gap-6">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 size={16} />
                          <span className="text-sm font-medium">
                            정답: {sessionStats.correct}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle size={16} />
                          <span className="text-sm font-medium">
                            오답: {sessionStats.incorrect}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Flashcard Review Mode */
              <div>
                {/* Progress bar */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-sm font-medium text-accent-indigo dark:text-warm-400">
                    {currentIndex + 1} / {currentReviewItems.length}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-warm-200 dark:bg-warm-300">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sakura-400 to-sakura-500 transition-all"
                      style={{
                        width: `${((currentIndex + 1) / currentReviewItems.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Flashcard */}
                {contentInfo && (
                  <div className="rounded-2xl border border-warm-200 bg-white p-8 text-center dark:border-warm-200 dark:bg-warm-100">
                    <span className="mb-2 inline-block rounded-full bg-sakura-50 px-3 py-1 text-xs font-medium text-sakura-600 dark:bg-sakura-100 dark:text-sakura-400">
                      {contentInfo.label}
                    </span>

                    <div className="my-8">
                      <p className="text-6xl font-bold text-foreground sm:text-7xl">
                        {contentInfo.display}
                      </p>
                    </div>

                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-warm-200 px-6 py-3 font-medium text-accent-indigo transition-colors hover:bg-warm-50 dark:border-warm-300 dark:text-warm-400 dark:hover:bg-warm-200"
                      >
                        <Eye size={18} />
                        정답 보기
                      </button>
                    ) : (
                      <div>
                        <div className="mb-6 rounded-xl bg-warm-50 p-4 dark:bg-warm-200">
                          <p className="text-xl font-semibold text-foreground">
                            {contentInfo.sub}
                          </p>
                        </div>

                        <p className="mb-4 text-sm text-accent-indigo dark:text-warm-400">
                          얼마나 잘 알고 있었나요?
                        </p>

                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => handleAnswer(1)}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            모르겠음
                          </button>
                          <button
                            onClick={() => handleAnswer(2)}
                            className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50"
                          >
                            어려움
                          </button>
                          <button
                            onClick={() => handleAnswer(3)}
                            className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-950/50"
                          >
                            보통
                          </button>
                          <button
                            onClick={() => handleAnswer(4)}
                            className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                          >
                            쉬움
                          </button>
                          <button
                            onClick={() => handleAnswer(5)}
                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
                          >
                            완벽!
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Wrong Items Tab */}
        {activeTab === "wrong" && (
          <div>
            {wrongItems.length > 0 ? (
              <>
                {!reviewMode ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-foreground">
                        틀린 문제 목록 ({wrongItems.length}개)
                      </h2>
                      <button
                        onClick={startReview}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sakura-500 to-sakura-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-sakura-600 hover:to-sakura-700"
                      >
                        <RotateCcw size={16} />
                        다시 학습하기
                      </button>
                    </div>

                    <div className="space-y-3">
                      {wrongItems.map((item) => {
                        const info = getContentInfo(
                          item.contentType,
                          item.contentId
                        );
                        if (!info) return null;
                        return (
                          <div
                            key={`${item.contentType}:${item.contentId}`}
                            className="flex items-center gap-4 rounded-xl border border-warm-200 bg-white p-4 dark:border-warm-200 dark:bg-warm-100"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sakura-50 text-2xl font-bold text-foreground dark:bg-sakura-100">
                              {info.display}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {info.sub}
                              </p>
                              <p className="text-sm text-accent-indigo dark:text-warm-400">
                                {info.label}
                              </p>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 size={14} />
                                {item.correctCount}
                              </span>
                              <span className="flex items-center gap-1 text-red-500">
                                <XCircle size={14} />
                                {item.incorrectCount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Flashcard Review for wrong items */
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-sm font-medium text-accent-indigo dark:text-warm-400">
                        {currentIndex + 1} / {currentReviewItems.length}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-warm-200 dark:bg-warm-300">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sakura-400 to-sakura-500 transition-all"
                          style={{
                            width: `${((currentIndex + 1) / currentReviewItems.length) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setReviewMode(false);
                          setCurrentIndex(0);
                        }}
                        className="text-sm text-accent-indigo hover:text-foreground dark:text-warm-400"
                      >
                        중단
                      </button>
                    </div>

                    {contentInfo && (
                      <div className="rounded-2xl border border-warm-200 bg-white p-8 text-center dark:border-warm-200 dark:bg-warm-100">
                        <span className="mb-2 inline-block rounded-full bg-sakura-50 px-3 py-1 text-xs font-medium text-sakura-600 dark:bg-sakura-100 dark:text-sakura-400">
                          {contentInfo.label}
                        </span>

                        <div className="my-8">
                          <p className="text-6xl font-bold text-foreground sm:text-7xl">
                            {contentInfo.display}
                          </p>
                        </div>

                        {!showAnswer ? (
                          <button
                            onClick={() => setShowAnswer(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-warm-200 px-6 py-3 font-medium text-accent-indigo transition-colors hover:bg-warm-50 dark:border-warm-300 dark:text-warm-400 dark:hover:bg-warm-200"
                          >
                            <Eye size={18} />
                            정답 보기
                          </button>
                        ) : (
                          <div>
                            <div className="mb-6 rounded-xl bg-warm-50 p-4 dark:bg-warm-200">
                              <p className="text-xl font-semibold text-foreground">
                                {contentInfo.sub}
                              </p>
                            </div>

                            <p className="mb-4 text-sm text-accent-indigo dark:text-warm-400">
                              얼마나 잘 알고 있었나요?
                            </p>

                            <div className="flex flex-wrap justify-center gap-2">
                              <button
                                onClick={() => handleAnswer(1)}
                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                              >
                                모르겠음
                              </button>
                              <button
                                onClick={() => handleAnswer(3)}
                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400"
                              >
                                보통
                              </button>
                              <button
                                onClick={() => handleAnswer(5)}
                                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
                              >
                                완벽!
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-warm-200 bg-white p-8 text-center dark:border-warm-200 dark:bg-warm-100">
                <div className="mb-4 inline-flex rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  틀린 문제가 없습니다
                </h2>
                <p className="mt-2 text-accent-indigo dark:text-warm-400">
                  정답률이 높아요! 계속 이 조자로 학습하세요
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Review Tab */}
        {activeTab === "all" && (
          <div>
            {allItems.length > 0 ? (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-warm-200 bg-white p-5 dark:border-warm-200 dark:bg-warm-100">
                    <p className="text-sm text-accent-indigo dark:text-warm-400">
                      전체 학습
                    </p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {allItems.length}
                      <span className="ml-1 text-sm font-normal text-accent-indigo dark:text-warm-400">
                        개
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-warm-200 bg-white p-5 dark:border-warm-200 dark:bg-warm-100">
                    <p className="text-sm text-accent-indigo dark:text-warm-400">
                      학습 중
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-500">
                      {learningItems.length}
                      <span className="ml-1 text-sm font-normal text-accent-indigo dark:text-warm-400">
                        개
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-warm-200 bg-white p-5 dark:border-warm-200 dark:bg-warm-100">
                    <p className="text-sm text-accent-indigo dark:text-warm-400">
                      마스터
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-500">
                      {masteredItems.length}
                      <span className="ml-1 text-sm font-normal text-accent-indigo dark:text-warm-400">
                        개
                      </span>
                    </p>
                  </div>
                </div>

                {/* Learning items */}
                {learningItems.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                      <AlertTriangle size={18} className="text-amber-500" />
                      학습 중 ({learningItems.length})
                    </h3>
                    <div className="space-y-2">
                      {learningItems.map((item) => {
                        const info = getContentInfo(
                          item.contentType,
                          item.contentId
                        );
                        if (!info) return null;
                        return (
                          <div
                            key={`${item.contentType}:${item.contentId}`}
                            className="flex items-center gap-4 rounded-xl border border-warm-200 bg-white p-3 dark:border-warm-200 dark:bg-warm-100"
                          >
                            <span className="text-2xl font-bold">
                              {info.display}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {info.sub}
                              </p>
                            </div>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                              학습 중
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mastered items */}
                {masteredItems.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Trophy size={18} className="text-emerald-500" />
                      마스터 ({masteredItems.length})
                    </h3>
                    <div className="space-y-2">
                      {masteredItems.map((item) => {
                        const info = getContentInfo(
                          item.contentType,
                          item.contentId
                        );
                        if (!info) return null;
                        return (
                          <div
                            key={`${item.contentType}:${item.contentId}`}
                            className="flex items-center gap-4 rounded-xl border border-warm-200 bg-white p-3 dark:border-warm-200 dark:bg-warm-100"
                          >
                            <span className="text-2xl font-bold">
                              {info.display}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {info.sub}
                              </p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                              마스터
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-warm-200 bg-white p-8 text-center dark:border-warm-200 dark:bg-warm-100">
                <div className="mb-4 inline-flex rounded-full bg-warm-50 p-4 dark:bg-warm-200">
                  <BookOpen size={32} className="text-warm-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  아직 학습한 항목이 없습니다
                </h2>
                <p className="mt-2 text-accent-indigo dark:text-warm-400">
                  히라가나, 가타카나, 단어를 학습한 후 복습하세요
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

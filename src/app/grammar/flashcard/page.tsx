"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { grammarPoints, GrammarPoint } from "@/data/grammar";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  RotateCcw,
  Check,
  X,
  Home,
  Shuffle,
} from "lucide-react";

const levels = ["N5", "N4", "N3", "N2"];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GrammarFlashcardPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [cards, setCards] = useState<GrammarPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [isShuffled, setIsShuffled] = useState(false);

  const updateProgress = useStudyStore((s) => s.updateProgress);

  const startFlashcard = useCallback((level: string) => {
    setSelectedLevel(level);
    setCards(grammarPoints.filter((g) => g.jlptLevel === level));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setIsShuffled(false);
  }, []);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const markKnown = useCallback(() => {
    if (!currentCard) return;
    setKnownCards((prev) => new Set(prev).add(currentCard.id));
    setUnknownCards((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    updateProgress("grammar", currentCard.id, true);
    goToNext();
  }, [currentCard, updateProgress, goToNext]);

  const markUnknown = useCallback(() => {
    if (!currentCard) return;
    setUnknownCards((prev) => new Set(prev).add(currentCard.id));
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    updateProgress("grammar", currentCard.id, false);
    goToNext();
  }, [currentCard, updateProgress, goToNext]);

  const resetCards = useCallback(() => {
    if (selectedLevel) {
      setCards(grammarPoints.filter((g) => g.jlptLevel === selectedLevel));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setIsShuffled(false);
  }, [selectedLevel]);

  const toggleShuffle = useCallback(() => {
    if (!selectedLevel) return;
    const base = grammarPoints.filter((g) => g.jlptLevel === selectedLevel);
    setCards(isShuffled ? base : shuffleArray(base));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(!isShuffled);
  }, [selectedLevel, isShuffled]);

  // Level selection screen
  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <Link
            href="/grammar"
            className="mb-8 flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            문법 목록
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              문법 플래시카드
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              레벨을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {levels.map((level) => {
              const count = grammarPoints.filter((g) => g.jlptLevel === level).length;
              return (
                <button
                  key={level}
                  onClick={() => startFlashcard(level)}
                  disabled={count === 0}
                  className="rounded-2xl border-2 border-zinc-200 bg-white p-6 text-center transition-all hover:border-purple-400 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-purple-600"
                >
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {level}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {count}개 문법
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const progressPercent = Math.round(
    ((knownCards.size + unknownCards.size) / totalCards) * 100
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedLevel(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            {selectedLevel} 문법
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isShuffled ? "text-purple-600 dark:text-purple-400" : "text-zinc-600 dark:text-zinc-400"} hover:text-zinc-900 dark:hover:text-zinc-100`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={resetCards}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {currentIndex + 1} / {totalCards}
          </span>
          <span>{progressPercent}% 완료</span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            {knownCards.size}
          </span>
          <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
            <X className="h-4 w-4" />
            {unknownCards.size}
          </span>
        </div>

        {/* Flashcard */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="w-full cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={flipCard}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front - Pattern */}
              <div
                className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 sm:min-h-[380px]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {currentCard.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-5xl text-center">
                  {currentCard.pattern}
                </span>
                <p className="mt-6 text-sm text-zinc-400 dark:text-zinc-500">
                  카드를 탭하여 뒤집기
                </p>
              </div>

              {/* Back - Meaning & Examples */}
              <div
                className="absolute inset-0 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-lg dark:border-purple-800 dark:bg-purple-950/50 sm:min-h-[380px] overflow-y-auto"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl text-center">
                  {currentCard.pattern}
                </span>
                <span className="mt-2 text-lg text-purple-600 dark:text-purple-400 text-center">
                  {currentCard.meaning}
                </span>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 text-center">
                  {currentCard.explanation}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  {currentCard.formation}
                </p>

                {currentCard.examples.length > 0 && (
                  <div className="mt-4 w-full space-y-2">
                    {currentCard.examples.slice(0, 2).map((ex, i) => (
                      <div key={i} className="rounded-xl bg-white/60 p-3 dark:bg-zinc-800/60">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {ex.japanese}
                        </p>
                        <p className="mt-0.5 text-xs text-purple-500 dark:text-purple-400">
                          {ex.reading}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {ex.korean}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 space-y-4">
          {/* TTS button */}
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentCard.examples[0]) {
                  speakJapanese(currentCard.examples[0].japanese);
                }
              }}
              className="flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Volume2 className="h-4 w-4" />
              예문 듣기
            </button>
          </div>

          {/* Assessment buttons */}
          <div className="flex gap-3">
            <button
              onClick={markUnknown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <X className="h-4 w-4" />
              모르겠어요
            </button>
            <button
              onClick={markKnown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            >
              <Check className="h-4 w-4" />
              알고 있어요
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </button>
            <Link
              href="/grammar"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Home className="h-4 w-4" />
            </Link>
            <button
              onClick={goToNext}
              disabled={currentIndex === totalCards - 1}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

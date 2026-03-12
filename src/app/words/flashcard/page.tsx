"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { n5Words } from "@/data/words";
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
} from "lucide-react";

export default function FlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());

  const updateProgress = useStudyStore((s) => s.updateProgress);

  const words = n5Words;
  const currentWord = words[currentIndex];
  const totalCards = words.length;

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
    setKnownCards((prev) => new Set(prev).add(currentWord.id));
    setUnknownCards((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    updateProgress("word", currentWord.id, true);
    goToNext();
  }, [currentWord, updateProgress, goToNext]);

  const markUnknown = useCallback(() => {
    setUnknownCards((prev) => new Set(prev).add(currentWord.id));
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.delete(currentWord.id);
      return next;
    });
    updateProgress("word", currentWord.id, false);
    goToNext();
  }, [currentWord, updateProgress, goToNext]);

  const resetCards = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
  }, []);

  const progressPercent = Math.round(
    ((knownCards.size + unknownCards.size) / totalCards) * 100
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/words/N5"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            단어 목록
          </Link>
          <button
            onClick={resetCards}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </button>
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
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
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
              {/* Front */}
              <div
                className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 sm:min-h-[380px]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-6xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-7xl">
                  {currentWord.word}
                </span>
                <p className="mt-6 text-sm text-zinc-400 dark:text-zinc-500">
                  카드를 탭하여 뒤집기
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 p-8 shadow-lg dark:border-indigo-800 dark:bg-indigo-950/50 sm:min-h-[380px]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                  {currentWord.word}
                </span>
                <span className="mt-3 text-xl text-indigo-600 dark:text-indigo-400">
                  {currentWord.reading}
                </span>
                <span className="mt-2 text-lg text-zinc-700 dark:text-zinc-300">
                  {currentWord.meaning}
                </span>

                {currentWord.exampleSentence && (
                  <div className="mt-6 w-full rounded-xl bg-white/60 p-4 dark:bg-zinc-800/60">
                    <p className="text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {currentWord.exampleSentence}
                    </p>
                    <p className="mt-1 text-center text-xs text-indigo-500 dark:text-indigo-400">
                      {currentWord.exampleReading}
                    </p>
                    <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                      {currentWord.exampleMeaning}
                    </p>
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
                speakJapanese(currentWord.word);
              }}
              className="flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Volume2 className="h-4 w-4" />
              발음 듣기
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
              href="/words"
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

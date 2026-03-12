"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { hiraganaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { useStudyStore } from "@/store/useStudyStore";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Clock,
  Target,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  contentType: "kana" | "word";
  contentId: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateKanaQuestions(): Question[] {
  const kana = shuffleArray(hiraganaData).slice(0, 10);
  return kana.map((k, idx) => {
    const wrongOptions = shuffleArray(
      hiraganaData.filter((h) => h.romaji !== k.romaji)
    )
      .slice(0, 3)
      .map((h) => h.romaji);
    const options = shuffleArray([k.romaji, ...wrongOptions]);
    return {
      id: `kana-q-${idx}`,
      question: k.character,
      options,
      correctAnswer: k.romaji,
      contentType: "kana" as const,
      contentId: k.id,
    };
  });
}

function generateWordQuestions(): Question[] {
  const words = shuffleArray(n5Words).slice(0, 10);
  return words.map((w, idx) => {
    const wrongOptions = shuffleArray(
      n5Words.filter((other) => other.meaning !== w.meaning)
    )
      .slice(0, 3)
      .map((other) => other.meaning);
    const options = shuffleArray([w.meaning, ...wrongOptions]);
    return {
      id: `word-q-${idx}`,
      question: w.word,
      options,
      correctAnswer: w.meaning,
      contentType: "word" as const,
      contentId: w.id,
    };
  });
}

export default function QuizTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<
    { question: string; selected: string; correct: string }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const updateProgress = useStudyStore((s) => s.updateProgress);
  const addQuizRecord = useStudyStore((s) => s.addQuizRecord);

  // Generate questions on mount
  useEffect(() => {
    const qs =
      type === "kana" ? generateKanaQuestions() : generateWordQuestions();
    setQuestions(qs);
  }, [type]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, startTime]);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return;
      setSelectedAnswer(answer);
      setIsAnswered(true);

      const isCorrect = answer === currentQuestion.correctAnswer;
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setWrongAnswers((prev) => [
          ...prev,
          {
            question: currentQuestion.question,
            selected: answer,
            correct: currentQuestion.correctAnswer,
          },
        ]);
      }

      updateProgress(
        currentQuestion.contentType,
        currentQuestion.contentId,
        isCorrect
      );
    },
    [isAnswered, currentQuestion, updateProgress]
  );

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    addQuizRecord({
      type: type === "kana" ? "가나" : "단어",
      totalQuestions,
      correctAnswers: correctCount,
    });
  }, [addQuizRecord, type, totalQuestions, correctCount]);

  const handleNextOrFinish = useCallback(() => {
    if (currentIdx >= totalQuestions - 1) {
      finishQuiz();
    } else {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentIdx, totalQuestions, finishQuiz]);

  const restartQuiz = useCallback(() => {
    const qs =
      type === "kana" ? generateKanaQuestions() : generateWordQuestions();
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setWrongAnswers([]);
    setIsFinished(false);
  }, [type]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <p className="text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  // Result screen
  if (isFinished) {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const emoji =
      accuracy >= 90
        ? "excellent"
        : accuracy >= 70
          ? "good"
          : accuracy >= 50
            ? "okay"
            : "try-again";

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <Trophy className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              퀴즈 완료!
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              {emoji === "excellent"
                ? "훌륭합니다!"
                : emoji === "good"
                  ? "잘 했어요!"
                  : emoji === "okay"
                    ? "조금 더 연습해봐요!"
                    : "다시 도전해봐요!"}
            </p>
          </div>

          {/* Stats cards */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-zinc-800">
              <Target className="mx-auto h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {accuracy}%
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">정답률</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-zinc-800">
              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {correctCount}/{totalQuestions}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">정답</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-zinc-800">
              <Clock className="mx-auto h-5 w-5 text-amber-500" />
              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatTime(elapsedSeconds)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">시간</p>
            </div>
          </div>

          {/* Wrong answers review */}
          {wrongAnswers.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                틀린 문제 복습
              </h2>
              <div className="space-y-2">
                {wrongAnswers.map((wa, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        {wa.question}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm">
                      <span className="text-red-600 dark:text-red-400">
                        <XCircle className="mr-1 inline h-3.5 w-3.5" />
                        선택한 답: {wa.selected}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                        정답: {wa.correct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={restartQuiz}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
            >
              <RotateCcw className="h-4 w-4" />
              다시 풀기
            </button>
            <Link
              href="/quiz"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/quiz"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            나가기
          </Link>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Clock className="h-4 w-4" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {type === "kana" ? "가나 퀴즈" : "단어 퀴즈"}
          </span>
          <span>
            {currentIdx + 1} / {totalQuestions}
          </span>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{
              width: `${((currentIdx + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Score */}
        <div className="mb-6 flex justify-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {correctCount}
          </span>
          <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            {wrongAnswers.length}
          </span>
        </div>

        {/* Question */}
        <div className="mb-8 flex flex-col items-center">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            {type === "kana"
              ? "이 문자의 로마지는?"
              : "이 단어의 뜻은?"}
          </p>
          <div className="flex min-h-[140px] w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              {currentQuestion.question}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            let optionStyle =
              "border-zinc-200 bg-white text-zinc-900 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30";

            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) {
                optionStyle =
                  "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300";
              } else if (
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer
              ) {
                optionStyle =
                  "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/40 dark:text-red-300";
              } else {
                optionStyle =
                  "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`flex items-center justify-center rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all sm:text-base ${optionStyle}`}
              >
                {option}
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />
                )}
                {isAnswered &&
                  option === selectedAnswer &&
                  option !== currentQuestion.correctAnswer && (
                    <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
              </button>
            );
          })}
        </div>

        {/* Next button (visible after answering) */}
        {isAnswered && (
          <button
            onClick={handleNextOrFinish}
            className="mt-6 w-full rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            {currentIdx >= totalQuestions - 1 ? "결과 보기" : "다음 문제"}
          </button>
        )}
      </div>
    </div>
  );
}

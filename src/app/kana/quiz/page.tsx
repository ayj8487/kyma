"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { hiraganaData, katakanaData } from "@/data/kana";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";
import { KanaCharacter } from "@/types";
import {
  ArrowLeft,
  Volume2,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

type QuizMode =
  | "hiragana-to-romaji"
  | "romaji-to-hiragana"
  | "katakana-to-romaji"
  | "romaji-to-katakana";

interface QuizQuestion {
  character: KanaCharacter;
  options: string[];
  correctAnswer: string;
}

const TOTAL_QUESTIONS = 10;
const OPTIONS_COUNT = 4;

const quizModes: { id: QuizMode; label: string; description: string }[] = [
  {
    id: "hiragana-to-romaji",
    label: "히라가나 → 로마자",
    description: "히라가나를 보고 로마자를 고르세요",
  },
  {
    id: "romaji-to-hiragana",
    label: "로마자 → 히라가나",
    description: "로마자를 보고 히라가나를 고르세요",
  },
  {
    id: "katakana-to-romaji",
    label: "가타카나 → 로마자",
    description: "가타카나를 보고 로마자를 고르세요",
  },
  {
    id: "romaji-to-katakana",
    label: "로마자 → 가타카나",
    description: "로마자를 보고 가타카나를 고르세요",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(mode: QuizMode): QuizQuestion[] {
  const isKatakana = mode.includes("katakana");
  const isRomajiQuestion = mode.startsWith("romaji");
  const sourceData = isKatakana ? katakanaData : hiraganaData;

  // Only use gojuon for quiz to keep it manageable
  const gojuonData = sourceData.filter((k) => k.category === "gojuon");
  const selectedChars = shuffleArray(gojuonData).slice(0, TOTAL_QUESTIONS);

  return selectedChars.map((char) => {
    const correctAnswer = isRomajiQuestion ? char.character : char.romaji;

    // Get wrong options
    const otherChars = gojuonData.filter((k) => k.id !== char.id);
    const wrongOptions = shuffleArray(otherChars)
      .slice(0, OPTIONS_COUNT - 1)
      .map((k) => (isRomajiQuestion ? k.character : k.romaji));

    const options = shuffleArray([correctAnswer, ...wrongOptions]);

    return {
      character: char,
      options,
      correctAnswer,
    };
  });
}

export default function KanaQuizPage() {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);

  const { updateProgress, addQuizRecord, incrementStudyCount } =
    useStudyStore();

  const currentQuestion = questions[currentIndex] || null;
  const isRomajiQuestion = mode?.startsWith("romaji") ?? false;

  const startQuiz = useCallback((selectedMode: QuizMode) => {
    setMode(selectedMode);
    setQuestions(generateQuestions(selectedMode));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setFlashColor(null);
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return;

      setSelectedAnswer(answer);
      setIsAnswered(true);

      const isCorrect = answer === currentQuestion.correctAnswer;
      if (isCorrect) {
        setScore((s) => s + 1);
        setFlashColor("green");
      } else {
        setFlashColor("red");
      }

      // Track progress
      const contentType = mode?.includes("katakana")
        ? "katakana"
        : "hiragana";
      updateProgress(contentType, currentQuestion.character.id, isCorrect);

      // Clear flash after animation
      setTimeout(() => setFlashColor(null), 600);
    },
    [isAnswered, currentQuestion, mode, updateProgress]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      setIsFinished(true);
      // Record quiz
      addQuizRecord({
        type: mode || "",
        totalQuestions: TOTAL_QUESTIONS,
        correctAnswers: score,
      });
      incrementStudyCount();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setFlashColor(null);
    }
  }, [currentIndex, addQuizRecord, incrementStudyCount, mode, score]);

  const handleSpeak = useCallback(() => {
    if (!currentQuestion) return;
    speakJapanese(currentQuestion.character.character);
  }, [currentQuestion]);

  const progressPercent = useMemo(
    () => ((currentIndex + (isAnswered ? 1 : 0)) / TOTAL_QUESTIONS) * 100,
    [currentIndex, isAnswered]
  );

  const scorePercent = useMemo(
    () =>
      isFinished ? Math.round((score / TOTAL_QUESTIONS) * 100) : 0,
    [score, isFinished]
  );

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-gray-950 dark:to-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/kana"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              가나 학습
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              가나 퀴즈
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              퀴즈 모드를 선택하세요. 각 퀴즈는 {TOTAL_QUESTIONS}문제로 구성되어
              있습니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {quizModes.map((qm) => (
              <button
                key={qm.id}
                onClick={() => startQuiz(qm.id)}
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-green-600 dark:hover:shadow-green-900/20"
              >
                <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
                  {qm.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {qm.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-gray-950 dark:to-slate-900">
        <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-6">
              <Trophy
                className={`mx-auto h-16 w-16 ${
                  scorePercent >= 80
                    ? "text-yellow-500"
                    : scorePercent >= 50
                      ? "text-blue-500"
                      : "text-gray-400"
                }`}
              />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              퀴즈 완료!
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {quizModes.find((m) => m.id === mode)?.label}
            </p>

            {/* Score circle */}
            <div className="relative mx-auto mb-8 h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${scorePercent * 3.27} 327`}
                  strokeLinecap="round"
                  className={
                    scorePercent >= 80
                      ? "text-green-500"
                      : scorePercent >= 50
                        ? "text-blue-500"
                        : "text-red-500"
                  }
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {score}/{TOTAL_QUESTIONS}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {scorePercent}%
                </span>
              </div>
            </div>

            {/* Message */}
            <p className="mb-8 text-lg font-medium text-gray-700 dark:text-gray-300">
              {scorePercent >= 90
                ? "훌륭합니다! 완벽에 가까운 점수입니다!"
                : scorePercent >= 70
                  ? "잘 했습니다! 조금만 더 연습하면 완벽해질 거예요!"
                  : scorePercent >= 50
                    ? "좋은 시작입니다! 꾸준히 연습해 보세요."
                    : "더 연습이 필요합니다. 다시 도전해 보세요!"}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => startQuiz(mode)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                <RotateCcw className="h-4 w-4" />
                다시 풀기
              </button>
              <button
                onClick={() => setMode(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                모드 선택
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (!currentQuestion) return null;

  const questionDisplay = isRomajiQuestion
    ? currentQuestion.character.romaji
    : currentQuestion.character.character;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        flashColor === "green"
          ? "bg-green-50 dark:bg-green-950/20"
          : flashColor === "red"
            ? "bg-red-50 dark:bg-red-950/20"
            : "bg-gradient-to-br from-slate-50 to-green-50 dark:from-gray-950 dark:to-slate-900"
      }`}
    >
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            나가기
          </button>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {score} / {currentIndex + (isAnswered ? 1 : 0)}{" "}
            <span className="text-gray-400">정답</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              문제 {currentIndex + 1} / {TOTAL_QUESTIONS}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {isRomajiQuestion
              ? "이 로마자에 해당하는 문자는?"
              : "이 문자의 로마자는?"}
          </p>
          <div
            className={`mb-4 font-bold ${
              isRomajiQuestion
                ? "text-4xl text-gray-900 dark:text-white"
                : "text-7xl text-gray-900 dark:text-white"
            }`}
          >
            {questionDisplay}
          </div>
          {!isRomajiQuestion && (
            <button
              onClick={handleSpeak}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Volume2 className="h-4 w-4" />
              발음 듣기
            </button>
          )}
        </div>

        {/* Options */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, idx) => {
            let optionStyle =
              "border-gray-200 bg-white text-gray-900 hover:border-green-300 hover:bg-green-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-950/30";

            if (isAnswered) {
              if (option === currentQuestion.correctAnswer) {
                optionStyle =
                  "border-green-500 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-950/30 dark:text-green-400";
              } else if (
                option === selectedAnswer &&
                option !== currentQuestion.correctAnswer
              ) {
                optionStyle =
                  "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400";
              } else {
                optionStyle =
                  "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-600";
              }
            }

            return (
              <button
                key={`${option}-${idx}`}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`relative flex items-center justify-center rounded-xl border-2 px-4 py-5 font-semibold transition-all duration-200 ${optionStyle} ${
                  !isAnswered
                    ? "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                    : ""
                } ${isRomajiQuestion ? "text-3xl" : "text-lg"}`}
              >
                {option}
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-green-500" />
                )}
                {isAnswered &&
                  option === selectedAnswer &&
                  option !== currentQuestion.correctAnswer && (
                    <XCircle className="absolute right-2 top-2 h-5 w-5 text-red-500" />
                  )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-green-700 active:bg-green-800"
          >
            {currentIndex + 1 >= TOTAL_QUESTIONS ? (
              <>
                결과 보기
                <Trophy className="h-4 w-4" />
              </>
            ) : (
              <>
                다음 문제
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

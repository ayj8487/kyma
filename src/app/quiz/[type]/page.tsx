"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { n1Words } from "@/data/words-n1";
import { grammarPoints } from "@/data/grammar";
import { useStudyStore } from "@/store/useStudyStore";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Clock,
  Target,
  Volume2,
} from "lucide-react";
import { speakJapanese } from "@/lib/tts";

interface Question {
  id: string;
  question: string;
  questionSub?: string;
  options: string[];
  correctAnswer: string;
  contentType: "kana" | "word" | "grammar";
  contentId: string;
}

const wordsByLevel: Record<string, typeof n5Words> = {
  N5: n5Words,
  N4: n4Words,
  N3: n3Words,
  N2: n2Words,
  N1: n1Words,
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateKanaQuestions(): Question[] {
  const allKana = [...hiraganaData, ...katakanaData];
  const kana = shuffleArray(allKana).slice(0, 10);
  return kana.map((k, idx) => {
    const wrongOptions = shuffleArray(
      allKana.filter((h) => h.romaji !== k.romaji)
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

function generateWordQuestions(level: string): Question[] {
  const pool = wordsByLevel[level] || n5Words;
  const words = shuffleArray(pool).slice(0, 10);
  return words.map((w, idx) => {
    const wrongOptions = shuffleArray(
      pool.filter((other) => other.meaning !== w.meaning)
    )
      .slice(0, 3)
      .map((other) => other.meaning);
    const options = shuffleArray([w.meaning, ...wrongOptions]);
    return {
      id: `word-q-${idx}`,
      question: w.word,
      questionSub: w.reading,
      options,
      correctAnswer: w.meaning,
      contentType: "word" as const,
      contentId: w.id,
    };
  });
}

function generateGrammarQuestions(level: string): Question[] {
  const pool = grammarPoints.filter((g) => g.jlptLevel === level);
  if (pool.length < 4) return [];
  const selected = shuffleArray(pool).slice(0, Math.min(10, pool.length));
  return selected.map((g, idx) => {
    const wrongOptions = shuffleArray(
      pool.filter((other) => other.meaning !== g.meaning)
    )
      .slice(0, 3)
      .map((other) => other.meaning);
    const options = shuffleArray([g.meaning, ...wrongOptions]);
    return {
      id: `grammar-q-${idx}`,
      question: g.pattern,
      questionSub: g.examples[0]?.japanese,
      options,
      correctAnswer: g.meaning,
      contentType: "grammar" as const,
      contentId: g.id,
    };
  });
}

const levelOptions = ["N5", "N4", "N3", "N2", "N1"];

export default function QuizTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    type === "kana" ? "ALL" : null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<
    { question: string; selected: string; correct: string }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const updateProgress = useStudyStore((s) => s.updateProgress);
  const addQuizRecord = useStudyStore((s) => s.addQuizRecord);

  const startQuiz = useCallback(
    (level: string) => {
      setSelectedLevel(level);
      let qs: Question[] = [];
      if (type === "kana") {
        qs = generateKanaQuestions();
      } else if (type === "word") {
        qs = generateWordQuestions(level);
      } else if (type === "grammar") {
        qs = generateGrammarQuestions(level);
      }
      setQuestions(qs);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectCount(0);
      setWrongAnswers([]);
      setIsFinished(false);
      setStartTime(Date.now());
      setElapsedSeconds(0);
    },
    [type]
  );

  // Auto-start for kana
  useEffect(() => {
    if (type === "kana") {
      startQuiz("ALL");
    }
  }, [type, startQuiz]);

  // Timer
  useEffect(() => {
    if (isFinished || !selectedLevel || questions.length === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, startTime, selectedLevel, questions.length]);

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
    const typeLabel =
      type === "kana"
        ? "가나"
        : type === "word"
          ? `단어(${selectedLevel})`
          : `문법(${selectedLevel})`;
    addQuizRecord({
      type: typeLabel,
      totalQuestions,
      correctAnswers: correctCount,
    });
  }, [addQuizRecord, type, selectedLevel, totalQuestions, correctCount]);

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
    if (selectedLevel) startQuiz(selectedLevel);
  }, [selectedLevel, startQuiz]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const quizTitle =
    type === "kana"
      ? "가나 퀴즈"
      : type === "word"
        ? "단어 퀴즈"
        : "문법 퀴즈";

  const questionLabel =
    type === "kana"
      ? "이 문자의 로마지는?"
      : type === "word"
        ? "이 단어의 뜻은?"
        : "이 문법의 뜻은?";

  // Level selection screen for word/grammar
  if (!selectedLevel || (type !== "kana" && questions.length === 0 && !isFinished)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <Link
            href="/quiz"
            className="mb-8 flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            퀴즈 목록
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {quizTitle}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              레벨을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {levelOptions.map((level) => {
              const wordCount =
                type === "word"
                  ? (wordsByLevel[level]?.length || 0)
                  : grammarPoints.filter((g) => g.jlptLevel === level).length;
              return (
                <button
                  key={level}
                  onClick={() => startQuiz(level)}
                  disabled={wordCount < 4}
                  className="rounded-2xl border-2 border-zinc-200 bg-white p-6 text-center transition-all hover:border-indigo-400 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-600"
                >
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {level}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {wordCount}개 {type === "word" ? "단어" : "문법"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Mixed quiz option */}
          <button
            onClick={() => {
              if (type === "word") {
                const allWords = [...n5Words, ...n4Words, ...n3Words, ...n2Words, ...n1Words];
                const words = shuffleArray(allWords).slice(0, 10);
                const qs = words.map((w, idx) => {
                  const wrongOptions = shuffleArray(
                    allWords.filter((other) => other.meaning !== w.meaning)
                  )
                    .slice(0, 3)
                    .map((other) => other.meaning);
                  return {
                    id: `word-q-${idx}`,
                    question: w.word,
                    questionSub: w.reading,
                    options: shuffleArray([w.meaning, ...wrongOptions]),
                    correctAnswer: w.meaning,
                    contentType: "word" as const,
                    contentId: w.id,
                  };
                });
                setSelectedLevel("혼합");
                setQuestions(qs);
                setCurrentIdx(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setCorrectCount(0);
                setWrongAnswers([]);
                setIsFinished(false);
                setStartTime(Date.now());
              } else {
                const allGrammar = grammarPoints;
                const selected = shuffleArray(allGrammar).slice(0, 10);
                const qs = selected.map((g, idx) => {
                  const wrongOptions = shuffleArray(
                    allGrammar.filter((other) => other.meaning !== g.meaning)
                  )
                    .slice(0, 3)
                    .map((other) => other.meaning);
                  return {
                    id: `grammar-q-${idx}`,
                    question: g.pattern,
                    questionSub: g.examples[0]?.japanese,
                    options: shuffleArray([g.meaning, ...wrongOptions]),
                    correctAnswer: g.meaning,
                    contentType: "grammar" as const,
                    contentId: g.id,
                  };
                });
                setSelectedLevel("혼합");
                setQuestions(qs);
                setCurrentIdx(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setCorrectCount(0);
                setWrongAnswers([]);
                setIsFinished(false);
                setStartTime(Date.now());
              }
            }}
            className="mt-4 w-full rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center transition-all hover:border-indigo-400 hover:shadow-lg dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:border-indigo-600"
          >
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              혼합 퀴즈
            </p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">
              모든 레벨에서 랜덤 출제
            </p>
          </button>
        </div>
      </div>
    );
  }

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
            <p className="mt-1 text-sm text-zinc-400">
              {quizTitle} {selectedLevel !== "ALL" && selectedLevel !== "혼합" ? `(${selectedLevel})` : selectedLevel === "혼합" ? "(혼합)" : ""}
            </p>
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
            {quizTitle} {selectedLevel !== "ALL" && `(${selectedLevel})`}
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
            {questionLabel}
          </p>
          <div className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 px-4">
            <span
              className={`font-bold text-zinc-900 dark:text-zinc-50 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-all text-center leading-tight ${type === "grammar" ? "text-2xl sm:text-3xl md:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl"}`}
              onClick={() => speakJapanese(currentQuestion.question)}
            >
              {currentQuestion.question}
            </span>
            <button
              onClick={() => speakJapanese(currentQuestion.question)}
              className="mt-2 flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
              <Volume2 className="h-3.5 w-3.5" />
              발음 듣기
            </button>
            {currentQuestion.questionSub && (
              <p className="mt-2 text-sm text-indigo-500 dark:text-indigo-400 text-center">
                {currentQuestion.questionSub}
              </p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className={`grid gap-3 ${type === "grammar" ? "grid-cols-1" : "grid-cols-2"}`}>
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
                <span className="line-clamp-2">{option}</span>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="ml-2 h-4 w-4 shrink-0 text-emerald-500" />
                )}
                {isAnswered &&
                  option === selectedAnswer &&
                  option !== currentQuestion.correctAnswer && (
                    <XCircle className="ml-2 h-4 w-4 shrink-0 text-red-500" />
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

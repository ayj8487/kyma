import Link from "next/link";
import { Languages, BookOpen, BookText } from "lucide-react";

const quizTypes = [
  {
    type: "kana",
    title: "가나 퀴즈",
    description: "히라가나와 카타카나를 얼마나 잘 알고 있는지 테스트하세요",
    detail: "가나 문자를 보고 올바른 로마지를 고르는 퀴즈",
    difficulty: "초급",
    difficultyColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: Languages,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor:
      "border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-600",
  },
  {
    type: "word",
    title: "단어 퀴즈",
    description: "JLPT 단어의 의미를 얼마나 잘 알고 있는지 테스트하세요",
    detail: "일본어 단어를 보고 올바른 한국어 뜻을 고르는 퀴즈 (N5~N2)",
    difficulty: "초급~중급",
    difficultyColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: BookOpen,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderColor:
      "border-indigo-200 hover:border-indigo-400 dark:border-indigo-800 dark:hover:border-indigo-600",
  },
  {
    type: "grammar",
    title: "문법 퀴즈",
    description: "JLPT 문법 패턴의 의미를 테스트하세요",
    detail: "일본어 문법 패턴을 보고 올바른 한국어 뜻을 고르는 퀴즈 (N5~N2)",
    difficulty: "초급~중급",
    difficultyColor:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: BookText,
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor:
      "border-purple-200 hover:border-purple-400 dark:border-purple-800 dark:hover:border-purple-600",
  },
];

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            퀴즈
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            학습한 내용을 퀴즈로 확인하세요
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizTypes.map((quiz) => {
            const Icon = quiz.icon;
            return (
              <Link
                key={quiz.type}
                href={`/quiz/${quiz.type}`}
                className={`group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-900 ${quiz.borderColor}`}
              >
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${quiz.iconBg}`}
                >
                  <Icon className={`h-7 w-7 ${quiz.iconColor}`} />
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {quiz.title}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${quiz.difficultyColor}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {quiz.description}
                </p>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  {quiz.detail}
                </p>

                <div className="mt-5 flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform dark:text-indigo-400">
                  퀴즈 시작 &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

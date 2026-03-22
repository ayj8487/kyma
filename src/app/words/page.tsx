import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";

const levels = [
  {
    level: "N5",
    words: 40,
    description: "입문 단계",
    detail: "기초 일상 회화에 필요한 단어",
    available: true,
  },
  {
    level: "N4",
    words: 40,
    description: "초급 단계",
    detail: "기본적인 일본어를 이해할 수 있는 수준",
    available: true,
  },
  {
    level: "N3",
    words: 30,
    description: "중급 단계",
    detail: "일상적인 일본어를 어느 정도 이해할 수 있는 수준",
    available: true,
  },
  {
    level: "N2",
    words: 40,
    description: "중상급 단계",
    detail: "일상적인 장면에서 사용되는 일본어의 이해에 더해, 폭넓은 장면의 일본어를 이해",
    available: true,
  },
  {
    level: "N1",
    words: 2000,
    description: "상급 단계",
    detail: "폭넓은 장면에서 사용되는 일본어를 이해할 수 있는 수준",
    available: false,
  },
];

export default function WordsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            단어 학습
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            JLPT 레벨별 일본어 단어를 학습하세요
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((item) =>
            item.available ? (
              <Link
                key={item.level}
                href={`/words/${item.level}`}
                className="group relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-400 hover:shadow-lg dark:border-indigo-800 dark:bg-zinc-900 dark:hover:border-indigo-600"
              >
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                  학습 가능
                </div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                  <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  JLPT {item.level}
                </h2>
                <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {item.description}
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {item.detail}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {item.words}개 단어
                  </span>
                  <span className="text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform dark:text-indigo-400">
                    학습하기 &rarr;
                  </span>
                </div>
              </Link>
            ) : (
              <div
                key={item.level}
                className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 opacity-60 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-zinc-400 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-600">
                  준비 중
                </div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700">
                  <Lock className="h-7 w-7 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                  JLPT {item.level}
                </h2>
                <p className="mt-1 text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  {item.description}
                </p>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  {item.detail}
                </p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                    {item.words}개 단어
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { BookOpen, Languages, PenTool, ArrowRight } from "lucide-react";

export default function KanaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Languages className="h-4 w-4" />
            일본어 문자
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            가나 학습
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            일본어의 기본 문자인 히라가나와 가타카나를 배워보세요.
            각 문자의 발음과 획순을 확인할 수 있습니다.
          </p>
        </div>

        {/* Kana Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Hiragana Card */}
          <Link
            href="/kana/hiragana"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="absolute -right-6 -top-6 text-[120px] font-bold leading-none text-blue-50 transition-transform duration-300 group-hover:scale-110 dark:text-blue-950/50">
              あ
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                히라가나
              </h2>
              <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                Hiragana (ひらがな)
              </p>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                일본어의 기본 문자체계입니다. 일본 고유어와 문법 요소를
                표기하는 데 사용됩니다. 46개의 기본 문자로 구성되어 있습니다.
              </p>
              <div className="mb-6 flex gap-3">
                {["あ", "い", "う", "え", "お"].map((char) => (
                  <span
                    key={char}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                학습 시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Katakana Card */}
          <Link
            href="/kana/katakana"
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="absolute -right-6 -top-6 text-[120px] font-bold leading-none text-purple-50 transition-transform duration-300 group-hover:scale-110 dark:text-purple-950/50">
              ア
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                <PenTool className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                가타카나
              </h2>
              <p className="mb-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                Katakana (カタカナ)
              </p>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                외래어, 의성어, 의태어 등을 표기하는 데 사용됩니다.
                히라가나와 같은 발음 체계를 가지고 있으며
                46개의 기본 문자로 구성되어 있습니다.
              </p>
              <div className="mb-6 flex gap-3">
                {["ア", "イ", "ウ", "エ", "オ"].map((char) => (
                  <span
                    key={char}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors group-hover:text-purple-700 dark:text-purple-400 dark:group-hover:text-purple-300">
                학습 시작하기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quiz Section */}
        <div className="mt-8">
          <Link
            href="/kana/quiz"
            className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-4">
              <div className="inline-flex rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <PenTool className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  가나 퀴즈
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  학습한 가나 문자를 퀴즈로 테스트해 보세요
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-green-600 dark:group-hover:text-green-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

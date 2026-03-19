import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileQuestion,
  BarChart3,
  ArrowRight,
  Sparkles,
  Bot,
  Keyboard,
  Newspaper,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "히라가나 / 가타카나",
    description:
      "일본어의 기본 문자인 히라가나와 가타카나를 체계적으로 학습하세요.",
    color: "bg-pink-50 text-pink-500",
    href: "/kana",
  },
  {
    icon: GraduationCap,
    title: "단어 학습",
    description:
      "JLPT 레벨별로 분류된 필수 일본어 단어를 플래시카드로 암기하세요.",
    color: "bg-violet-50 text-violet-500",
    href: "/words",
  },
  {
    icon: FileQuestion,
    title: "퀴즈 & 복습",
    description:
      "다양한 유형의 퀴즈와 SRS 복습으로 학습한 내용을 완벽히 익히세요.",
    color: "bg-amber-50 text-amber-500",
    href: "/quiz",
  },
  {
    icon: BarChart3,
    title: "학습 진행도",
    description:
      "학습 현황과 통계를 한눈에 확인하고 꾸준한 학습을 이어가세요.",
    color: "bg-emerald-50 text-emerald-500",
    href: "/progress",
  },
  {
    icon: Bot,
    title: "AI 회화 연습",
    description:
      "AI와 함께 실전 일본어 회화를 연습하고 문장을 교정받으세요.",
    color: "bg-blue-50 text-blue-500",
    href: "/ai",
  },
  {
    icon: Keyboard,
    title: "타자 연습",
    description:
      "일본어 입력에 익숙해지도록 타이핑 게임으로 재미있게 연습하세요.",
    color: "bg-rose-50 text-rose-500",
    href: "/typing",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/80 via-white to-white" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-pink-100/50 blur-3xl" />
          <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-violet-100/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-amber-50/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-1.5 text-sm font-medium text-pink-500 shadow-sm">
              <Sparkles size={14} />
              <span>일본어 학습 플랫폼</span>
            </div>

            {/* Title */}
            <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:text-3xl lg:text-5xl">
              일본어,{" "}
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                쉽고 재미있게
              </span>
              <br className="sm:hidden" />
              {" "}배우자
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
              히라가나부터 단어, 문법까지 — 체계적인 커리큘럼과 다양한 퀴즈로
              일본어를 즐겁게 마스터하세요.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-200/50 transition-all hover:shadow-xl hover:shadow-pink-300/50 hover:brightness-105 active:scale-[0.98]"
              >
                학습 시작하기
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/kana/hiragana"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-600 shadow-sm transition-all hover:border-pink-200 hover:text-pink-500 hover:shadow-md active:scale-[0.98]"
              >
                히라가나 둘러보기
              </Link>
            </div>

            {/* Decorative Japanese text */}
            <div className="mt-20 select-none text-5xl font-extralight tracking-[0.3em] text-pink-100 sm:text-7xl lg:text-9xl">
              きょうま
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              다양한 학습 기능
            </h2>
            <p className="mt-3 text-base text-gray-400">
              Kyma와 함께 체계적으로 일본어를 학습하세요
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color, href }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-pink-100 hover:shadow-lg hover:shadow-pink-50"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-700">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-4 mb-16 sm:mx-6 lg:mx-auto lg:max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-3xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-3 text-base text-gray-400">
            매일 조금씩, 꾸준히 학습하면 일본어 실력이 쑥쑥 자랍니다
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-pink-500 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            대시보드로 이동
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-pink-400">Kyma</span>
              <span className="text-xs text-gray-400">
                きょうま
              </span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Kyma. AnYoungJun. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

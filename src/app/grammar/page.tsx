import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";

const levels = [
  { level: "N5", count: 30, desc: "기초 문법", detail: "です/ます, 조사, 기본 문형", available: true },
  { level: "N4", count: 20, desc: "초중급 문법", detail: "조건, 추측, 가능, 수동", available: true },
  { level: "N3", count: 0, desc: "중급 문법", detail: "복합 표현, 경어 기초", available: false },
  { level: "N2", count: 0, desc: "중상급 문법", detail: "서면어, 문어체 표현", available: false },
  { level: "N1", count: 0, desc: "상급 문법", detail: "고급 문어, 관용 표현", available: false },
];

export default function GrammarPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">문법 학습</h1>
      <p className="text-gray-600 mb-8">JLPT 레벨별 일본어 문법을 체계적으로 학습하세요</p>

      <div className="grid gap-4">
        {levels.map((l) => (
          <div key={l.level} className={`relative rounded-xl border-2 p-6 transition-all ${
            l.available
              ? "border-violet-200 bg-white hover:border-violet-400 hover:shadow-lg cursor-pointer"
              : "border-gray-100 bg-gray-50 opacity-60"
          }`}>
            {l.available ? (
              <Link href={`/grammar/${l.level}`} className="absolute inset-0" />
            ) : null}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  l.available ? "bg-violet-100 text-violet-600" : "bg-gray-200 text-gray-400"
                }`}>
                  {l.available ? <BookOpen size={28} /> : <Lock size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">JLPT {l.level}</h2>
                    {l.available ? (
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">
                        {l.count}개 문법
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full">준비 중</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{l.desc} — {l.detail}</p>
                </div>
              </div>
              {l.available && (
                <span className="text-violet-500 font-medium text-sm">학습하기 →</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

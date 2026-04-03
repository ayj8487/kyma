import Link from "next/link";
import { PenTool, Sparkles } from "lucide-react";

const features = [
  { href: "/ai/conversation", icon: Sparkles, title: "AI 자유 대화", desc: "AI와 자유롭게 일본어로 대화하세요. 난이도별 맞춤 대화와 실시간 문법 교정을 받을 수 있습니다.", color: "pink", badge: "18개 시나리오" },
  { href: "/ai/correction", icon: PenTool, title: "문장 교정", desc: "작성한 일본어 문장의 문법 오류를 확인하고 올바른 표현을 배우세요. 조사, 활용, 문체 등을 점검합니다.", color: "violet", badge: "실시간 교정" },
];

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🤖 AI 학습</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-8">AI 기반 일본어 학습 도구를 활용하세요</p>
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className={`group bg-white border-2 border-${f.color}-100 rounded-2xl p-6 hover:border-${f.color}-400 hover:shadow-lg transition-all dark:bg-zinc-800 dark:border-${f.color}-800 dark:hover:border-${f.color}-500`}>
            <div className={`w-14 h-14 bg-${f.color}-100 rounded-xl flex items-center justify-center mb-4 text-${f.color}-600 group-hover:scale-110 transition-transform`}>
              <f.icon size={28} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold">{f.title}</h2>
              <span className={`px-2 py-0.5 bg-${f.color}-100 text-${f.color}-700 text-xs rounded-full`}>{f.badge}</span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

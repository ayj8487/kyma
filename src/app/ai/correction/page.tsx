"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Send } from "lucide-react";
import { correctSentence, CorrectionResult } from "@/lib/correction";

const exampleSentences = [
  "学校が行きます。",
  "友達を会いました。",
  "図書館が勉強します。",
  "私は学生です。",
  "日本語を勉強しています。",
];

export default function CorrectionPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CorrectionResult | null>(null);

  const handleCorrect = () => {
    if (!input.trim()) return;
    setResult(correctSentence(input.trim()));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/ai" className="text-indigo-600 hover:underline text-sm flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> AI 학습
      </Link>
      <h1 className="text-3xl font-bold mb-2 dark:text-zinc-50">✏️ 문장 교정</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-8">일본어 문장을 입력하면 문법 오류를 확인해 드립니다</p>

      <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6 mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 block">일본어 문장을 입력하세요</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: 学校が行きます。"
          className="w-full border dark:border-zinc-600 rounded-xl px-4 py-3 text-lg resize-none h-24 outline-none focus:border-indigo-400 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-600"
        />
        <div className="flex justify-between items-center mt-3">
          <div className="flex flex-wrap gap-1">
            {exampleSentences.map((s, i) => (
              <button key={i} onClick={() => setInput(s)} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600">{s.slice(0, 8)}...</button>
            ))}
          </div>
          <button onClick={handleCorrect} disabled={!input.trim()} className="px-5 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">
            <Send size={16} /> 교정하기
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`border-2 rounded-2xl p-6 ${result.isCorrect ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.isCorrect ? <CheckCircle2 className="text-green-500" size={24} /> : <AlertTriangle className="text-yellow-500" size={24} />}
              <h3 className="font-bold text-lg dark:text-zinc-100">{result.isCorrect ? "문법적으로 올바른 문장입니다!" : `${result.corrections.length}개의 수정 사항`}</h3>
            </div>
            {!result.isCorrect && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">원문:</span>
                  <p className="text-lg line-through text-red-400">{result.original}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">교정:</span>
                  <p className="text-lg text-green-700 dark:text-green-400 font-medium">{result.corrected}</p>
                </div>
              </div>
            )}
          </div>

          {result.corrections.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6">
              <h3 className="font-bold mb-3 dark:text-zinc-100">상세 교정 내용</h3>
              <div className="space-y-3">
                {result.corrections.map((c, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 text-xs rounded-full font-medium">{c.type}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-red-400 line-through">{c.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{c.corrected}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.tips.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-zinc-100"><Lightbulb className="text-yellow-500" size={18} /> 학습 팁</h3>
              <ul className="space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-zinc-400 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

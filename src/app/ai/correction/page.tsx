"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
  Volume2,
  Loader2,
  History,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { correctSentence } from "@/lib/correction";
import { speakJapanese } from "@/lib/tts";

interface AiCorrection {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}

interface AiResult {
  isCorrect: boolean;
  corrected: string;
  corrections: AiCorrection[];
  naturalAlternative: string | null;
  tips: string[];
  level: string;
}

interface HistoryItem {
  input: string;
  result: AiResult;
  usedAi: boolean;
  timestamp: Date;
}

const exampleSentences = [
  "学校が行きます。",
  "友達を会いました。",
  "図書館が勉強します。",
  "私は学生です。",
  "日本語を勉強しています。",
];

const typeColors: Record<string, string> = {
  조사: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  시제: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  어순: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  동사활용: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  경어: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  표현: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const levelColors: Record<string, string> = {
  N5: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  N4: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  N3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  N2: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  N1: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function CorrectionPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedAi, setUsedAi] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleCorrect = useCallback(async () => {
    const sentence = input.trim();
    if (!sentence) return;
    setLoading(true);
    setShowFallback(false);

    try {
      const res = await fetch("/api/ai/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json() as AiResult & { error?: string };
      if (data.error) throw new Error(data.error);

      setResult(data);
      setUsedAi(true);
      setHistory((prev) =>
        [{ input: sentence, result: data, usedAi: true, timestamp: new Date() }, ...prev].slice(0, 10)
      );
    } catch {
      // Fallback to local rule-based correction
      const local = correctSentence(sentence);
      const fallbackResult: AiResult = {
        isCorrect: local.isCorrect,
        corrected: local.corrected,
        corrections: local.corrections,
        naturalAlternative: null,
        tips: local.tips,
        level: "N5",
      };
      setResult(fallbackResult);
      setUsedAi(false);
      setShowFallback(true);
      setHistory((prev) =>
        [{ input: sentence, result: fallbackResult, usedAi: false, timestamp: new Date() }, ...prev].slice(0, 10)
      );
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleCorrect();
    }
  };

  const loadHistory = (item: HistoryItem) => {
    setInput(item.input);
    setResult(item.result);
    setUsedAi(item.usedAi);
    setShowFallback(!item.usedAi);
    setShowHistory(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/ai" className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> AI 학습
        </Link>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <History size={15} />
            교정 기록 ({history.length})
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2 dark:text-zinc-50">✏️ 문장 교정</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-8">
        AI가 일본어 문장의 문법 오류를 분석하고 교정해 드립니다
      </p>

      {/* History panel */}
      {showHistory && (
        <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-4 mb-5">
          <h3 className="font-semibold text-sm mb-3 dark:text-zinc-200">최근 교정 기록</h3>
          <ul className="space-y-2">
            {history.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => loadHistory(item)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {item.usedAi ? (
                      <Sparkles size={12} className="text-violet-500 shrink-0" />
                    ) : (
                      <WifiOff size={12} className="text-zinc-400 shrink-0" />
                    )}
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{item.input}</span>
                    <span
                      className={`ml-auto shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                        item.result.isCorrect
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      }`}
                    >
                      {item.result.isCorrect ? "정확" : `${item.result.corrections.length}개 오류`}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6 mb-6">
        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 block">
          일본어 문장을 입력하세요
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: 学校が行きます。"
          className="w-full border dark:border-zinc-600 rounded-xl px-4 py-3 text-lg resize-none h-24 outline-none focus:border-indigo-400 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-600"
        />
        <div className="flex justify-between items-center mt-3">
          <div className="flex flex-wrap gap-1">
            {exampleSentences.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
              >
                {s.slice(0, 8)}...
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:block">Ctrl+Enter</span>
            <button
              onClick={handleCorrect}
              disabled={!input.trim() || loading}
              className="px-5 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              교정하기
            </button>
          </div>
        </div>
      </div>

      {/* AI / Fallback badge */}
      {result && (
        <div className="flex items-center gap-2 mb-3">
          {usedAi ? (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 rounded-full font-medium">
              <Sparkles size={11} /> AI 교정
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 rounded-full">
              <WifiOff size={11} /> 오프라인 교정
              {showFallback && (
                <span className="ml-1 text-zinc-400">— AI를 사용할 수 없어 기본 규칙으로 교정했습니다</span>
              )}
            </span>
          )}
          {result.level && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                levelColors[result.level] ?? "bg-zinc-100 text-zinc-600"
              }`}
            >
              JLPT {result.level}
            </span>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Correct/incorrect banner */}
          <div
            className={`border-2 rounded-2xl p-6 ${
              result.isCorrect
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.isCorrect ? (
                <CheckCircle2 className="text-green-500" size={24} />
              ) : (
                <AlertTriangle className="text-yellow-500" size={24} />
              )}
              <h3 className="font-bold text-lg dark:text-zinc-100">
                {result.isCorrect
                  ? "문법적으로 올바른 문장입니다!"
                  : `${result.corrections.length}개의 수정 사항`}
              </h3>
            </div>
            {!result.isCorrect && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">원문:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg line-through text-red-400">{input.trim()}</p>
                    <button
                      onClick={() => speakJapanese(input.trim())}
                      className="text-zinc-400 hover:text-indigo-500"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-zinc-400">교정:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg text-green-700 dark:text-green-400 font-medium">
                      {result.corrected}
                    </p>
                    <button
                      onClick={() => speakJapanese(result.corrected)}
                      className="text-zinc-400 hover:text-indigo-500"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {result.isCorrect && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg text-green-700 dark:text-green-400">{input.trim()}</p>
                <button
                  onClick={() => speakJapanese(input.trim())}
                  className="text-zinc-400 hover:text-indigo-500"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Detailed corrections */}
          {result.corrections.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6">
              <h3 className="font-bold mb-3 dark:text-zinc-100">상세 교정 내용</h3>
              <div className="space-y-3">
                {result.corrections.map((c, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          typeColors[c.type] ??
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}
                      >
                        {c.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
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

          {/* Natural alternative */}
          {result.naturalAlternative && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5">
              <h3 className="font-bold mb-2 text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
                <Sparkles size={16} /> 더 자연스러운 표현
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-indigo-700 dark:text-indigo-300 font-medium">
                  {result.naturalAlternative}
                </p>
                <button
                  onClick={() => speakJapanese(result.naturalAlternative!)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-zinc-100">
                <Lightbulb className="text-yellow-500" size={18} /> 학습 팁
              </h3>
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

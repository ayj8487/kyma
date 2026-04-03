"use client";

import { useState } from "react";
import { Newspaper, Volume2, Eye, EyeOff, BookOpen } from "lucide-react";
import { newsArticles } from "@/data/news";
import { speakJapanese } from "@/lib/tts";

const difficultyMap: Record<string, { label: string; color: string }> = {
  easy: { label: "쉬움", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  medium: { label: "보통", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  hard: { label: "어려움", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export default function NewsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showKorean, setShowKorean] = useState(false);
  const [diffFilter, setDiffFilter] = useState("all");

  const filtered = diffFilter === "all" ? newsArticles : newsArticles.filter((a) => a.difficulty === diffFilter);
  const selected = newsArticles.find((a) => a.id === selectedId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Newspaper className="text-indigo-600" /> 일본어 뉴스 읽기</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-6">쉬운 일본어 뉴스를 읽으며 독해력을 키우세요</p>

      <div className="flex gap-2 mb-6">
        {[{ key: "all", label: "전체" }, { key: "easy", label: "쉬움" }, { key: "medium", label: "보통" }, { key: "hard", label: "어려움" }].map((f) => (
          <button key={f.key} onClick={() => setDiffFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${diffFilter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}>{f.label}</button>
        ))}
      </div>

      {!selected ? (
        <div className="grid gap-3">
          {filtered.map((article) => (
            <button key={article.id} onClick={() => setSelectedId(article.id)} className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-indigo-500">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${difficultyMap[article.difficulty].color}`}>{difficultyMap[article.difficulty].label}</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full dark:bg-zinc-700 dark:text-zinc-400">{article.category}</span>
                <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">{article.date}</span>
              </div>
              <h3 className="text-lg font-bold">{article.title}</h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">{article.titleReading}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 line-clamp-2">{article.content.slice(0, 60)}...</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => { setSelectedId(null); setShowKorean(false); }} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-4 block">← 목록으로</button>
          <div className="bg-white border rounded-2xl p-6 dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${difficultyMap[selected.difficulty].color}`}>{difficultyMap[selected.difficulty].label}</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full dark:bg-zinc-700 dark:text-zinc-400">{selected.category}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{selected.title}</h2>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6">{selected.titleReading}</p>

            <div className="flex gap-2 mb-4">
              <button onClick={() => speakJapanese(selected.content)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-sm flex items-center gap-1"><Volume2 size={14} /> 전체 듣기</button>
              <button onClick={() => setShowKorean(!showKorean)} className="px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300 rounded-lg text-sm flex items-center gap-1">{showKorean ? <EyeOff size={14} /> : <Eye size={14} />}{showKorean ? "한국어 숨기기" : "한국어 보기"}</button>
            </div>

            <div className="text-lg leading-relaxed mb-4 whitespace-pre-line">{selected.content}</div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{selected.contentReading}</p>
            {showKorean && <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 mb-4">{selected.korean}</div>}

            <div className="border-t dark:border-zinc-700 pt-4">
              <h3 className="font-bold mb-3 flex items-center gap-2"><BookOpen size={16} /> 주요 단어</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selected.vocabularyList.map((v, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 text-sm">
                    <button onClick={() => speakJapanese(v.word)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                      <Volume2 size={12} /> <span className="font-bold">{v.word}</span>
                    </button>
                    <p className="text-gray-400 dark:text-zinc-500 text-xs">{v.reading}</p>
                    <p className="text-gray-600 dark:text-zinc-300">{v.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

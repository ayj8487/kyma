"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, X, Volume2, BookOpen } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { speakJapanese } from "@/lib/tts";

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useStudyStore();
  const [tab, setTab] = useState<"word" | "kana">("word");

  const wordBookmarks = bookmarks.filter((b) => b.startsWith("word:")).map((b) => {
    const id = b.split(":")[1];
    return n5Words.find((w) => w.id === id);
  }).filter(Boolean);

  const kanaBookmarks = bookmarks.filter((b) => b.startsWith("kana:")).map((b) => {
    const id = b.split(":")[1];
    return [...hiraganaData, ...katakanaData].find((k) => k.id === id);
  }).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Bookmark className="text-yellow-500" /> 북마크
      </h1>
      <p className="text-gray-600 mb-6">저장한 학습 항목을 관리하세요</p>

      <div className="flex gap-2 mb-6">
        {[
          { key: "word" as const, label: "단어", count: wordBookmarks.length },
          { key: "kana" as const, label: "가나", count: kanaBookmarks.length },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === t.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "word" && (
        <div className="space-y-2">
          {wordBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">북마크한 단어가 없습니다</p>
              <Link href="/words" className="text-indigo-600 hover:underline text-sm">단어 학습하러 가기 →</Link>
            </div>
          ) : (
            wordBookmarks.map((w) => w && (
              <div key={w.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => speakJapanese(w.reading)} className="text-indigo-500 hover:text-indigo-700"><Volume2 size={18} /></button>
                  <div>
                    <span className="text-xl font-bold">{w.word}</span>
                    <span className="text-indigo-500 ml-2 text-sm">{w.reading}</span>
                    <span className="text-gray-500 ml-2 text-sm">{w.meaning}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{w.partOfSpeech}</span>
                </div>
                <button onClick={() => toggleBookmark("word", w.id)} className="text-red-400 hover:text-red-600 p-2"><X size={16} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "kana" && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {kanaBookmarks.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">북마크한 가나가 없습니다</p>
              <Link href="/kana" className="text-indigo-600 hover:underline text-sm">가나 학습하러 가기 →</Link>
            </div>
          ) : (
            kanaBookmarks.map((k) => k && (
              <div key={k.id} className="bg-white border rounded-xl p-3 text-center relative group">
                <button onClick={() => toggleBookmark("kana", k.id)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                <button onClick={() => speakJapanese(k.character)} className="w-full">
                  <div className="text-2xl font-bold">{k.character}</div>
                  <div className="text-xs text-gray-400">{k.romaji}</div>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

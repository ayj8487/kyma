"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, X, Volume2, BookOpen, Film, Eye, EyeOff, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { animeQuotes } from "@/data/anime-quotes";
import { grammarPoints } from "@/data/grammar";
import { speakJapanese } from "@/lib/tts";

type TabKey = "word" | "kana" | "anime" | "grammar";

const diffMap: Record<string, { label: string; color: string }> = {
  beginner: { label: "초급", color: "bg-green-100 text-green-700" },
  intermediate: { label: "중급", color: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "고급", color: "bg-red-100 text-red-700" },
};

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useStudyStore();
  const [tab, setTab] = useState<TabKey>("anime");
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const wordBookmarks = bookmarks.filter((b) => b.startsWith("word:")).map((b) => {
    const id = b.split(":")[1];
    return n5Words.find((w) => w.id === id);
  }).filter(Boolean);

  const kanaBookmarks = bookmarks.filter((b) => b.startsWith("kana:")).map((b) => {
    const id = b.split(":")[1];
    return [...hiraganaData, ...katakanaData].find((k) => k.id === id);
  }).filter(Boolean);

  const animeBookmarks = bookmarks.filter((b) => b.startsWith("anime:")).map((b) => {
    const id = b.split(":")[1];
    return animeQuotes.find((q) => q.id === id);
  }).filter(Boolean);

  const grammarBookmarks = bookmarks.filter((b) => b.startsWith("grammar:")).map((b) => {
    const id = b.split(":")[1];
    return grammarPoints.find((g) => g.id === id);
  }).filter(Boolean);

  const totalCount = wordBookmarks.length + kanaBookmarks.length + animeBookmarks.length + grammarBookmarks.length;

  const tabs: { key: TabKey; label: string; count: number; color: string }[] = [
    { key: "anime", label: "애니 대사", count: animeBookmarks.length, color: "purple" },
    { key: "word", label: "단어", count: wordBookmarks.length, color: "indigo" },
    { key: "grammar", label: "문법", count: grammarBookmarks.length, color: "emerald" },
    { key: "kana", label: "가나", count: kanaBookmarks.length, color: "blue" },
  ];

  const clearAll = (type: string) => {
    bookmarks.filter((b) => b.startsWith(`${type}:`)).forEach((b) => {
      const id = b.split(":")[1];
      toggleBookmark(type, id);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="text-yellow-500" /> 북마크
        </h1>
        <span className="text-sm text-gray-400">총 {totalCount}개</span>
      </div>
      <p className="text-gray-600 mb-6">저장한 학습 항목을 관리하세요</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === t.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* 애니 대사 탭 */}
      {tab === "anime" && (
        <div className="space-y-3">
          {animeBookmarks.length > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={() => clearAll("anime")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 해제</button>
            </div>
          )}
          {animeBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Film size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">북마크한 애니 대사가 없습니다</p>
              <Link href="/anime" className="text-indigo-600 hover:underline text-sm">애니 대사 학습하러 가기 →</Link>
            </div>
          ) : (
            animeBookmarks.map((q) => q && (
              <div key={q.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">{q.anime}</span>
                    {q.character !== "-" && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{q.character}</span>}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${diffMap[q.difficulty]?.color || ""}`}>{diffMap[q.difficulty]?.label || q.difficulty}</span>
                    <button onClick={() => toggleBookmark("anime", q.id)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                  <p className="text-lg font-bold mb-1">{q.japanese}</p>
                  <p className="text-xs text-gray-400 mb-2">{q.reading}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => speakJapanese(q.japanese)} className="text-indigo-500 hover:text-indigo-700"><Volume2 size={16} /></button>
                    <button onClick={() => setShowTranslation((p) => ({ ...p, [q.id]: !p[q.id] }))} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
                      {showTranslation[q.id] ? <EyeOff size={14} /> : <Eye size={14} />}{showTranslation[q.id] ? "숨기기" : "번역"}
                    </button>
                    <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} className="ml-auto text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
                      단어 {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  {showTranslation[q.id] && <p className="mt-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{q.korean}</p>}
                </div>
                {expandedId === q.id && q.vocabularyNotes.length > 0 && (
                  <div className="border-t bg-gray-50 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {q.vocabularyNotes.map((v, i) => (
                        <div key={i} className="bg-white rounded-lg px-3 py-1.5 border text-sm">
                          <span className="font-bold text-indigo-700">{v.word}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500">{v.reading}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-600">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 단어 탭 */}
      {tab === "word" && (
        <div className="space-y-2">
          {wordBookmarks.length > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={() => clearAll("word")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 해제</button>
            </div>
          )}
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

      {/* 문법 탭 */}
      {tab === "grammar" && (
        <div className="space-y-3">
          {grammarBookmarks.length > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={() => clearAll("grammar")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 해제</button>
            </div>
          )}
          {grammarBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">북마크한 문법이 없습니다</p>
              <Link href="/grammar" className="text-indigo-600 hover:underline text-sm">문법 학습하러 가기 →</Link>
            </div>
          ) : (
            grammarBookmarks.map((g) => g && (
              <div key={g.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{g.jlptLevel}</span>
                    <span className="font-bold text-lg">{g.pattern}</span>
                    <button onClick={() => toggleBookmark("grammar", g.id)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{g.meaning}</p>
                  <p className="text-xs text-gray-400">{g.explanation}</p>
                  {g.examples.length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
                      {g.examples.slice(0, 2).map((ex, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <button onClick={() => speakJapanese(ex.japanese)} className="text-indigo-500 hover:text-indigo-700 flex-shrink-0"><Volume2 size={14} /></button>
                            <span className="font-medium">{ex.japanese}</span>
                          </div>
                          <p className="text-xs text-gray-500 ml-6">{ex.korean}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 가나 탭 */}
      {tab === "kana" && (
        <div>
          {kanaBookmarks.length > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={() => clearAll("kana")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 해제</button>
            </div>
          )}
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
        </div>
      )}
    </div>
  );
}

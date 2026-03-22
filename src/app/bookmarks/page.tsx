"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, X, Volume2, BookOpen, Film, Eye, EyeOff, ChevronDown, ChevronUp, Trash2, BookText } from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";
import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { animeQuotes } from "@/data/anime-quotes";
import { grammarPoints } from "@/data/grammar";
import { speakJapanese } from "@/lib/tts";

type TabKey = "word" | "kana" | "anime" | "grammar";

const diffMap: Record<string, { label: string; color: string }> = {
  beginner: { label: "초급", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  intermediate: { label: "중급", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  advanced: { label: "고급", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const allWords = [...n5Words, ...n4Words, ...n3Words, ...n2Words];

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark } = useStudyStore();
  const [tab, setTab] = useState<TabKey>("anime");
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const wordBookmarks = bookmarks.filter((b) => b.startsWith("word:")).map((b) => {
    const id = b.split(":")[1];
    return allWords.find((w) => w.id === id);
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

  const tabs: { key: TabKey; label: string; count: number; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { key: "anime", label: "애니 대사", count: animeBookmarks.length, icon: Film },
    { key: "word", label: "단어", count: wordBookmarks.length, icon: BookOpen },
    { key: "grammar", label: "문법", count: grammarBookmarks.length, icon: BookText },
    { key: "kana", label: "가나", count: kanaBookmarks.length, icon: BookOpen },
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
          <Bookmark className="text-yellow-500" /> 단어장
        </h1>
        <span className="text-sm text-gray-400 dark:text-zinc-500">총 {totalCount}개 저장</span>
      </div>
      <p className="text-gray-600 dark:text-zinc-400 mb-6">학습 중 저장한 항목들을 모아보세요</p>

      {/* 탭 버튼 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Icon size={14} />
              {t.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                tab === t.key
                  ? "bg-white/20"
                  : "bg-gray-200 dark:bg-zinc-700"
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 애니 대사 탭 */}
      {tab === "anime" && (
        <div className="space-y-3">
          {animeBookmarks.length > 0 && (
            <div className="flex justify-end mb-2">
              <button onClick={() => clearAll("anime")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
            </div>
          )}
          {animeBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
              <Film size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">저장한 애니 대사가 없습니다</p>
              <p className="text-xs text-gray-300 dark:text-zinc-600 mb-3">애니 대사 학습에서 ⭐ 버튼을 눌러 저장하세요</p>
              <Link href="/anime" className="text-indigo-600 hover:underline text-sm">애니 대사 학습하러 가기 →</Link>
            </div>
          ) : (
            animeBookmarks.map((q) => q && (
              <div key={q.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs rounded-full font-medium">{q.anime}</span>
                    {q.character !== "-" && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400 text-xs rounded-full">{q.character}</span>}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${diffMap[q.difficulty]?.color || ""}`}>{diffMap[q.difficulty]?.label || q.difficulty}</span>
                    <button onClick={() => toggleBookmark("anime", q.id)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                  <p className="text-lg font-bold mb-1 dark:text-zinc-100">{q.japanese}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mb-2">{q.reading}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => speakJapanese(q.japanese)} className="text-indigo-500 hover:text-indigo-700"><Volume2 size={16} /></button>
                    <button onClick={() => setShowTranslation((p) => ({ ...p, [q.id]: !p[q.id] }))} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 text-sm">
                      {showTranslation[q.id] ? <EyeOff size={14} /> : <Eye size={14} />}{showTranslation[q.id] ? "숨기기" : "번역"}
                    </button>
                    {q.vocabularyNotes.length > 0 && (
                      <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 text-sm">
                        단어 {expandedId === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                  {showTranslation[q.id] && <p className="mt-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">{q.korean}</p>}
                </div>
                {expandedId === q.id && q.vocabularyNotes.length > 0 && (
                  <div className="border-t dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {q.vocabularyNotes.map((v, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5 border dark:border-zinc-700 text-sm">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400">{v.word}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500 dark:text-zinc-400">{v.reading}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-600 dark:text-zinc-300">{v.meaning}</span>
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
              <button onClick={() => clearAll("word")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
            </div>
          )}
          {wordBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">저장한 단어가 없습니다</p>
              <p className="text-xs text-gray-300 dark:text-zinc-600 mb-3">단어 학습에서 ⭐ 버튼을 눌러 저장하세요</p>
              <Link href="/words" className="text-indigo-600 hover:underline text-sm">단어 학습하러 가기 →</Link>
            </div>
          ) : (
            wordBookmarks.map((w) => w && (
              <div key={w.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <button onClick={() => speakJapanese(w.reading)} className="text-indigo-500 hover:text-indigo-700"><Volume2 size={18} /></button>
                  <div>
                    <span className="text-xl font-bold dark:text-zinc-100">{w.word}</span>
                    <span className="text-indigo-500 ml-2 text-sm">{w.reading}</span>
                    <span className="text-gray-500 dark:text-zinc-400 ml-2 text-sm">{w.meaning}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 text-xs rounded-full hidden sm:inline">{w.partOfSpeech}</span>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs rounded-full hidden sm:inline">{w.jlptLevel}</span>
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
              <button onClick={() => clearAll("grammar")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
            </div>
          )}
          {grammarBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
              <BookText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-2">저장한 문법이 없습니다</p>
              <p className="text-xs text-gray-300 dark:text-zinc-600 mb-3">문법 학습에서 ⭐ 버튼을 눌러 저장하세요</p>
              <Link href="/grammar" className="text-indigo-600 hover:underline text-sm">문법 학습하러 가기 →</Link>
            </div>
          ) : (
            grammarBookmarks.map((g) => g && (
              <div key={g.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs rounded-full font-medium">{g.jlptLevel}</span>
                    <span className="font-bold text-lg dark:text-zinc-100">{g.pattern}</span>
                    <button onClick={() => toggleBookmark("grammar", g.id)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">{g.meaning}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{g.explanation}</p>
                  <p className="text-xs text-gray-300 dark:text-zinc-600 mt-1">{g.formation}</p>
                  {g.examples.length > 0 && (
                    <div className="mt-3 bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 space-y-2">
                      {g.examples.slice(0, 2).map((ex, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <button onClick={() => speakJapanese(ex.japanese)} className="text-indigo-500 hover:text-indigo-700 flex-shrink-0"><Volume2 size={14} /></button>
                            <span className="font-medium dark:text-zinc-200">{ex.japanese}</span>
                          </div>
                          <p className="text-xs text-indigo-500 dark:text-indigo-400 ml-6">{ex.reading}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 ml-6">{ex.korean}</p>
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
              <button onClick={() => clearAll("kana")} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> 전체 삭제</button>
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {kanaBookmarks.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400 dark:text-zinc-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-2">저장한 가나가 없습니다</p>
                <p className="text-xs text-gray-300 dark:text-zinc-600 mb-3">가나 학습에서 길게 눌러 팝업 → ⭐ 버튼으로 저장하세요</p>
                <Link href="/kana" className="text-indigo-600 hover:underline text-sm">가나 학습하러 가기 →</Link>
              </div>
            ) : (
              kanaBookmarks.map((k) => k && (
                <div key={k.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl p-3 text-center relative group hover:shadow-md transition-shadow">
                  <button onClick={() => toggleBookmark("kana", k.id)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  <button onClick={() => speakJapanese(k.character)} className="w-full">
                    <div className="text-2xl font-bold dark:text-zinc-100">{k.character}</div>
                    <div className="text-xs text-gray-400 dark:text-zinc-500">{k.romaji}</div>
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

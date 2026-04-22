"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Volume2, BookOpen, Bookmark, Filter } from "lucide-react";
import { speakJapanese } from "@/lib/tts";
import { grammarPoints } from "@/data/grammar";
import { useStudyStore } from "@/store/useStudyStore";

export default function GrammarLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("전체");
  const { toggleBookmark, isBookmarked } = useStudyStore();

  const [showAllTags, setShowAllTags] = useState(false);

  const grammarList = grammarPoints.filter((g) => g.jlptLevel === level);

  const sortedTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    grammarList.forEach((g) => g.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }));
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }, [grammarList]);

  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, 10);
  const filteredGrammar = selectedTag === "전체"
    ? grammarList
    : grammarList.filter((g) => g.tags.includes(selectedTag));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/grammar" className="text-violet-600 hover:underline text-sm flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> 문법 목록
          </Link>
          <h1 className="text-3xl font-bold dark:text-zinc-50">JLPT {level} 문법</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">총 {grammarList.length}개 문법 포인트</p>
        </div>
        <Link
          href="/grammar/flashcard"
          className="flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
        >
          <BookOpen size={16} />
          플래시카드
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-violet-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">태그 필터</span>
          {selectedTag !== "전체" && (
            <button onClick={() => setSelectedTag("전체")} className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 ml-auto">초기화</button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedTag("전체")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedTag === "전체"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
            }`}
          >
            전체
          </button>
          {visibleTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
              }`}
            >
              {tag} <span className="opacity-60">{count}</span>
            </button>
          ))}
          {sortedTags.length > 10 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="px-3 py-1.5 rounded-full text-xs text-violet-500 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50 flex items-center gap-0.5 transition-colors"
            >
              {showAllTags ? "접기" : `+${sortedTags.length - 10}개 더보기`}
              {showAllTags ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredGrammar.map((g) => {
          const isExpanded = expandedId === g.id;
          return (
            <div key={g.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                onClick={() => setExpandedId(isExpanded ? null : g.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 w-10 h-10 rounded-lg flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span
                      className="text-lg font-bold text-violet-700 dark:text-violet-400 cursor-pointer hover:text-violet-900 dark:hover:text-violet-300 transition-colors"
                      onClick={(e) => { e.stopPropagation(); speakJapanese(g.pattern); }}
                    >{g.pattern}</span>
                    <span className="text-gray-500 dark:text-zinc-400 ml-3 text-sm">{g.meaning}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 text-xs rounded-full hidden sm:inline">
                      {t}
                    </span>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark("grammar", g.id); }}
                    className="p-1.5 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                    aria-label="단어장에 저장"
                  >
                    <Bookmark size={16} className={isBookmarked("grammar", g.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-zinc-600"} />
                  </button>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">설명</h3>
                      <p className="text-gray-600 dark:text-zinc-400 text-sm">{g.explanation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">접속 방법</h3>
                      <p className="text-violet-700 dark:text-violet-400 text-sm font-mono bg-violet-50 dark:bg-violet-900/30 inline-block px-3 py-1 rounded">{g.formation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">예문</h3>
                      <div className="space-y-2">
                        {g.examples.map((ex, i) => (
                          <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg p-3 border dark:border-zinc-700">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-medium dark:text-zinc-100">{ex.japanese}</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); speakJapanese(ex.japanese); }}
                                className="text-violet-500 hover:text-violet-700 p-1"
                                title="발음 듣기"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{ex.reading}</p>
                            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{ex.korean}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGrammar.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>해당 태그의 문법이 없습니다</p>
        </div>
      )}
    </div>
  );
}

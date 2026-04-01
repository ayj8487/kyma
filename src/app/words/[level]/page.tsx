"use client";

import { use, useState } from "react";
import Link from "next/link";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { speakJapanese } from "@/lib/tts";
import { Word } from "@/types";
import { useStudyStore } from "@/store/useStudyStore";
import {
  ArrowLeft,
  Volume2,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Bookmark,
} from "lucide-react";

const partOfSpeechFilters = ["전체", "명사", "동사", "형용사"] as const;

const posColorMap: Record<string, string> = {
  명사: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  동사: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  형용사: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function WordListPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { toggleBookmark, isBookmarked } = useStudyStore();

  const wordsByLevel: Record<string, Word[]> = {
    N5: n5Words,
    N4: n4Words,
    N3: n3Words,
    N2: n2Words,
  };
  const words = wordsByLevel[level.toUpperCase()] || n5Words;

  const filteredWords = words.filter((word) => {
    const matchesFilter =
      activeFilter === "전체" || word.partOfSpeech === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      word.word.includes(searchQuery) ||
      word.reading.includes(searchQuery) ||
      word.meaning.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/words"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
          <Link
            href="/words/flashcard"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            <Layers className="h-4 w-4" />
            플래시카드
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            JLPT {level} 단어
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            총 {words.length}개 단어
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="단어, 읽기, 뜻으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {partOfSpeechFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Word count */}
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          {filteredWords.length}개 단어 표시
        </p>

        {/* Word cards */}
        <div className="space-y-3">
          {filteredWords.map((word) => {
            const isExpanded = expandedId === word.id;
            return (
              <div
                key={word.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80"
              >
                {/* Main card content */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : word.id)
                  }
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={(e) => { e.stopPropagation(); speakJapanese(word.word); }}
                      >
                        {word.word}
                      </span>
                      <span className="text-sm text-indigo-500 dark:text-indigo-400">
                        {word.reading}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {word.meaning}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      posColorMap[word.partOfSpeech] ||
                      "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {word.partOfSpeech}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark("word", word.id);
                    }}
                    className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    aria-label="단어장에 저장"
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked("word", word.id) ? "text-yellow-500 fill-yellow-500" : "text-zinc-300 dark:text-zinc-600"}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(word.word);
                    }}
                    className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                    aria-label="발음 듣기"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="shrink-0 text-zinc-400">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && word.exampleSentence && (
                  <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      예문
                    </p>
                    <p className="mt-2 text-base font-medium text-zinc-900 dark:text-zinc-100">
                      {word.exampleSentence}
                    </p>
                    <p className="mt-1 text-sm text-indigo-500 dark:text-indigo-400">
                      {word.exampleReading}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {word.exampleMeaning}
                    </p>
                    <button
                      onClick={() =>
                        speakJapanese(word.exampleSentence || "")
                      }
                      className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      예문 듣기
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-zinc-400 dark:text-zinc-500">
              검색 결과가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

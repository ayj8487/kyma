"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Volume2, BookOpen } from "lucide-react";
import { speakJapanese } from "@/lib/tts";
import { grammarPoints } from "@/data/grammar";

export default function GrammarLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("전체");

  const grammarList = grammarPoints.filter((g) => g.jlptLevel === level);

  const allTags = ["전체", ...Array.from(new Set(grammarList.flatMap((g) => g.tags)))];
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
          <h1 className="text-3xl font-bold">JLPT {level} 문법</h1>
          <p className="text-gray-500 mt-1">총 {grammarList.length}개 문법 포인트</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredGrammar.map((g) => {
          const isExpanded = expandedId === g.id;
          return (
            <div key={g.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedId(isExpanded ? null : g.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-violet-100 text-violet-700 w-10 h-10 rounded-lg flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-violet-700">{g.pattern}</span>
                    <span className="text-gray-500 ml-3 text-sm">{g.meaning}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-full hidden sm:inline">
                      {t}
                    </span>
                  ))}
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t bg-gray-50">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">설명</h3>
                      <p className="text-gray-600 text-sm">{g.explanation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">접속 방법</h3>
                      <p className="text-violet-700 text-sm font-mono bg-violet-50 inline-block px-3 py-1 rounded">{g.formation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">예문</h3>
                      <div className="space-y-2">
                        {g.examples.map((ex, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-medium">{ex.japanese}</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); speakJapanese(ex.japanese); }}
                                className="text-violet-500 hover:text-violet-700 p-1"
                                title="발음 듣기"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{ex.reading}</p>
                            <p className="text-sm text-gray-600 mt-1">{ex.korean}</p>
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
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>해당 태그의 문법이 없습니다</p>
        </div>
      )}
    </div>
  );
}

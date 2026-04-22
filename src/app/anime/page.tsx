"use client";

import { useState, useMemo } from "react";
import { Film, Volume2, Eye, EyeOff, Shuffle, ChevronDown, ChevronUp, Bookmark, Filter } from "lucide-react";
import { animeQuotes } from "@/data/anime-quotes";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";

const diffMap: Record<string, { label: string; color: string }> = {
  beginner: { label: "초급", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  intermediate: { label: "중급", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  advanced: { label: "고급", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export default function AnimePage() {
  const [diffFilter, setDiffFilter] = useState("all");
  const [animeFilter, setAnimeFilter] = useState("all");
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllAnime, setShowAllAnime] = useState(false);
  const { toggleBookmark, isBookmarked } = useStudyStore();

  const animeList = useMemo(() => {
    const counts = animeQuotes.reduce<Record<string, number>>((acc, q) => {
      acc[q.anime] = (acc[q.anime] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b, "ko"))
      .map(([name, count]) => ({ name, count }));
  }, []);

  const filtered = animeQuotes.filter((q) => {
    if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
    if (animeFilter !== "all" && q.anime !== animeFilter) return false;

    return true;
  });

  const randomQuote = () => {
    const rand = filtered[Math.floor(Math.random() * filtered.length)];
    if (rand) {
      setExpandedId(rand.id);
      document.getElementById(rand.id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 dark:text-zinc-50"><Film className="text-purple-600 dark:text-purple-400" /> 애니 대사로 학습</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-6">인기 애니메이션 명대사로 일본어를 재미있게 배우세요</p>

      {/* 필터 영역 */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button onClick={randomQuote} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-purple-700 transition-colors"><Shuffle size={14} /> 랜덤 명대사</button>
          <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700 mx-1" />
          {[{ key: "all", label: "전체" }, { key: "beginner", label: "초급" }, { key: "intermediate", label: "중급" }, { key: "advanced", label: "고급" }].map((f) => (
            <button key={f.key} onClick={() => setDiffFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${diffFilter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"}`}>{f.label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-gray-400 dark:text-zinc-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">작품별 필터</span>
          {animeFilter !== "all" && (
            <button onClick={() => setAnimeFilter("all")} className="text-xs text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 ml-auto">초기화</button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setAnimeFilter("all")} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${animeFilter === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"}`}>전체</button>
          {(showAllAnime ? animeList : animeList.slice(0, 8)).map((a) => (
            <button key={a.name} onClick={() => setAnimeFilter(a.name)} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${animeFilter === a.name ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"}`}>{a.name} <span className="opacity-60">{a.count}</span></button>
          ))}
          {animeList.length > 8 && (
            <button onClick={() => setShowAllAnime(!showAllAnime)} className="px-2.5 py-1 rounded-full text-xs text-purple-500 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 flex items-center gap-0.5 transition-colors">
              {showAllAnime ? "접기" : `+${animeList.length - 8}개 더보기`}
              {showAllAnime ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          const showTrans = showTranslation[q.id];
          return (
            <div id={q.id} key={q.id} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-xs rounded-full font-medium">{q.anime}</span>
                  {q.character !== "-" && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400 text-xs rounded-full">{q.character}</span>}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${diffMap[q.difficulty].color}`}>{diffMap[q.difficulty].label}</span>
                  <button onClick={() => toggleBookmark("anime", q.id)} className="ml-auto"><Bookmark size={16} className={isBookmarked("anime", q.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-zinc-600"} /></button>
                </div>
                <p className="text-xl font-bold mb-1 leading-relaxed dark:text-zinc-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => speakJapanese(q.japanese)}>{q.japanese}</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mb-2">{q.reading}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => speakJapanese(q.japanese)} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"><Volume2 size={16} /></button>
                  <button onClick={() => setShowTranslation((p) => ({ ...p, [q.id]: !p[q.id] }))} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 text-sm">{showTrans ? <EyeOff size={14} /> : <Eye size={14} />}{showTrans ? "번역 숨기기" : "번역 보기"}</button>
                  <button onClick={() => setExpandedId(isExpanded ? null : q.id)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 text-sm">단어 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                </div>
                {showTrans && <p className="mt-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">{q.korean}</p>}
              </div>
              {isExpanded && (
                <div className="border-t dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-5 py-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">주요 단어</h4>
                  <div className="flex flex-wrap gap-2">
                    {q.vocabularyNotes.map((v, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 border dark:border-zinc-700 text-sm">
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
          );
        })}
      </div>
    </div>
  );
}

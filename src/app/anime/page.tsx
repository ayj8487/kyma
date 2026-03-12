"use client";

import { useState, useMemo } from "react";
import { Film, Volume2, Eye, EyeOff, Shuffle, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { animeQuotes } from "@/data/anime-quotes";
import { speakJapanese } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";

const diffMap: Record<string, { label: string; color: string }> = {
  beginner: { label: "초급", color: "bg-green-100 text-green-700" },
  intermediate: { label: "중급", color: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "고급", color: "bg-red-100 text-red-700" },
};

export default function AnimePage() {
  const [diffFilter, setDiffFilter] = useState("all");
  const [animeFilter, setAnimeFilter] = useState("all");
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toggleBookmark, isBookmarked } = useStudyStore();

  const animeList = useMemo(() => Array.from(new Set(animeQuotes.map((q) => q.anime))), []);

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
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Film className="text-purple-600" /> 애니 대사로 학습</h1>
      <p className="text-gray-600 mb-6">인기 애니메이션 명대사로 일본어를 재미있게 배우세요</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={randomQuote} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-purple-700"><Shuffle size={14} /> 랜덤 명대사</button>
        {[{ key: "all", label: "전체" }, { key: "beginner", label: "초급" }, { key: "intermediate", label: "중급" }, { key: "advanced", label: "고급" }].map((f) => (
          <button key={f.key} onClick={() => setDiffFilter(f.key)} className={`px-3 py-2 rounded-lg text-sm font-medium ${diffFilter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        <button onClick={() => setAnimeFilter("all")} className={`px-2 py-1 rounded text-xs ${animeFilter === "all" ? "bg-purple-100 text-purple-700 font-medium" : "bg-gray-50 text-gray-500"}`}>전체 작품</button>
        {animeList.map((a) => (
          <button key={a} onClick={() => setAnimeFilter(a)} className={`px-2 py-1 rounded text-xs ${animeFilter === a ? "bg-purple-100 text-purple-700 font-medium" : "bg-gray-50 text-gray-500"}`}>{a}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          const showTrans = showTranslation[q.id];
          return (
            <div id={q.id} key={q.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">{q.anime}</span>
                  {q.character !== "-" && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{q.character}</span>}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${diffMap[q.difficulty].color}`}>{diffMap[q.difficulty].label}</span>
                  <button onClick={() => toggleBookmark("anime", q.id)} className="ml-auto"><Bookmark size={16} className={isBookmarked("anime", q.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} /></button>
                </div>
                <p className="text-xl font-bold mb-1 leading-relaxed">{q.japanese}</p>
                <p className="text-xs text-gray-400 mb-2">{q.reading}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => speakJapanese(q.japanese)} className="text-indigo-500 hover:text-indigo-700"><Volume2 size={16} /></button>
                  <button onClick={() => setShowTranslation((p) => ({ ...p, [q.id]: !p[q.id] }))} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">{showTrans ? <EyeOff size={14} /> : <Eye size={14} />}{showTrans ? "번역 숨기기" : "번역 보기"}</button>
                  <button onClick={() => setExpandedId(isExpanded ? null : q.id)} className="ml-auto text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">단어 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                </div>
                {showTrans && <p className="mt-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{q.korean}</p>}
              </div>
              {isExpanded && (
                <div className="border-t bg-gray-50 px-5 py-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">주요 단어</h4>
                  <div className="flex flex-wrap gap-2">
                    {q.vocabularyNotes.map((v, i) => (
                      <div key={i} className="bg-white rounded-lg px-3 py-2 border text-sm">
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
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Newspaper, Volume2, Eye, EyeOff, BookOpen, Loader2, WifiOff, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { newsArticles, NewsArticle } from "@/data/news";
import { speakJapanese } from "@/lib/tts";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";

const allWords = [
  ...n5Words.map((w) => ({ ...w, level: "N5" })),
  ...n4Words.map((w) => ({ ...w, level: "N4" })),
  ...n3Words.map((w) => ({ ...w, level: "N3" })),
  ...n2Words.map((w) => ({ ...w, level: "N2" })),
];

const difficultyMap: Record<string, { label: string; color: string }> = {
  easy: { label: "쉬움", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  medium: { label: "보통", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  hard: { label: "어려움", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const CATEGORIES = ["전체", "국제", "경제", "문화", "스포츠"];

type LiveArticle = {
  id: string;
  title: string;
  summary: string;
  link: string;
  date: string;
  time: string;
  category: string;
  isNew: boolean;
};

function extractVocabulary(text: string) {
  const seen = new Set<string>();
  const result: { word: string; reading: string; meaning: string; level: string }[] = [];
  for (const w of allWords) {
    if (seen.has(w.word)) continue;
    if (text.includes(w.word) && w.word.length >= 2) {
      seen.add(w.word);
      result.push({ word: w.word, reading: w.reading, meaning: w.meaning, level: w.level });
      if (result.length >= 12) break;
    }
  }
  return result;
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<"live" | "saved">("live");

  // Live state
  const [liveArticles, setLiveArticles] = useState<LiveArticle[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLive, setSelectedLive] = useState<LiveArticle | null>(null);
  const [aiTranslation, setAiTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showSummaryKo, setShowSummaryKo] = useState(false);
  const [summaryTranslation, setSummaryTranslation] = useState<string | null>(null);

  // Saved state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showKorean, setShowKorean] = useState(false);
  const [diffFilter, setDiffFilter] = useState("all");

  const fetchLiveNews = useCallback(async (cat: string) => {
    setLiveLoading(true);
    setLiveError(false);
    setSelectedLive(null);
    setAiTranslation(null);
    try {
      const res = await fetch(`/api/news?category=${encodeURIComponent(cat)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.articles?.length > 0) {
        setLiveArticles(data.articles);
      } else {
        throw new Error("empty");
      }
    } catch {
      setLiveError(true);
      setLiveArticles([]);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNews(selectedCategory);
  }, [selectedCategory, fetchLiveNews]);

  const handleAiTranslate = async (text: string, setter: (v: string) => void) => {
    if (translating) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setter(data.translation ?? "번역 실패");
    } catch {
      setter("번역에 실패했습니다.");
    } finally {
      setTranslating(false);
    }
  };

  const liveVocabulary = useMemo(() => {
    if (!selectedLive) return [];
    return extractVocabulary(selectedLive.title + " " + selectedLive.summary);
  }, [selectedLive]);

  const filtered = diffFilter === "all" ? newsArticles : newsArticles.filter((a) => a.difficulty === diffFilter);
  const selected = newsArticles.find((a) => a.id === selectedId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 dark:text-zinc-50">
        <Newspaper className="text-indigo-600 dark:text-indigo-400" /> 일본어 뉴스 읽기
      </h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-6">NHK 실시간 뉴스와 학습용 기사로 독해력을 키우세요</p>

      {/* Tab */}
      <div className="flex gap-2 mb-6 border-b dark:border-zinc-700">
        <button
          onClick={() => { setActiveTab("live"); setSelectedId(null); }}
          className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "live" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"}`}
        >
          📡 실시간 NHK 뉴스
          {liveArticles.length > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full">{liveArticles.length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("saved"); setSelectedLive(null); }}
          className={`pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "saved" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"}`}
        >
          📚 학습용 기사
        </button>
      </div>

      {/* ===== LIVE TAB ===== */}
      {activeTab === "live" && (
        <>
          {selectedLive ? (
            /* 기사 상세 */
            <div>
              <button
                onClick={() => { setSelectedLive(null); setAiTranslation(null); setShowSummaryKo(false); setSummaryTranslation(null); }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-4 block"
              >← 목록으로</button>

              <div className="bg-white border rounded-2xl p-6 dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs rounded-full font-bold">NHK</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs rounded-full">{selectedLive.category}</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 text-xs rounded-full">N2~N3 수준</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto flex items-center gap-1">
                    <Clock size={11} /> {selectedLive.date} {selectedLive.time}
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-4 dark:text-zinc-50 leading-relaxed">{selectedLive.title}</h2>

                {/* 제목 TTS */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button onClick={() => speakJapanese(selectedLive.title)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-sm flex items-center gap-1">
                    <Volume2 size={14} /> 제목 듣기
                  </button>
                  <button
                    onClick={() => setShowSummaryKo(!showSummaryKo)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300 rounded-lg text-sm flex items-center gap-1"
                  >
                    {showSummaryKo ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSummaryKo ? "번역 숨기기" : "번역 보기"}
                  </button>
                  {showSummaryKo && !summaryTranslation && (
                    <button
                      onClick={() => handleAiTranslate(selectedLive.title + "\n" + selectedLive.summary, setSummaryTranslation)}
                      disabled={translating}
                      className="px-3 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {translating ? <Loader2 size={14} className="animate-spin" /> : "✨"}
                      {translating ? "번역 중..." : "AI 번역"}
                    </button>
                  )}
                  <a
                    href={selectedLive.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-zinc-600"
                  >
                    <ExternalLink size={14} /> NHK 원문
                  </a>
                </div>

                {/* 요약 본문 */}
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">기사 요약</span>
                    <button onClick={() => speakJapanese(selectedLive.summary)} className="text-indigo-400 hover:text-indigo-600 ml-auto">
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="text-base leading-relaxed dark:text-zinc-100">{selectedLive.summary}</p>
                </div>

                {/* AI 번역 */}
                {showSummaryKo && summaryTranslation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-500 dark:text-blue-400">AI 번역</span>
                      <button onClick={() => setSummaryTranslation(null)} className="text-xs text-gray-400">✕</button>
                    </div>
                    <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed whitespace-pre-line">{summaryTranslation}</p>
                  </div>
                )}

                {/* 주요 단어 */}
                {liveVocabulary.length > 0 && (
                  <div className="border-t dark:border-zinc-700 pt-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-zinc-200">
                      <BookOpen size={16} /> 주요 단어 <span className="text-xs font-normal text-gray-400">(자동 추출)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {liveVocabulary.map((v, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 text-sm">
                          <button onClick={() => speakJapanese(v.word)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                            <Volume2 size={12} />
                            <span className="font-bold">{v.word}</span>
                            <span className="text-[10px] px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">{v.level}</span>
                          </button>
                          <p className="text-gray-400 dark:text-zinc-500 text-xs">{v.reading}</p>
                          <p className="text-gray-600 dark:text-zinc-300">{v.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 기사 목록 */
            <>
              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => fetchLiveNews(selectedCategory)}
                  className="ml-auto p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                  title="새로고침"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {liveLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl p-5 animate-pulse">
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mb-2" />
                      <div className="h-4 w-full bg-gray-100 dark:bg-zinc-700/50 rounded mb-1" />
                      <div className="h-4 w-2/3 bg-gray-100 dark:bg-zinc-700/50 rounded" />
                    </div>
                  ))}
                </div>
              ) : liveError ? (
                <div className="text-center py-16 text-gray-400 dark:text-zinc-500">
                  <WifiOff size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-2">뉴스를 불러오지 못했습니다</p>
                  <p className="text-sm mb-4">잠시 후 다시 시도해주세요</p>
                  <button
                    onClick={() => fetchLiveNews(selectedCategory)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw size={14} /> 다시 시도
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {liveArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => { setSelectedLive(article); setAiTranslation(null); setShowSummaryKo(false); setSummaryTranslation(null); }}
                      className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-indigo-500"
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs rounded-full font-bold">NHK</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs rounded-full">{article.category}</span>
                        {article.isNew && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">NEW</span>}
                        <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto flex items-center gap-1">
                          <Clock size={11} /> {article.time || article.date}
                        </span>
                      </div>
                      <h3 className="text-base font-bold mb-1 dark:text-zinc-100 leading-snug">{article.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{article.summary}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ===== SAVED TAB ===== */}
      {activeTab === "saved" && (
        <>
          <div className="flex gap-2 mb-6">
            {[{ key: "all", label: "전체" }, { key: "easy", label: "쉬움" }, { key: "medium", label: "보통" }, { key: "hard", label: "어려움" }].map((f) => (
              <button
                key={f.key}
                onClick={() => setDiffFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${diffFilter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!selected ? (
            <div className="grid gap-3">
              {filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => { setSelectedId(article.id); setShowKorean(false); }}
                  className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-indigo-500"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${difficultyMap[article.difficulty].color}`}>{difficultyMap[article.difficulty].label}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full dark:bg-zinc-700 dark:text-zinc-400">{article.category}</span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">{article.date}</span>
                  </div>
                  <h3 className="text-lg font-bold dark:text-zinc-100">{article.title}</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{article.titleReading}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 line-clamp-2">{article.content.slice(0, 60)}...</p>
                </button>
              ))}
            </div>
          ) : (
            <SavedArticleDetail
              article={selected}
              showKorean={showKorean}
              setShowKorean={setShowKorean}
              onBack={() => { setSelectedId(null); setShowKorean(false); }}
            />
          )}
        </>
      )}
    </div>
  );
}

function SavedArticleDetail({ article, showKorean, setShowKorean, onBack }: {
  article: NewsArticle;
  showKorean: boolean;
  setShowKorean: (v: boolean) => void;
  onBack: () => void;
}) {
  const dm: Record<string, { label: string; color: string }> = {
    easy: { label: "쉬움", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
    medium: { label: "보통", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
    hard: { label: "어려움", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  };

  return (
    <div>
      <button onClick={onBack} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-4 block">← 목록으로</button>
      <div className="bg-white border rounded-2xl p-6 dark:bg-zinc-800 dark:border-zinc-700">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${dm[article.difficulty]?.color}`}>{dm[article.difficulty]?.label}</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full dark:bg-zinc-700 dark:text-zinc-400">{article.category}</span>
        </div>
        <h2 className="text-2xl font-bold mb-1 dark:text-zinc-50">{article.title}</h2>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6">{article.titleReading}</p>
        <div className="flex gap-2 mb-4">
          <button onClick={() => speakJapanese(article.content)} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-sm flex items-center gap-1">
            <Volume2 size={14} /> 전체 듣기
          </button>
          <button onClick={() => setShowKorean(!showKorean)} className="px-3 py-1.5 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300 rounded-lg text-sm flex items-center gap-1">
            {showKorean ? <EyeOff size={14} /> : <Eye size={14} />}
            {showKorean ? "한국어 숨기기" : "한국어 보기"}
          </button>
        </div>
        <div className="text-lg leading-relaxed mb-4 whitespace-pre-line dark:text-zinc-100">{article.content}</div>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{article.contentReading}</p>
        {showKorean && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 mb-4">{article.korean}</div>
        )}
        <div className="border-t dark:border-zinc-700 pt-4">
          <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-zinc-200"><BookOpen size={16} /> 주요 단어</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {article.vocabularyList.map((v, i) => (
              <div key={i} className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 text-sm">
                <button onClick={() => speakJapanese(v.word)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
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
  );
}

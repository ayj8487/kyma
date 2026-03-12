"use client";

import { useState, useMemo, useEffect } from "react";
import { n5Words } from "@/data/words";
import { Word } from "@/types";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;
const STORAGE_KEY = "kyma-admin-custom-words";

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const PARTS_OF_SPEECH = ["명사", "동사", "형용사", "부사", "접속사", "조사", "감동사"];

interface WordFormData {
  word: string;
  reading: string;
  meaning: string;
  jlptLevel: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleReading: string;
  exampleMeaning: string;
}

const emptyForm: WordFormData = {
  word: "",
  reading: "",
  meaning: "",
  jlptLevel: "N5",
  partOfSpeech: "명사",
  exampleSentence: "",
  exampleReading: "",
  exampleMeaning: "",
};

export default function AdminWordsPage() {
  const [customWords, setCustomWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJlpt, setFilterJlpt] = useState("");
  const [filterPos, setFilterPos] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [formData, setFormData] = useState<WordFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load custom words from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomWords(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save custom words to localStorage
  const saveCustomWords = (words: Word[]) => {
    setCustomWords(words);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  };

  // Combine imported and custom words
  const allWords = useMemo(
    () => [...n5Words, ...customWords],
    [customWords]
  );

  // Filter and search
  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      const matchesSearch =
        !searchQuery ||
        word.word.includes(searchQuery) ||
        word.reading.includes(searchQuery) ||
        word.meaning.includes(searchQuery);
      const matchesJlpt = !filterJlpt || word.jlptLevel === filterJlpt;
      const matchesPos = !filterPos || word.partOfSpeech === filterPos;
      return matchesSearch && matchesJlpt && matchesPos;
    });
  }, [allWords, searchQuery, filterJlpt, filterPos]);

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterJlpt, filterPos]);

  // Form handlers
  const openAddForm = () => {
    setEditingWord(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (word: Word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      reading: word.reading,
      meaning: word.meaning,
      jlptLevel: word.jlptLevel,
      partOfSpeech: word.partOfSpeech,
      exampleSentence: word.exampleSentence || "",
      exampleReading: word.exampleReading || "",
      exampleMeaning: word.exampleMeaning || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingWord(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word || !formData.reading || !formData.meaning) return;

    if (editingWord) {
      // Check if it's a custom word (editable) or imported (not directly editable)
      const isCustom = customWords.some((w) => w.id === editingWord.id);
      if (isCustom) {
        const updated = customWords.map((w) =>
          w.id === editingWord.id
            ? {
                ...w,
                ...formData,
                exampleSentence: formData.exampleSentence || undefined,
                exampleReading: formData.exampleReading || undefined,
                exampleMeaning: formData.exampleMeaning || undefined,
              }
            : w
        );
        saveCustomWords(updated);
      } else {
        // For imported words, create a custom override
        const overrideWord: Word = {
          id: `custom-${Date.now()}`,
          ...formData,
          exampleSentence: formData.exampleSentence || undefined,
          exampleReading: formData.exampleReading || undefined,
          exampleMeaning: formData.exampleMeaning || undefined,
        };
        saveCustomWords([...customWords, overrideWord]);
      }
    } else {
      // Add new word
      const newWord: Word = {
        id: `custom-${Date.now()}`,
        ...formData,
        exampleSentence: formData.exampleSentence || undefined,
        exampleReading: formData.exampleReading || undefined,
        exampleMeaning: formData.exampleMeaning || undefined,
      };
      saveCustomWords([...customWords, newWord]);
    }

    closeForm();
  };

  const handleDelete = (wordId: string) => {
    const isCustom = customWords.some((w) => w.id === wordId);
    if (isCustom) {
      saveCustomWords(customWords.filter((w) => w.id !== wordId));
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-accent-indigo dark:text-warm-400">
            단어 관리
          </h1>
          <p className="mt-1 text-sm text-warm-500">
            전체 {filteredWords.length}개 단어
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-sakura-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sakura-600"
        >
          <Plus size={16} />
          단어 추가
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm dark:border-warm-300 dark:bg-[#1a1a2e]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-accent-indigo dark:text-warm-400">
              {editingWord ? "단어 수정" : "새 단어 추가"}
            </h2>
            <button
              onClick={closeForm}
              className="rounded-lg p-1 text-warm-500 hover:bg-warm-100 dark:hover:bg-warm-200"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  단어 *
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) =>
                    setFormData({ ...formData, word: e.target.value })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: 食べる"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  읽기 *
                </label>
                <input
                  type="text"
                  value={formData.reading}
                  onChange={(e) =>
                    setFormData({ ...formData, reading: e.target.value })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: たべる"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  의미 *
                </label>
                <input
                  type="text"
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: 먹다"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  JLPT 레벨
                </label>
                <select
                  value={formData.jlptLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, jlptLevel: e.target.value })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                >
                  {JLPT_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  품사
                </label>
                <select
                  value={formData.partOfSpeech}
                  onChange={(e) =>
                    setFormData({ ...formData, partOfSpeech: e.target.value })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                >
                  {PARTS_OF_SPEECH.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  예문
                </label>
                <input
                  type="text"
                  value={formData.exampleSentence}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exampleSentence: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: ご飯を食べます。"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  예문 읽기
                </label>
                <input
                  type="text"
                  value={formData.exampleReading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exampleReading: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: ごはんをたべます。"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-warm-600 dark:text-warm-400">
                  예문 의미
                </label>
                <input
                  type="text"
                  value={formData.exampleMeaning}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exampleMeaning: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#0f0f1a] dark:text-warm-400"
                  placeholder="例: 밥을 먹습니다."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-sakura-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sakura-600"
              >
                {editingWord ? "수정하기" : "추가하기"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-warm-200 px-4 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-100 dark:border-warm-300 dark:text-warm-400 dark:hover:bg-warm-200"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="단어, 읽기, 의미로 검색..."
            className="w-full rounded-lg border border-warm-200 py-2 pl-9 pr-3 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#1a1a2e] dark:text-warm-400"
          />
        </div>
        <select
          value={filterJlpt}
          onChange={(e) => setFilterJlpt(e.target.value)}
          className="rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#1a1a2e] dark:text-warm-400"
        >
          <option value="">전체 JLPT</option>
          {JLPT_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select
          value={filterPos}
          onChange={(e) => setFilterPos(e.target.value)}
          className="rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400 dark:border-warm-300 dark:bg-[#1a1a2e] dark:text-warm-400"
        >
          <option value="">전체 품사</option>
          {PARTS_OF_SPEECH.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-warm-200 bg-white shadow-sm dark:border-warm-300 dark:bg-[#1a1a2e]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50 dark:border-warm-300 dark:bg-[#0f0f1a]">
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                단어
              </th>
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                읽기
              </th>
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                의미
              </th>
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                JLPT
              </th>
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                품사
              </th>
              <th className="px-4 py-3 font-semibold text-warm-600 dark:text-warm-400">
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedWords.map((word) => {
              const isCustom = word.id.startsWith("custom-");
              return (
                <tr
                  key={word.id}
                  className="border-b border-warm-100 transition-colors hover:bg-warm-50 dark:border-warm-300 dark:hover:bg-[#0f0f1a]"
                >
                  <td className="px-4 py-3 font-medium text-accent-indigo dark:text-warm-400">
                    {word.word}
                    {isCustom && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                        커스텀
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-warm-600 dark:text-warm-500">
                    {word.reading}
                  </td>
                  <td className="px-4 py-3 text-warm-600 dark:text-warm-500">
                    {word.meaning}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sakura-50 px-2.5 py-0.5 text-xs font-medium text-sakura-600 dark:bg-sakura-100 dark:text-sakura-500">
                      {word.jlptLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-warm-600 dark:text-warm-500">
                    {word.partOfSpeech}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(word)}
                        className="rounded-lg p-1.5 text-warm-500 transition-colors hover:bg-warm-100 hover:text-blue-500 dark:hover:bg-warm-200"
                        title="수정"
                      >
                        <Pencil size={15} />
                      </button>
                      {isCustom && (
                        <>
                          {deleteConfirm === word.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(word.id)}
                                className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-lg border border-warm-200 px-2 py-1 text-xs text-warm-600 hover:bg-warm-100 dark:border-warm-300 dark:text-warm-400"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(word.id)}
                              className="rounded-lg p-1.5 text-warm-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-warm-200"
                              title="삭제"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedWords.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-warm-500"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-500">
            {filteredWords.length}개 중{" "}
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredWords.length)}개 표시
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-warm-500 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-warm-200"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, idx, arr) => (
                <span key={page} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-warm-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-sakura-500 text-white"
                        : "text-warm-600 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-200"
                    }`}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg p-2 text-warm-500 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-warm-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

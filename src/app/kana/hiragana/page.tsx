"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { hiraganaData, kanaRows } from "@/data/kana";
import { speakJapanese } from "@/lib/tts";
import { KanaCharacter } from "@/types";
import { ArrowLeft, Volume2, X } from "lucide-react";

type CategoryTab = "gojuon" | "dakuon" | "handakuon";

const categoryLabels: Record<CategoryTab, string> = {
  gojuon: "청음 (清音)",
  dakuon: "탁음 (濁音)",
  handakuon: "반탁음 (半濁音)",
};

const dakuonRows = [
  { id: "ga", label: "が행", vowels: ["ga", "gi", "gu", "ge", "go"] },
  { id: "za", label: "ざ행", vowels: ["za", "ji", "zu", "ze", "zo"] },
  { id: "da", label: "だ행", vowels: ["da", "dji", "dzu", "de", "do"] },
  { id: "ba", label: "ば행", vowels: ["ba", "bi", "bu", "be", "bo"] },
];

const handakuonRows = [
  { id: "pa", label: "ぱ행", vowels: ["pa", "pi", "pu", "pe", "po"] },
];

export default function HiraganaPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("gojuon");
  const [selectedChar, setSelectedChar] = useState<KanaCharacter | null>(null);

  const filteredData = hiraganaData.filter((k) => k.category === activeTab);

  const getRows = useCallback(() => {
    switch (activeTab) {
      case "gojuon":
        return kanaRows;
      case "dakuon":
        return dakuonRows;
      case "handakuon":
        return handakuonRows;
    }
  }, [activeTab]);

  const getCharForCell = useCallback(
    (romaji: string) => {
      return filteredData.find((k) => k.romaji === romaji) || null;
    },
    [filteredData]
  );

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = (char: KanaCharacter) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setSelectedChar(char);
    }, 500);
  };

  const handlePointerUp = (char: KanaCharacter) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      speakJapanese(char.character);
    }
  };

  const handlePointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakJapanese(text);
  };

  const rows = getRows();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/kana"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            가나 학습
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            히라가나
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            히라가나 문자표 - 클릭하면 발음, 길게 누르면 상세 정보
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          {(Object.entries(categoryLabels) as [CategoryTab, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Column Headers */}
        <div className="mb-2 grid grid-cols-6 gap-2 px-1">
          <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500" />
          {["a", "i", "u", "e", "o"].map((v) => (
            <div
              key={v}
              className="text-center text-xs font-medium uppercase text-gray-400 dark:text-gray-500"
            >
              {v}
            </div>
          ))}
        </div>

        {/* Kana Grid */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-6 gap-2">
              {/* Row label */}
              <div className="flex items-center justify-center rounded-xl bg-gray-100 px-2 py-3 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {row.label}
              </div>
              {/* Characters */}
              {row.vowels.map((romaji, idx) => {
                const char = romaji ? getCharForCell(romaji) : null;
                if (!romaji) {
                  return (
                    <div
                      key={`${row.id}-empty-${idx}`}
                      className="rounded-xl bg-gray-50 dark:bg-gray-900/50"
                    />
                  );
                }
                if (!char) {
                  return (
                    <div
                      key={`${row.id}-${romaji}`}
                      className="rounded-xl bg-gray-50 dark:bg-gray-900/50"
                    />
                  );
                }
                return (
                  <button
                    key={char.id}
                    onPointerDown={() => handlePointerDown(char)}
                    onPointerUp={() => handlePointerUp(char)}
                    onPointerLeave={handlePointerLeave}
                    onContextMenu={(e) => e.preventDefault()}
                    className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-2 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 active:translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:shadow-blue-900/20"
                  >
                    <span className="text-2xl font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-3xl">
                      {char.character}
                    </span>
                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {char.romaji}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedChar && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedChar(null)}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedChar(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Character display */}
              <div className="mb-6 text-center">
                <div className="mb-4 text-8xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedChar.character}
                </div>
                <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  {selectedChar.romaji}
                </div>
              </div>

              {/* Info */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    행 (Row)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedChar.row}행
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    카테고리
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {categoryLabels[selectedChar.category as CategoryTab] ||
                      selectedChar.category}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    획수
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedChar.strokeCount}획
                  </span>
                </div>
              </div>

              {/* TTS Button */}
              <button
                onClick={() => handleSpeak(selectedChar.character)}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
              >
                <Volume2 className="h-5 w-5" />
                발음 듣기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

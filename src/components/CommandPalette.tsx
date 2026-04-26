"use client";

import { useState, useEffect, useRef, useMemo, ReactNode, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  BookOpen,
  GraduationCap,
  BookText,
  FileQuestion,
  RotateCcw,
  Keyboard,
  Bot,
  Newspaper,
  Film,
  BarChart3,
  Target,
  Bookmark,
  Camera,
  LogIn,
  UserPlus,
  Sparkles,
  PencilLine,
  MessageCircle,
  Hash,
  X,
  CornerDownLeft,
  Command,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  /** Optional secondary text shown next to label */
  hint?: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Extra search keywords (e.g. romaji, English aliases) */
  keywords?: string[];
}

const ITEMS: MenuItem[] = [
  // 메인
  { id: "dashboard", label: "대시보드", category: "메인", href: "/dashboard", icon: Home, keywords: ["dashboard", "home", "홈", "메인"] },

  // 카나
  { id: "kana", label: "가나", category: "학습", href: "/kana", icon: BookOpen, keywords: ["kana", "가나"] },
  { id: "hiragana", label: "히라가나", category: "학습 · 가나", href: "/kana/hiragana", icon: BookOpen, keywords: ["hiragana", "히라가나", "あいうえお"] },
  { id: "katakana", label: "가타카나", category: "학습 · 가나", href: "/kana/katakana", icon: BookOpen, keywords: ["katakana", "가타카나", "アイウエオ"] },
  { id: "kana-quiz", label: "가나 퀴즈", category: "학습 · 가나", href: "/kana/quiz", icon: FileQuestion, keywords: ["kana quiz"] },

  // 단어
  { id: "words", label: "단어", category: "학습", href: "/words", icon: GraduationCap, keywords: ["words", "단어", "vocab"] },
  { id: "words-n5", label: "단어 N5", category: "학습 · 단어", href: "/words/N5", icon: GraduationCap, keywords: ["n5", "엔파이브"] },
  { id: "words-n4", label: "단어 N4", category: "학습 · 단어", href: "/words/N4", icon: GraduationCap, keywords: ["n4"] },
  { id: "words-n3", label: "단어 N3", category: "학습 · 단어", href: "/words/N3", icon: GraduationCap, keywords: ["n3"] },
  { id: "words-n2", label: "단어 N2", category: "학습 · 단어", href: "/words/N2", icon: GraduationCap, keywords: ["n2"] },
  { id: "words-n1", label: "단어 N1", category: "학습 · 단어", href: "/words/N1", icon: GraduationCap, keywords: ["n1"] },
  { id: "words-flash", label: "단어 플래시카드", category: "학습 · 단어", href: "/words/flashcard", icon: Sparkles, keywords: ["flashcard", "플래시", "카드"] },

  // 문법
  { id: "grammar", label: "문법", category: "학습", href: "/grammar", icon: BookText, keywords: ["grammar", "문법"] },
  { id: "grammar-n5", label: "문법 N5", category: "학습 · 문법", href: "/grammar/N5", icon: BookText, keywords: ["n5"] },
  { id: "grammar-n4", label: "문법 N4", category: "학습 · 문법", href: "/grammar/N4", icon: BookText, keywords: ["n4"] },
  { id: "grammar-n3", label: "문법 N3", category: "학습 · 문법", href: "/grammar/N3", icon: BookText, keywords: ["n3"] },
  { id: "grammar-n2", label: "문법 N2", category: "학습 · 문법", href: "/grammar/N2", icon: BookText, keywords: ["n2"] },
  { id: "grammar-flash", label: "문법 플래시카드", category: "학습 · 문법", href: "/grammar/flashcard", icon: Sparkles, keywords: ["flashcard"] },

  // 퀴즈
  { id: "quiz", label: "퀴즈", category: "학습", href: "/quiz", icon: FileQuestion, keywords: ["quiz", "퀴즈"] },
  { id: "quiz-kana", label: "카나 퀴즈", category: "학습 · 퀴즈", href: "/quiz/kana", icon: FileQuestion, keywords: ["kana quiz"] },
  { id: "quiz-word", label: "단어 퀴즈", category: "학습 · 퀴즈", href: "/quiz/word", icon: FileQuestion, keywords: ["word quiz"] },
  { id: "quiz-grammar", label: "문법 퀴즈", category: "학습 · 퀴즈", href: "/quiz/grammar", icon: FileQuestion, keywords: ["grammar quiz"] },

  // 복습 / 타자
  { id: "review", label: "복습", hint: "SRS", category: "학습", href: "/review", icon: RotateCcw, keywords: ["review", "srs", "spaced repetition", "복습"] },
  { id: "typing", label: "타자 연습", category: "학습", href: "/typing", icon: Keyboard, keywords: ["typing", "타자", "타이핑"] },

  // AI
  { id: "ai", label: "AI", category: "도구", href: "/ai", icon: Bot, keywords: ["ai", "인공지능"] },
  { id: "ai-conv", label: "AI 회화", category: "도구 · AI", href: "/ai/conversation", icon: MessageCircle, keywords: ["conversation", "대화", "회화", "chat"] },
  { id: "ai-correct", label: "AI 문법 교정", category: "도구 · AI", href: "/ai/correction", icon: PencilLine, keywords: ["correction", "교정", "첨삭"] },

  // 컨텐츠
  { id: "news", label: "뉴스", category: "콘텐츠", href: "/news", icon: Newspaper, keywords: ["news", "뉴스", "nhk"] },
  { id: "anime", label: "애니 명언", category: "콘텐츠", href: "/anime", icon: Film, keywords: ["anime", "애니", "명언"] },

  // 통계 / 도구
  { id: "progress", label: "진행도", category: "통계", href: "/progress", icon: BarChart3, keywords: ["progress", "진행", "통계"] },
  { id: "goals", label: "학습 목표", category: "통계", href: "/goals", icon: Target, keywords: ["goal", "목표", "streak", "연속"] },
  { id: "bookmarks", label: "단어장", category: "통계", href: "/bookmarks", icon: Bookmark, keywords: ["bookmark", "북마크", "저장"] },
  { id: "camera", label: "카메라 OCR", category: "도구", href: "/camera", icon: Camera, keywords: ["camera", "카메라", "ocr", "사진"] },

  // 계정
  { id: "login", label: "로그인", category: "계정", href: "/login", icon: LogIn, keywords: ["login", "로그인", "signin"] },
  { id: "register", label: "회원가입", category: "계정", href: "/register", icon: UserPlus, keywords: ["register", "회원가입", "signup"] },
];

// ─── Context ────────────────────────────────────────────────────────────
interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: () => {},
  close: () => {},
  toggle: () => {},
  isOpen: false,
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

// ─── Provider ───────────────────────────────────────────────────────────
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((p) => !p);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, close, toggle, isOpen }}>
      {children}
      {isOpen && <CommandPaletteModal onClose={close} />}
    </CommandPaletteContext.Provider>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────
function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter items by query (label + keywords + category)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((item) => {
      const haystack = [item.label, item.category, ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  // Auto-focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const navigate = (item: MenuItem) => {
    onClose();
    router.push(item.href);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) navigate(item);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[15vh] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 px-4">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKey}
            placeholder="메뉴 검색... (가나, 단어, N5, AI 회화 등)"
            className="flex-1 bg-transparent py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
              <Hash size={32} className="mx-auto mb-2 opacity-30" />
              검색 결과가 없습니다
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  data-index={idx}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? "bg-pink-50 dark:bg-pink-950/30"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300"
                        : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {item.hint}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-400 dark:text-zinc-500">
                      {item.category}
                    </p>
                  </div>
                  {isActive && (
                    <CornerDownLeft size={14} className="shrink-0 text-pink-400" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 px-4 py-2.5 text-[11px] text-gray-400 dark:text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1 py-px text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">↑↓</kbd>
              이동
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1 py-px text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">↵</kbd>
              선택
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-white px-1 py-px text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">esc</kbd>
              닫기
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={11} /> + K
          </span>
        </div>
      </div>
    </div>
  );
}

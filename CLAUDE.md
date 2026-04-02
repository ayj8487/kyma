# CLAUDE.md - Kyma Project Guide

## Project Overview

Kyma (きょうま) is a Japanese learning web app for Korean speakers. Built with Next.js 16 App Router, it covers kana, vocabulary (JLPT N5-N2), grammar, quizzes, AI conversation, anime quote learning, and more.

- **Repo**: https://github.com/ayj8487/kyma
- **Deployment**: Vercel (auto-deploy on push to `master`)
- **Database**: PostgreSQL on Neon
- **AI**: Groq (Llama 3.3 70B) for conversation practice

## Quick Start

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # prisma generate + migrate deploy + next build
npm run lint     # ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 with sakura (pink) color theme + dark mode
- **State**: Zustand 5 with `persist` middleware → localStorage (`kyma-study-store`)
- **Database**: PostgreSQL (Neon) via Prisma ORM 7.4
- **AI**: Vercel AI SDK + @ai-sdk/groq (Llama 3.3 70B)
- **Icons**: lucide-react
- **Charts**: recharts
- **OCR**: tesseract.js
- **Font**: Jua (Korean) + Noto Sans JP (Japanese)

## Environment Variables

```
DATABASE_URL=          # PostgreSQL connection string (Neon)
POSTGRES_PRISMA_URL=   # Prisma-specific PostgreSQL URL
GROQ_API_KEY=          # Groq API key for AI chat
```

## Project Structure

```
src/
├── app/                    # Pages (App Router)
│   ├── api/                # API routes (ai/chat, kana, words, quiz, progress)
│   ├── kana/               # Hiragana & Katakana learning
│   ├── words/[level]/      # JLPT level word lists + flashcards
│   ├── grammar/[level]/    # Grammar points + flashcards
│   ├── quiz/[type]/        # Quizzes (kana/word/grammar with level selection)
│   ├── review/             # SRS spaced repetition review
│   ├── ai/conversation/    # AI conversation practice (Groq)
│   ├── ai/correction/      # Grammar correction engine
│   ├── anime/              # Anime quote learning
│   ├── bookmarks/          # Saved items (단어장)
│   ├── dashboard/          # Main dashboard with daily quotes
│   └── ...                 # typing, news, camera, progress, goals
├── components/layout/      # Navbar
├── data/                   # Static learning data (kana, words, grammar, anime quotes)
├── lib/                    # Utilities (auth, correction, prisma, tts, utils)
├── store/useStudyStore.ts  # Zustand store (SRS, bookmarks, progress, streaks)
├── types/                  # TypeScript interfaces
└── middleware.ts           # Admin route blocking
```

## Key Architecture Decisions

### Dual Storage
- **Client-side (primary)**: Zustand store persisted to localStorage handles all learning progress, SRS data, bookmarks, quiz history, streaks, and goals. This is the primary data source for all learning features.
- **Server-side**: PostgreSQL via Prisma stores user accounts and word data. Currently not synced with client-side progress.

### SRS Algorithm
Uses SM-2 spaced repetition in `useStudyStore.ts`:
- Quality scale 0-5
- Ease factor: `max(1.3, oldEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))`
- Interval resets on quality < 3, otherwise multiplies by ease factor

### Static Data
Learning content (kana, words, grammar, anime quotes) is stored as TypeScript arrays in `src/data/`. Word data spans N5-N2 across 4 files. Grammar has 1266 lines covering N5-N2.

## Common Patterns

### Adding TTS to a page
```tsx
import { speakJapanese } from "@/lib/tts";
// Usage: speakJapanese(word.word) or onClick={() => speakJapanese(text)}
```

### Using bookmarks
```tsx
const { toggleBookmark, isBookmarked } = useStudyStore();
// toggleBookmark("word", word.id)
// isBookmarked("word", word.id) → boolean
// Bookmark types: "word" | "kana" | "grammar" | "anime"
```

### Dark mode classes
All pages must include `dark:` variants for Tailwind classes. Common patterns:
- `bg-white dark:bg-zinc-800`
- `border dark:border-zinc-700`
- `text-gray-600 dark:text-zinc-400`
- `bg-gray-50 dark:bg-zinc-900`
- `bg-gray-100 dark:bg-zinc-800` (for buttons/badges)

### Word data imports
```tsx
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
const allWords = [...n5Words, ...n4Words, ...n3Words, ...n2Words];
```

## Conventions

- **UI Language**: Korean (한국어) for all user-facing text
- **Naming**: "단어장" (not "북마크") for bookmark/saved items feature
- **Color theme**: Sakura pink (#f06f90) as primary accent
- **Component style**: `"use client"` directive for interactive pages; no separate component files — page-level components are self-contained
- **Data format**: Word IDs use `w-{n}`, grammar IDs use `g-{level}-{n}`, anime quote IDs use `aq-{n}`, kana IDs use `h-{romaji}` / `k-{romaji}`
- **Commit style**: Korean commit messages describing the change

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/chat` | POST | AI conversation (Groq Llama 3.3 70B) |
| `/api/words` | GET | Word search with filters & pagination |
| `/api/words/daily` | GET | Daily word selection (date-seeded) |
| `/api/kana` | GET | Kana character data |
| `/api/quiz` | GET | Quiz question generation |
| `/api/quiz/submit` | POST | Quiz answer grading |
| `/api/progress` | GET | Progress info endpoint |

## Prisma Models

User, Word, KanaCharacter, UserProgress (SRS), QuizAttempt, Bookmark.
Schema at `prisma/schema.prisma`. Run `npx prisma studio` to inspect.

## Things to Watch Out For

- When adding new word levels, update ALL consumers: `words/[level]`, `bookmarks`, `review`, `quiz/[type]`, flashcard pages
- The Navbar has `navLinks` (main) and `moreLinks` (dropdown) arrays — add new pages to the appropriate one
- All pages need dark mode support — check both light and dark appearances
- `middleware.ts` blocks all `/admin/*` routes
- The build script runs Prisma migrations — ensure `DATABASE_URL` is set in Vercel env vars
- Static data files in `src/data/` are the source of truth for learning content, not the database

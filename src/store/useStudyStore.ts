"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressEntry {
  contentType: string;
  contentId: string;
  status: "new" | "learning" | "mastered";
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string | null;
  // SRS fields
  easeFactor: number;
  interval: number;
  nextReviewAt: string | null;
}

interface QuizRecord {
  date: string;
  type: string;
  totalQuestions: number;
  correctAnswers: number;
}

interface StudyStore {
  progress: Record<string, ProgressEntry>;
  quizHistory: QuizRecord[];
  streakCount: number;
  lastStudyDate: string | null;
  totalPoints: number;
  todayStudyCount: number;
  todayDate: string | null;

  // Bookmarks
  bookmarks: string[];

  // Goals
  dailyGoal: number;
  weeklyGoal: number;

  // Study history for goals calendar
  studyHistory: Record<string, number>;

  updateProgress: (contentType: string, contentId: string, isCorrect: boolean) => void;
  addQuizRecord: (record: Omit<QuizRecord, "date">) => void;
  getProgressByType: (contentType: string) => ProgressEntry[];
  getMasteredCount: (contentType: string) => number;
  getLearningCount: (contentType: string) => number;
  getCorrectRate: () => number;
  incrementStudyCount: () => void;

  // Bookmark methods
  toggleBookmark: (contentType: string, contentId: string) => void;
  isBookmarked: (contentType: string, contentId: string) => boolean;
  getBookmarks: () => string[];

  // Goal methods
  setDailyGoal: (goal: number) => void;
  setWeeklyGoal: (goal: number) => void;

  // SRS methods
  updateSRS: (contentType: string, contentId: string, quality: number) => void;
  getDueItems: () => ProgressEntry[];
  getWrongItems: () => ProgressEntry[];

  // Reset
  resetAllProgress: () => void;
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      progress: {},
      quizHistory: [],
      streakCount: 0,
      lastStudyDate: null,
      totalPoints: 0,
      todayStudyCount: 0,
      todayDate: null,
      bookmarks: [],
      dailyGoal: 10,
      weeklyGoal: 50,
      studyHistory: {},

      updateProgress: (contentType, contentId, isCorrect) => {
        const key = `${contentType}:${contentId}`;
        const current = get().progress[key];
        const correctCount = (current?.correctCount || 0) + (isCorrect ? 1 : 0);
        const incorrectCount = (current?.incorrectCount || 0) + (isCorrect ? 0 : 1);

        let status: "new" | "learning" | "mastered" = "learning";
        if (correctCount >= 5 && correctCount / (correctCount + incorrectCount) >= 0.8) {
          status = "mastered";
        }

        set((state) => ({
          progress: {
            ...state.progress,
            [key]: {
              contentType,
              contentId,
              status,
              correctCount,
              incorrectCount,
              lastReviewedAt: new Date().toISOString(),
              easeFactor: current?.easeFactor || 2.5,
              interval: current?.interval || 1,
              nextReviewAt: current?.nextReviewAt || null,
            },
          },
          totalPoints: state.totalPoints + (isCorrect ? 10 : 1),
        }));
      },

      addQuizRecord: (record) => {
        const today = getToday();
        set((state) => {
          let newStreak = state.streakCount;
          if (state.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];
            newStreak = state.lastStudyDate === yesterdayStr ? state.streakCount + 1 : 1;
          }

          return {
            quizHistory: [...state.quizHistory, { ...record, date: today }],
            streakCount: newStreak,
            lastStudyDate: today,
          };
        });
      },

      getProgressByType: (contentType) => {
        return Object.values(get().progress).filter((p) => p.contentType === contentType);
      },

      getMasteredCount: (contentType) => {
        return Object.values(get().progress).filter(
          (p) => p.contentType === contentType && p.status === "mastered"
        ).length;
      },

      getLearningCount: (contentType) => {
        return Object.values(get().progress).filter(
          (p) => p.contentType === contentType && p.status === "learning"
        ).length;
      },

      getCorrectRate: () => {
        const entries = Object.values(get().progress);
        if (entries.length === 0) return 0;
        const totalCorrect = entries.reduce((sum, e) => sum + e.correctCount, 0);
        const totalAttempts = entries.reduce((sum, e) => sum + e.correctCount + e.incorrectCount, 0);
        return totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
      },

      incrementStudyCount: () => {
        const today = getToday();
        set((state) => ({
          todayStudyCount: state.todayDate === today ? state.todayStudyCount + 1 : 1,
          todayDate: today,
          studyHistory: {
            ...state.studyHistory,
            [today]: (state.studyHistory[today] || 0) + 1,
          },
        }));
      },

      // Bookmark methods
      toggleBookmark: (contentType, contentId) => {
        const key = `${contentType}:${contentId}`;
        set((state) => {
          const exists = state.bookmarks.includes(key);
          return {
            bookmarks: exists
              ? state.bookmarks.filter((b) => b !== key)
              : [...state.bookmarks, key],
          };
        });
      },

      isBookmarked: (contentType, contentId) => {
        const key = `${contentType}:${contentId}`;
        return get().bookmarks.includes(key);
      },

      getBookmarks: () => {
        return get().bookmarks;
      },

      // Goal methods
      setDailyGoal: (goal) => {
        set({ dailyGoal: goal, weeklyGoal: goal * 7 });
      },

      setWeeklyGoal: (goal) => {
        set({ weeklyGoal: goal });
      },

      // SRS methods (SM-2 algorithm)
      updateSRS: (contentType, contentId, quality) => {
        const key = `${contentType}:${contentId}`;
        const current = get().progress[key];
        if (!current) return;

        const oldEF = current.easeFactor || 2.5;
        const oldInterval = current.interval || 1;

        // SM-2 ease factor calculation
        const newEF = Math.max(
          1.3,
          oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        let newInterval: number;
        if (quality >= 3) {
          if (oldInterval === 1) {
            newInterval = 1;
          } else if (oldInterval === 2) {
            newInterval = 6;
          } else {
            newInterval = Math.round(oldInterval * newEF);
          }
        } else {
          newInterval = 1; // reset on failure
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + newInterval);

        set((state) => ({
          progress: {
            ...state.progress,
            [key]: {
              ...current,
              easeFactor: newEF,
              interval: newInterval,
              nextReviewAt: nextDate.toISOString(),
              lastReviewedAt: new Date().toISOString(),
              correctCount: quality >= 3 ? current.correctCount + 1 : current.correctCount,
              incorrectCount: quality < 3 ? current.incorrectCount + 1 : current.incorrectCount,
            },
          },
        }));
      },

      getDueItems: () => {
        const now = new Date().toISOString();
        return Object.values(get().progress).filter(
          (p) =>
            p.status === "learning" &&
            (!p.nextReviewAt || p.nextReviewAt <= now)
        );
      },

      getWrongItems: () => {
        return Object.values(get().progress).filter(
          (p) => p.incorrectCount > p.correctCount
        );
      },

      resetAllProgress: () => {
        set({
          progress: {},
          quizHistory: [],
          streakCount: 0,
          lastStudyDate: null,
          totalPoints: 0,
          todayStudyCount: 0,
          todayDate: null,
          bookmarks: [],
          studyHistory: {},
        });
      },
    }),
    { name: "kyma-study-store" }
  )
);

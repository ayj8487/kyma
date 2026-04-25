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

type SyncStatus = "idle" | "syncing" | "success" | "error";

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

  // Sync metadata (not persisted to server, only local UI state)
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  lastSyncError: string | null;

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

  // Sync methods
  pushToServer: () => Promise<{ success: boolean; error?: string }>;
  pullFromServer: () => Promise<{ success: boolean; error?: string }>;
  applyServerData: (data: Partial<SyncableState>) => void;
  setSyncStatus: (status: SyncStatus, error?: string | null) => void;

  // Reset
  resetAllProgress: () => void;
}

/** Subset of state that gets pushed to /api/sync. */
export interface SyncableState {
  progress: Record<string, ProgressEntry>;
  quizHistory: QuizRecord[];
  streakCount: number;
  lastStudyDate: string | null;
  totalPoints: number;
  todayStudyCount: number;
  todayDate: string | null;
  bookmarks: string[];
  dailyGoal: number;
  weeklyGoal: number;
  studyHistory: Record<string, number>;
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

      syncStatus: "idle",
      lastSyncedAt: null,
      lastSyncError: null,

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

      // Sync ----------------------------------------------------------------
      setSyncStatus: (status, error = null) => {
        set({
          syncStatus: status,
          lastSyncError: status === "error" ? error : null,
          ...(status === "success" ? { lastSyncedAt: new Date().toISOString() } : {}),
        });
      },

      applyServerData: (data) => {
        set((state) => ({
          progress: data.progress ?? state.progress,
          quizHistory: data.quizHistory ?? state.quizHistory,
          streakCount: data.streakCount ?? state.streakCount,
          lastStudyDate: data.lastStudyDate ?? state.lastStudyDate,
          totalPoints: data.totalPoints ?? state.totalPoints,
          todayStudyCount: data.todayStudyCount ?? state.todayStudyCount,
          todayDate: data.todayDate ?? state.todayDate,
          bookmarks: data.bookmarks ?? state.bookmarks,
          dailyGoal: data.dailyGoal ?? state.dailyGoal,
          weeklyGoal: data.weeklyGoal ?? state.weeklyGoal,
          studyHistory: data.studyHistory ?? state.studyHistory,
        }));
      },

      pushToServer: async () => {
        const state = get();
        const userData: SyncableState = {
          progress: state.progress,
          quizHistory: state.quizHistory,
          streakCount: state.streakCount,
          lastStudyDate: state.lastStudyDate,
          totalPoints: state.totalPoints,
          todayStudyCount: state.todayStudyCount,
          todayDate: state.todayDate,
          bookmarks: state.bookmarks,
          dailyGoal: state.dailyGoal,
          weeklyGoal: state.weeklyGoal,
          studyHistory: state.studyHistory,
        };

        set({ syncStatus: "syncing", lastSyncError: null });
        try {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userData,
              totals: {
                totalPoints: state.totalPoints,
                streakCount: state.streakCount,
                lastStudyDate: state.lastStudyDate,
              },
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ syncStatus: "error", lastSyncError: data.error || "동기화 실패" });
            return { success: false, error: data.error };
          }
          set({
            syncStatus: "success",
            lastSyncedAt: data.syncedAt || new Date().toISOString(),
            lastSyncError: null,
          });
          return { success: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "네트워크 오류";
          set({ syncStatus: "error", lastSyncError: msg });
          return { success: false, error: msg };
        }
      },

      pullFromServer: async () => {
        set({ syncStatus: "syncing", lastSyncError: null });
        try {
          const res = await fetch("/api/sync", { cache: "no-store" });
          const data = await res.json();
          if (!res.ok) {
            set({ syncStatus: "error", lastSyncError: data.error || "불러오기 실패" });
            return { success: false, error: data.error };
          }
          const serverData = (data.userData ?? {}) as Partial<SyncableState>;
          // Only apply if server actually has data; otherwise keep local.
          if (serverData && Object.keys(serverData).length > 0) {
            get().applyServerData(serverData);
          }
          set({
            syncStatus: "success",
            lastSyncedAt: data.syncedAt || new Date().toISOString(),
            lastSyncError: null,
          });
          return { success: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "네트워크 오류";
          set({ syncStatus: "error", lastSyncError: msg });
          return { success: false, error: msg };
        }
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
          syncStatus: "idle",
          lastSyncedAt: null,
          lastSyncError: null,
        });
      },
    }),
    {
      name: "kyma-study-store",
      // Don't persist transient sync UI state to localStorage.
      partialize: (state) => {
        const persisted = { ...state } as Partial<StudyStore>;
        delete persisted.syncStatus;
        delete persisted.lastSyncError;
        return persisted;
      },
    }
  )
);

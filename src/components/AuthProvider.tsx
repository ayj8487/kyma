"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { fetchCurrentUser, type AuthUser, getCachedUser } from "@/lib/auth";
import { useStudyStore } from "@/store/useStudyStore";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  setUser: () => {},
  refresh: async () => {},
});

const AUTO_PUSH_DEBOUNCE_MS = 4000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [isLoading, setIsLoading] = useState(true);
  const lastPulledForUserId = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async () => {
    const u = await fetchCurrentUser();
    setUser(u);
    setIsLoading(false);
  };

  // Initial session check (run once on mount).
  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  // When user logs in for the first time this session, pull server state.
  useEffect(() => {
    if (!user) {
      lastPulledForUserId.current = null;
      return;
    }
    if (lastPulledForUserId.current === user.id) return;

    lastPulledForUserId.current = user.id;
    useStudyStore
      .getState()
      .pullFromServer()
      .catch((err) => console.error("[AuthProvider] pull failed", err));
  }, [user]);

  // Auto-push to server (debounced) whenever persisted state changes while logged in.
  useEffect(() => {
    if (!user) return;

    const unsubscribe = useStudyStore.subscribe((state, prev) => {
      // Only react to meaningful changes (not transient sync flags themselves).
      if (
        state.progress === prev.progress &&
        state.bookmarks === prev.bookmarks &&
        state.quizHistory === prev.quizHistory &&
        state.studyHistory === prev.studyHistory &&
        state.totalPoints === prev.totalPoints &&
        state.streakCount === prev.streakCount &&
        state.dailyGoal === prev.dailyGoal &&
        state.todayStudyCount === prev.todayStudyCount
      ) {
        return;
      }

      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        useStudyStore
          .getState()
          .pushToServer()
          .catch((err) => console.error("[AuthProvider] push failed", err));
      }, AUTO_PUSH_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

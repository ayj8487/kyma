/**
 * Client-side auth helpers — talk to /api/auth/* endpoints.
 * Session is held in an HTTP-only cookie set by the server, so we cache the
 * resolved user in localStorage purely as a UX hint (Navbar render before
 * /api/auth/me resolves). The cookie is the source of truth.
 */

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

const SESSION_CACHE_KEY = "kyma-session";

function setCachedUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_CACHE_KEY);
  }
}

export function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  code: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "회원가입에 실패했습니다." };
    }
    setCachedUser(data.user);
    return { success: true, user: data.user };
  } catch (err) {
    console.error("[auth.register]", err);
    return { success: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function sendVerificationCode(
  email: string
): Promise<{ success: boolean; error?: string; devMode?: boolean }> {
  try {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "인증 코드 발송에 실패했습니다." };
    }
    return { success: true, devMode: data.devMode === true };
  } catch (err) {
    console.error("[auth.sendVerificationCode]", err);
    return { success: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "로그인에 실패했습니다." };
    }
    setCachedUser(data.user);
    return { success: true, user: data.user };
  } catch (err) {
    console.error("[auth.login]", err);
    return { success: false, error: "네트워크 오류가 발생했습니다." };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("[auth.logout]", err);
  } finally {
    setCachedUser(null);
  }
}

/**
 * Validate the current session against the server.
 * Returns the canonical AuthUser if logged in, otherwise null.
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) {
      setCachedUser(null);
      return null;
    }
    const data = await res.json();
    if (!data.user) {
      setCachedUser(null);
      return null;
    }
    const u: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
    };
    setCachedUser(u);
    return u;
  } catch (err) {
    console.error("[auth.fetchCurrentUser]", err);
    return null;
  }
}

/** @deprecated Use fetchCurrentUser() for the authoritative answer. */
export function getCurrentUser(): AuthUser | null {
  return getCachedUser();
}

export function isLoggedIn(): boolean {
  return getCachedUser() !== null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const USERS_KEY = "kyma-users";
const SESSION_KEY = "kyma-session";

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function register(
  name: string,
  email: string,
  password: string
): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();

  if (users.some((u) => u.email === email)) {
    return { success: false, error: "이미 등록된 이메일입니다." };
  }

  const newUser: StoredUser = {
    id: generateId(),
    name,
    email,
    password,
    role: "user",
  };

  users.push(newUser);
  saveStoredUsers(users);

  const authUser: AuthUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));

  return { success: true, user: authUser };
}

export function login(
  email: string,
  password: string
): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const found = users.find((u) => u.email === email && u.password === password);

  if (!found) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const authUser: AuthUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));

  return { success: true, user: authUser };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

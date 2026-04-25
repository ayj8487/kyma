import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth-server";

/**
 * Read the session cookie and return the userId, or null if not authenticated.
 * Use in Route Handlers / Server Components.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jlptLevel: true,
        totalPoints: true,
        streakCount: true,
        lastStudyDate: true,
        syncedAt: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}

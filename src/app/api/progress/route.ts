import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Progress is stored client-side using localStorage (Zustand persist)",
    schema: {
      progress: "Record<string, { contentType, contentId, status, correctCount, incorrectCount, easeFactor, interval, nextReviewAt }>",
      quizHistory: "Array<{ date, type, totalQuestions, correctAnswers }>",
      streakCount: "number",
      totalPoints: "number",
      bookmarks: "string[]",
      dailyGoal: "number",
    },
    note: "In production, this would be connected to a PostgreSQL database via Prisma ORM.",
  });
}

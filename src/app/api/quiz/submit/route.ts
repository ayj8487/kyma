import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "answers array required" }, { status: 400 });
    }

    const results = answers.map((a: { questionId: string; selectedAnswer: string; correctAnswer: string }) => ({
      questionId: a.questionId,
      isCorrect: a.selectedAnswer === a.correctAnswer,
    }));

    const correct = results.filter((r: { isCorrect: boolean }) => r.isCorrect).length;

    return NextResponse.json({
      score: correct,
      total: results.length,
      accuracy: results.length > 0 ? Math.round((correct / results.length) * 100) : 0,
      results,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

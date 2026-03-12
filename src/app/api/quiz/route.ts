import { NextRequest, NextResponse } from "next/server";
import { hiraganaData } from "@/data/kana";
import { n5Words } from "@/data/words";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const count = parseInt(searchParams.get("count") || "10");

    if (!type || !["kana", "word"].includes(type)) {
      return NextResponse.json({ error: "type parameter required (kana or word)" }, { status: 400 });
    }

    const questions = [];

    if (type === "kana") {
      const pool = hiraganaData.filter((k) => k.category === "gojuon");
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      for (const item of shuffled) {
        const wrongOptions = pool.filter((k) => k.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3).map((k) => k.romaji);
        const options = [item.romaji, ...wrongOptions].sort(() => Math.random() - 0.5);
        questions.push({ id: item.id, type: "multiple_choice", question: item.character, options, correctAnswer: item.romaji, contentType: "kana" });
      }
    } else {
      const shuffled = [...n5Words].sort(() => Math.random() - 0.5).slice(0, count);
      for (const item of shuffled) {
        const wrongOptions = n5Words.filter((w) => w.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.meaning);
        const options = [item.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
        questions.push({ id: item.id, type: "multiple_choice", question: item.word, options, correctAnswer: item.meaning, contentType: "word" });
      }
    }

    return NextResponse.json({ questions, total: questions.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

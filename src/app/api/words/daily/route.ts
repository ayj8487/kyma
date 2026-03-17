import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);

    const allWords = await prisma.word.findMany({
      where: { jlptLevel: "N5" },
    });

    const shuffled = [...allWords].sort((a, b) => {
      const ha = (seed * a.id.charCodeAt(2)) % 100;
      const hb = (seed * b.id.charCodeAt(2)) % 100;
      return ha - hb;
    });
    const daily = shuffled.slice(0, 5);
    return NextResponse.json({ date: today, words: daily });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

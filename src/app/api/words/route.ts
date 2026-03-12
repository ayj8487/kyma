import { NextRequest, NextResponse } from "next/server";
import { n5Words } from "@/data/words";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jlptLevel = searchParams.get("jlpt_level");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const pos = searchParams.get("pos");

    let data = [...n5Words];
    if (jlptLevel) data = data.filter((w) => w.jlptLevel === jlptLevel);
    if (pos) data = data.filter((w) => w.partOfSpeech === pos);
    if (search) data = data.filter((w) => w.word.includes(search) || w.reading.includes(search) || w.meaning.includes(search));

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);

    return NextResponse.json({ data: paged, total, page, totalPages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jlptLevel = searchParams.get("jlpt_level");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const pos = searchParams.get("pos");

    const where: Record<string, unknown> = {};
    if (jlptLevel) where.jlptLevel = jlptLevel;
    if (pos) where.partOfSpeech = pos;
    if (search) {
      where.OR = [
        { word: { contains: search } },
        { reading: { contains: search } },
        { meaning: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.word.findMany({
        where,
        orderBy: { orderIndex: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.word.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ data, total, page, totalPages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

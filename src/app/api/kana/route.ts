import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    if (!type || !["hiragana", "katakana"].includes(type)) {
      return NextResponse.json({ error: "type parameter required (hiragana or katakana)" }, { status: 400 });
    }

    const where: Record<string, string> = { type };
    if (category) where.category = category;

    const data = await prisma.kanaCharacter.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ data, total: data.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

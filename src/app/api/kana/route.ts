import { NextRequest, NextResponse } from "next/server";
import { hiraganaData, katakanaData } from "@/data/kana";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    if (!type || !["hiragana", "katakana"].includes(type)) {
      return NextResponse.json({ error: "type parameter required (hiragana or katakana)" }, { status: 400 });
    }

    let data = type === "hiragana" ? hiraganaData : katakanaData;
    if (category) data = data.filter((k) => k.category === category);

    return NextResponse.json({ data, total: data.length });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

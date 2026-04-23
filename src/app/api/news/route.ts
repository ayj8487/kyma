import { NextRequest } from "next/server";
import { XMLParser } from "fast-xml-parser";

// NHK RSS categories
const NHK_RSS_FEEDS = [
  { url: "https://www3.nhk.or.jp/rss/news/cat0.xml", category: "전체" },
  { url: "https://www3.nhk.or.jp/rss/news/cat6.xml", category: "국제" },
  { url: "https://www3.nhk.or.jp/rss/news/cat3.xml", category: "경제" },
  { url: "https://www3.nhk.or.jp/rss/news/cat5.xml", category: "문화" },
  { url: "https://www3.nhk.or.jp/rss/news/cat4.xml", category: "스포츠" },
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/rss+xml, application/xml, text/xml, */*",
};

function extractNewsId(link: string): string {
  // e.g. http://www3.nhk.or.jp/news/html/20260424/k10015106881000.html
  const m = link.match(/\/([a-z][0-9a-z]+)\.(html|json)$/i);
  return m ? m[1] : link;
}

function formatDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  } catch {
    return pubDate;
  }
}

function formatTime(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "전체";

  const feed = NHK_RSS_FEEDS.find((f) => f.category === category) ?? NHK_RSS_FEEDS[0];

  try {
    const res = await fetch(feed.url, {
      headers: HEADERS,
      next: { revalidate: 900 }, // 15분 캐시
    });

    if (!res.ok) {
      return Response.json({ error: `RSS fetch failed: ${res.status}` }, { status: 502 });
    }

    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true });
    const result = parser.parse(xml);

    const items: Record<string, string>[] = result?.rss?.channel?.item ?? [];
    const channelTitle: string = result?.rss?.channel?.title ?? "NHKニュース";

    const articles = (Array.isArray(items) ? items : [items]).map((item) => ({
      id: extractNewsId(item.link ?? item.guid ?? ""),
      title: item.title ?? "",
      summary: item.description ?? "",
      link: item.link ?? item.guid ?? "",
      date: formatDate(item.pubDate ?? ""),
      time: formatTime(item.pubDate ?? ""),
      category: feed.category,
      isNew: String(item["nhknews:new"]) === "true",
    }));

    return Response.json({
      channelTitle,
      category: feed.category,
      articles,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("NHK RSS error:", err);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

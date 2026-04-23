import { NextRequest } from "next/server";

const NHK_EASY = "https://www3.nhk.or.jp/news/easy";
const HEADERS = {
  "Referer": "https://www3.nhk.or.jp/news/easy/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
};

// Strip <ruby> tags: keep base text only
function stripRuby(text: string): string {
  return text
    .replace(/<ruby>/g, "")
    .replace(/<\/ruby>/g, "")
    .replace(/<rt>.*?<\/rt>/g, "")
    .replace(/<rp>.*?<\/rp>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// Extract reading from ruby-annotated text
function extractReading(text: string): string {
  const parts: string[] = [];
  const regex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>|([^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf<]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) parts.push(match[2]); // reading
    else if (match[3]) parts.push(match[3].replace(/<[^>]+>/g, "").trim());
  }
  return parts.join("").trim();
}

// Map NHK category codes to Korean labels
const CATEGORY_MAP: Record<string, string> = {
  "00": "사회",
  "01": "정치",
  "02": "국제",
  "03": "경제",
  "04": "스포츠",
  "05": "문화·엔터",
  "06": "과학·기술",
  "07": "건강",
  "": "일반",
};

function formatDate(dateStr: string): string {
  // NHK format: "20260424120000" or "20260424"
  const d = dateStr.replace(/\D/g, "").slice(0, 8);
  if (d.length < 8) return dateStr;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("id");

  try {
    if (articleId) {
      // Fetch individual article
      const res = await fetch(`${NHK_EASY}/${articleId}/${articleId}.json`, {
        headers: HEADERS,
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        return Response.json({ error: "Article not found" }, { status: 404 });
      }

      const data = await res.json();

      return Response.json({
        news_id: data.news_id || articleId,
        title: stripRuby(data.title_with_ruby || data.title || ""),
        titleReading: extractReading(data.title_with_ruby || ""),
        content: stripRuby(data.body_with_ruby || data.body || ""),
        contentWithRuby: data.body_with_ruby || data.body || "",
        date: formatDate(data.news_pub_date || data.news_prearranged_time || ""),
        category: CATEGORY_MAP[data.top_category_id || data.category || ""] || "일반",
        imageUrl: data.has_news_easy_image === "1"
          ? `${NHK_EASY}/${articleId}/${articleId}.jpg`
          : null,
        voiceUrl: data.has_news_easy_voice === "1"
          ? `${NHK_EASY}/${articleId}/${articleId}.mp3`
          : null,
      });
    }

    // Fetch article list
    const res = await fetch(`${NHK_EASY}/top-list-default.json`, {
      headers: HEADERS,
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return Response.json({ error: "Failed to fetch news list", status: res.status }, { status: 502 });
    }

    const data = await res.json();

    // Handle different possible structures
    let items: Record<string, string>[] = [];
    if (Array.isArray(data?.channel?.item)) {
      items = data.channel.item;
    } else if (Array.isArray(data?.news_list?.news)) {
      items = data.news_list.news;
    } else if (Array.isArray(data)) {
      items = data;
    } else {
      // Try to find any array in the response
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          items = data[key];
          break;
        }
      }
    }

    const articles = items.slice(0, 20).map((item) => ({
      news_id: item.news_id || item.id || "",
      title: stripRuby(item.title_with_ruby || item.title || ""),
      titleReading: extractReading(item.title_with_ruby || ""),
      date: formatDate(item.news_pub_date || item.news_prearranged_time || item.outdate_tmp || ""),
      category: CATEGORY_MAP[item.top_category_id || item.category || ""] || "일반",
      hasImage: item.has_news_easy_image === "1",
      hasVoice: item.has_news_easy_voice === "1",
    }));

    return Response.json({ articles });
  } catch (err) {
    console.error("NHK news API error:", err);
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

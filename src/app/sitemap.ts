import type { MetadataRoute } from "next";

const BASE = "https://kymanova.com";
const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/dashboard`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/kana`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/kana/hiragana`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/kana/katakana`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/kana/quiz`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/words`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/words/flashcard`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/grammar`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/grammar/flashcard`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/quiz`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/quiz/kana`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/quiz/word`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/quiz/grammar`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/review`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/typing`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/ai`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai/conversation`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ai/correction`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/news`, lastModified, changeFrequency: "hourly", priority: 0.7 },
    { url: `${BASE}/anime`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/progress`, lastModified, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/goals`, lastModified, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/bookmarks`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/camera`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/register`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const wordLevelPages: MetadataRoute.Sitemap = JLPT_LEVELS.map((lv) => ({
    url: `${BASE}/words/${lv}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const grammarLevelPages: MetadataRoute.Sitemap = JLPT_LEVELS.slice(0, 4).map((lv) => ({
    url: `${BASE}/grammar/${lv}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...wordLevelPages, ...grammarLevelPages];
}

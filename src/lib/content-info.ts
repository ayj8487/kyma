import { hiraganaData, katakanaData } from "@/data/kana";
import { n5Words } from "@/data/words";
import { n4Words } from "@/data/words-n4";
import { n3Words } from "@/data/words-n3";
import { n2Words } from "@/data/words-n2";
import { n1Words } from "@/data/words-n1";
import { grammarPoints } from "@/data/grammar";

const allWords = [...n5Words, ...n4Words, ...n3Words, ...n2Words, ...n1Words];

export interface ContentInfo {
  display: string;
  sub: string;
  label: string;
  speak: string;
}

/**
 * Resolve a (contentType, contentId) pair from progress/bookmarks back to the
 * original learning item (kana / word / grammar) for display.
 *
 * Returns null when the referenced item no longer exists in the static data
 * (e.g. after data updates).
 */
export function getContentInfo(
  contentType: string,
  contentId: string
): ContentInfo | null {
  if (contentType === "hiragana") {
    const kana = hiraganaData.find((k) => k.id === contentId);
    return kana
      ? { display: kana.character, sub: kana.romaji, label: "히라가나", speak: kana.character }
      : null;
  }
  if (contentType === "katakana") {
    const kana = katakanaData.find((k) => k.id === contentId);
    return kana
      ? { display: kana.character, sub: kana.romaji, label: "가타카나", speak: kana.character }
      : null;
  }
  if (contentType === "kana") {
    // 퀴즈에서 "kana" 타입으로 저장됨 — ID 접두사로 히라가나/가타카나 구분
    const hKana = hiraganaData.find((k) => k.id === contentId);
    if (hKana)
      return { display: hKana.character, sub: hKana.romaji, label: "히라가나", speak: hKana.character };
    const kKana = katakanaData.find((k) => k.id === contentId);
    if (kKana)
      return { display: kKana.character, sub: kKana.romaji, label: "가타카나", speak: kKana.character };
    return null;
  }
  if (contentType === "word") {
    const word = allWords.find((w) => w.id === contentId);
    return word
      ? {
          display: word.word,
          sub: `${word.reading} - ${word.meaning}`,
          label: "단어",
          speak: word.word,
        }
      : null;
  }
  if (contentType === "grammar") {
    const grammar = grammarPoints.find((g) => g.id === contentId);
    return grammar
      ? { display: grammar.pattern, sub: grammar.meaning, label: "문법", speak: grammar.pattern }
      : null;
  }
  return null;
}

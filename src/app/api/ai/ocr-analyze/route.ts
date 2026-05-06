import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const WordSchema = z.object({
  word: z.string().describe("일본어 단어 또는 표현 (한자/카나)"),
  reading: z.string().describe("히라가나 읽기 (없으면 단어 그대로)"),
  meaning: z.string().describe("한국어 뜻"),
  level: z
    .enum(["N5", "N4", "N3", "N2", "N1"])
    .nullable()
    .describe("JLPT 레벨 추정 (불확실하면 null)"),
});

const OcrAnalyzeSchema = z.object({
  cleanedText: z
    .string()
    .describe("OCR 결과를 자연스럽게 정리한 일본어 (오인식 글자 보정)"),
  translation: z
    .string()
    .describe("정리된 일본어 텍스트의 자연스러운 한국어 번역"),
  words: z
    .array(WordSchema)
    .describe("텍스트 내 주요 단어/표현 (3~10개, 학습자에게 유용한 것 우선)"),
  isJapanese: z
    .boolean()
    .describe("입력이 일본어로 인식되는지 여부"),
});

const SYSTEM_PROMPT = `당신은 일본어→한국어 번역 + 단어 분석 전문가입니다.
한국인 학습자가 카메라로 촬영한 일본어 텍스트(OCR 결과)를 받아 분석합니다.

# 작업
1. OCR 오인식이 있으면 문맥상 자연스럽게 정정한 \`cleanedText\` 생성
2. \`cleanedText\`를 자연스러운 한국어로 번역 (\`translation\`)
3. 텍스트 내 주요 단어/표현 3~10개 추출 (\`words\`)
   - 학습자에게 유용한 단어 위주 (조사/조동사 같은 것은 제외)
   - 한자 단어, 동사, 명사, 형용사, 관용 표현 우선
4. 입력이 일본어가 맞는지 (\`isJapanese\`) 판단

# 절대 규칙
- 입력 텍스트와 무관한 내용을 절대 생성하지 마세요
- 모든 한국어 설명은 자연스러운 구어체로
- words의 reading은 반드시 히라가나로 (가타카나 단어는 가타카나 그대로)
- 입력이 일본어가 아니면 isJapanese: false, translation: "[번역 불가: 일본어가 아닙니다]"

# 예시
입력 OCR: "今日は天気がいい"
→ cleanedText: "今日は天気がいい"
→ translation: "오늘은 날씨가 좋다"
→ words: [
    { word: "今日", reading: "きょう", meaning: "오늘", level: "N5" },
    { word: "天気", reading: "てんき", meaning: "날씨", level: "N5" },
    { word: "いい", reading: "いい", meaning: "좋다", level: "N5" }
  ]
→ isJapanese: true

입력 OCR: "学校に行きます"  (학교에 갑니다)
→ cleanedText: "学校に行きます"
→ translation: "학교에 갑니다"
→ words: [
    { word: "学校", reading: "がっこう", meaning: "학교", level: "N5" },
    { word: "行く", reading: "いく", meaning: "가다", level: "N5" }
  ]`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return Response.json({ error: "No text provided" }, { status: 400 });
  }

  // Cap input length to avoid runaway costs / latency
  const trimmed = text.length > 1000 ? text.slice(0, 1000) : text;

  try {
    const result = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: OcrAnalyzeSchema,
      system: SYSTEM_PROMPT,
      prompt: `다음 OCR 결과를 분석해주세요:\n"""\n${trimmed}\n"""`,
      temperature: 0.1,
      maxRetries: 1,
    });
    return Response.json(result.object);
  } catch (err) {
    console.error("OCR analyze error:", err);
    // Fallback to llama-3.3
    try {
      const fallback = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: OcrAnalyzeSchema,
        system: SYSTEM_PROMPT,
        prompt: `다음 OCR 결과를 분석해주세요:\n${trimmed}`,
        temperature: 0.1,
        maxRetries: 1,
      });
      return Response.json(fallback.object);
    } catch (fallbackErr) {
      console.error("Fallback OCR analyze error:", fallbackErr);
      return Response.json({ error: "OCR analyze failed" }, { status: 500 });
    }
  }
}

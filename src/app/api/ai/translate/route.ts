import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// Zod schema enforces structured output — model can't return arbitrary text.
const TranslationSchema = z.object({
  translation: z
    .string()
    .describe("자연스러운 한국어 번역 (구어체)"),
  nuance: z
    .string()
    .nullable()
    .describe("뉘앙스나 문화적 맥락 한 줄 설명. 없으면 null"),
});

const SYSTEM_PROMPT = `당신은 일본어→한국어 전문 번역가입니다.

# 절대 규칙
1. 입력된 일본어 문장의 의미를 정확히 한국어로 번역하세요.
2. 입력 텍스트와 무관한 내용을 절대 생성하지 마세요.
3. 입력이 인사말이면 인사말로, 질문이면 질문으로 번역하세요.
4. 직역이 아닌 자연스러운 한국어 구어체로 번역하세요.
5. 일본어 텍스트가 아닌 입력이 들어오면 "[번역 불가: 일본어가 아님]"을 translation으로 반환하세요.

# 좋은 번역 예시
- "こんにちは" → translation: "안녕하세요", nuance: null
- "今日は天気がいいですね" → translation: "오늘 날씨가 좋네요", nuance: "동의를 구하는 가벼운 인사"
- "お疲れ様でした" → translation: "수고하셨습니다", nuance: "일이나 활동을 마친 사람에게 건네는 인사"
- "頑張ってください" → translation: "힘내세요", nuance: "응원하는 표현"
- "すみません" → translation: "죄송합니다", nuance: "사과 또는 가벼운 양해를 구할 때"

# 잘못된 응답 (절대 하지 마세요)
- 입력과 무관한 번역
- 입력 문장을 영어로 번역하기
- 임의의 한국어 문장 생성
- 빈 응답`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { text } = await req.json();

  if (!text?.trim()) {
    return Response.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const result = await generateObject({
      // gpt-oss-120b is OpenAI's open-weights model on Groq —
      // significantly better at structured multilingual translation than llama-3.3.
      model: groq("openai/gpt-oss-120b"),
      schema: TranslationSchema,
      system: SYSTEM_PROMPT,
      prompt: `다음 일본어 텍스트를 정확히 한국어로 번역해주세요. 입력 텍스트의 의미만 번역하고 임의의 내용을 추가하지 마세요.

일본어 입력:
"""
${text}
"""`,
      temperature: 0.1, // low for consistency
      maxRetries: 1,
    });

    return Response.json(result.object);
  } catch (err) {
    console.error("Translation error:", err);
    // Fallback: try with a simpler model if the primary one fails
    try {
      const fallback = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: TranslationSchema,
        system: SYSTEM_PROMPT,
        prompt: `다음 일본어를 한국어로 번역해주세요:\n${text}`,
        temperature: 0.1,
        maxRetries: 1,
      });
      return Response.json(fallback.object);
    } catch (fallbackErr) {
      console.error("Fallback translation error:", fallbackErr);
      return Response.json({ error: "Translation failed" }, { status: 500 });
    }
  }
}

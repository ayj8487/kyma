import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { text } = await req.json();

  if (!text?.trim()) {
    return Response.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `당신은 일본어 전문 번역가입니다. 주어진 일본어 텍스트를 자연스러운 한국어로 번역하세요.
규칙:
- 반드시 JSON 형식으로만 응답하세요
- 번역만 포함하고, 설명이나 주석을 추가하지 마세요
- 문어체가 아닌 구어체로 자연스럽게 번역하세요
응답 형식: {"translation": "한국어 번역", "nuance": "뉘앙스 한 줄 설명 (선택)"}`,
      messages: [{ role: "user", content: `다음 일본어를 번역해주세요:\n${text}` }],
      maxRetries: 1,
    });

    try {
      const parsed = JSON.parse(result.text);
      return Response.json(parsed);
    } catch {
      return Response.json({ translation: result.text, nuance: null });
    }
  } catch (err) {
    console.error("Translation error:", err);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}

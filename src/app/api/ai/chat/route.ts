import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 30;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Groq API key is not configured", { status: 500 });
  }

  const { messages, level = "beginner" } = await req.json();

  const levelGuide: Record<string, string> = {
    beginner:
      "JLPT N5-N4 수준의 간단한 문장을 사용하세요. 기본 문법과 일상적인 단어만 사용합니다.",
    intermediate:
      "JLPT N3-N2 수준의 문장을 사용하세요. 복합문과 다양한 표현을 사용합니다.",
    advanced:
      "JLPT N2-N1 수준의 자연스러운 일본어를 사용하세요. 경어, 관용구, 복잡한 문법을 포함합니다.",
  };

  const systemPrompt = `あなたは親切な日本語の先生です。韓国人の学生と日本語で会話の練習をしています。

## ルール
- ${levelGuide[level] || levelGuide.beginner}
- 必ず以下のJSON形式で応答してください。他のテキストは含めないでください。
- 学生が韓国語で話しかけても、日本語で返答してください。
- 学生の日本語に間違いがあれば、正しい表現をcorrectionフィールドに入れてください。間違いがなければcorrectionはnullにしてください。
- 会話を自然に続けてください。質問を混ぜて学生が話す機会を作ってください。

## 応答形式（厳守）
{
  "japanese": "日本語の返答",
  "reading": "ひらがなの読み方",
  "korean": "한국어 번역",
  "correction": null または { "wrong": "学生の間違い", "correct": "正しい表現", "explanation": "한국어로 된 설명" }
}`;

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      maxRetries: 1,
    });

    return new Response(result.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response("AI 응답 생성에 실패했습니다", { status: 500 });
  }
}

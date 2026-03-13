import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
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
\`\`\`json
{
  "japanese": "日本語の返答",
  "reading": "ひらがなの読み方",
  "korean": "한국어 번역",
  "correction": null または { "wrong": "学生の間違い", "correct": "正しい表現", "explanation": "한국어로 된 설명" }
}
\`\`\``;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}

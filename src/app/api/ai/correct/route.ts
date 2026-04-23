import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { sentence } = await req.json();
  if (!sentence?.trim()) {
    return Response.json({ error: "No sentence provided" }, { status: 400 });
  }

  const systemPrompt = `당신은 일본어 문법 교정 전문가입니다. 한국인 학습자가 작성한 일본어 문장을 분석하고 교정해주세요.

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "isCorrect": true/false,
  "corrected": "교정된 문장",
  "corrections": [
    {
      "type": "오류 유형 (조사/시제/어순/동사활용/경어/표현 중 하나)",
      "original": "원문의 오류 부분",
      "corrected": "교정된 부분",
      "explanation": "한국어로 된 오류 설명"
    }
  ],
  "naturalAlternative": "더 자연스러운 표현 (있다면, 없으면 null)",
  "tips": ["학습 팁 1 (한국어)", "학습 팁 2 (한국어)"],
  "level": "이 문장의 난이도 (N5/N4/N3/N2/N1 중 하나)"
}

분석 기준:
- 조사 오류 (が/は/を/に/で/へ/と 등의 잘못된 사용)
- 동사 활용 오류 (て형, た형, 가능형 등)
- 경어 오류 (です/ます体, 겸양어, 존경어)
- 시제 오류
- 어순 오류
- 자연스럽지 않은 표현

문장이 완벽히 올바르면 isCorrect: true, corrections: [] 로 응답하세요.`;

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: [{ role: "user", content: `다음 일본어 문장을 교정해주세요: ${sentence}` }],
      maxRetries: 1,
    });

    try {
      const parsed = JSON.parse(result.text);
      return Response.json(parsed);
    } catch {
      // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: "Parse failed", raw: result.text }, { status: 500 });
    }
  } catch (err) {
    console.error("Correction error:", err);
    return Response.json({ error: "Correction failed" }, { status: 500 });
  }
}

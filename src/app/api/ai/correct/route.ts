import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const CorrectionItemSchema = z.object({
  type: z
    .enum(["조사", "시제", "어순", "동사활용", "경어", "표현"])
    .describe("오류 유형"),
  original: z.string().describe("원문의 오류 부분"),
  corrected: z.string().describe("교정된 부분"),
  explanation: z.string().describe("한국어로 된 오류 설명"),
});

const CorrectionResultSchema = z.object({
  isCorrect: z.boolean().describe("문장이 문법적으로 올바른지 여부"),
  corrected: z.string().describe("교정된 문장 (올바른 경우 원문 그대로)"),
  corrections: z
    .array(CorrectionItemSchema)
    .describe("발견된 오류 목록 (없으면 빈 배열)"),
  naturalAlternative: z
    .string()
    .nullable()
    .describe("더 자연스러운 표현 (선택, 없으면 null)"),
  tips: z.array(z.string()).describe("학습 팁 (한국어, 1~3개)"),
  level: z.enum(["N5", "N4", "N3", "N2", "N1"]).describe("문장 난이도"),
});

const SYSTEM_PROMPT = `당신은 일본어 문법 교정 전문가입니다. 한국인 학습자가 작성한 일본어 문장을 분석하고 교정합니다.

# 절대 규칙
1. 입력된 일본어 문장만 분석하세요. 입력과 무관한 내용을 생성하지 마세요.
2. 문장이 완벽히 올바르면 isCorrect: true, corrections: [] 로 응답하세요.
3. 모든 설명(explanation, tips)은 반드시 **한국어**로 작성하세요.

# 분석 기준
- 조사 오류 (が/は/を/に/で/へ/と 등의 잘못된 사용)
- 동사 활용 오류 (て형, た형, 가능형, 사역형 등)
- 경어 오류 (です/ます체, 겸양어, 존경어)
- 시제 오류 (과거/현재/진행형)
- 어순 오류
- 자연스럽지 않은 표현

# 예시
입력: "私は学生です"
→ isCorrect: true, corrected: "私は学生です", corrections: [], level: "N5"

입력: "私は日本語を勉強したい"
→ isCorrect: true, corrected: "私は日本語を勉強したいです", corrections: [{ type: "표현", original: "勉強したい", corrected: "勉強したいです", explanation: "정중한 표현으로 です를 붙이는 것이 자연스럽습니다" }], level: "N4"`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const { sentence } = await req.json();
  if (!sentence?.trim()) {
    return Response.json({ error: "No sentence provided" }, { status: 400 });
  }

  try {
    const result = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: CorrectionResultSchema,
      system: SYSTEM_PROMPT,
      prompt: `다음 일본어 문장을 분석하고 교정해주세요:\n"""\n${sentence}\n"""`,
      temperature: 0.2,
      maxRetries: 1,
    });
    return Response.json(result.object);
  } catch (err) {
    console.error("Correction error:", err);
    // Fallback to a different model
    try {
      const fallback = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: CorrectionResultSchema,
        system: SYSTEM_PROMPT,
        prompt: `다음 일본어 문장을 분석하고 교정해주세요:\n${sentence}`,
        temperature: 0.2,
        maxRetries: 1,
      });
      return Response.json(fallback.object);
    } catch (fallbackErr) {
      console.error("Fallback correction error:", fallbackErr);
      return Response.json({ error: "Correction failed" }, { status: 500 });
    }
  }
}

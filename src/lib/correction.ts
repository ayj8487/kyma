export interface CorrectionResult {
  original: string;
  corrected: string;
  isCorrect: boolean;
  corrections: { type: string; original: string; corrected: string; explanation: string }[];
  tips: string[];
}

const particleRules: { pattern: RegExp; fix: string; type: string; explanation: string }[] = [
  { pattern: /学校が行/g, fix: "学校に行", type: "조사", explanation: "장소로 이동할 때는 'に'를 사용합니다 ('が' → 'に')" },
  { pattern: /友達を会/g, fix: "友達に会", type: "조사", explanation: "'会う'는 'に'와 함께 사용합니다 ('を' → 'に')" },
  { pattern: /バスが乗/g, fix: "バスに乗", type: "조사", explanation: "탈것에 탈 때는 'に'를 사용합니다 ('が' → 'に')" },
  { pattern: /家を帰/g, fix: "家に帰", type: "조사", explanation: "돌아가는 장소에는 'に'를 사용합니다 ('を' → 'に')" },
  { pattern: /映画が見/g, fix: "映画を見", type: "조사", explanation: "영화를 보다: 목적어에는 'を'를 사용합니다 ('が' → 'を')" },
  { pattern: /日本語が話し/g, fix: "日本語を話し", type: "조사", explanation: "말하다의 대상에는 'を'를 사용합니다 ('が' → 'を')" },
  { pattern: /図書館が勉強/g, fix: "図書館で勉強", type: "조사", explanation: "행동이 이루어지는 장소에는 'で'를 사용합니다 ('が' → 'で')" },
  { pattern: /電車を乗/g, fix: "電車に乗", type: "조사", explanation: "'乗る'는 'に'와 함께 사용합니다 ('を' → 'に')" },
];

export function correctSentence(sentence: string): CorrectionResult {
  const corrections: CorrectionResult["corrections"] = [];
  let corrected = sentence;

  for (const rule of particleRules) {
    if (rule.pattern.test(corrected)) {
      const match = corrected.match(rule.pattern);
      if (match) {
        corrections.push({
          type: rule.type,
          original: match[0],
          corrected: rule.fix,
          explanation: rule.explanation,
        });
      }
      corrected = corrected.replace(rule.pattern, rule.fix);
    }
  }

  // Check for missing です/ます at end
  const politeEndings = /です|ます|ません|ました|ください|ましょう/;
  const casualEndings = /だ|る|た|ない|よ|ね|か$/;
  if (!politeEndings.test(sentence) && !casualEndings.test(sentence) && sentence.length > 3) {
    corrections.push({
      type: "문체",
      original: sentence,
      corrected: sentence,
      explanation: "정중체(です/ます)나 보통체(だ/る)로 문장을 끝내는 것이 자연스럽습니다.",
    });
  }

  const tips: string[] = [];
  if (corrections.some((c) => c.type === "조사")) {
    tips.push("일본어 조사(は/が/を/に/で)는 한국어와 비슷하지만 미묘한 차이가 있습니다.");
    tips.push("장소 이동: に, 행동 장소: で, 대상: を 를 구분하세요.");
  }
  if (corrections.length === 0) {
    tips.push("문법적으로 올바른 문장으로 보입니다!");
    tips.push("더 자연스러운 표현을 위해 일본인 친구에게 확인해 보는 것도 좋습니다.");
  }

  return {
    original: sentence,
    corrected,
    isCorrect: corrections.length === 0,
    corrections,
    tips,
  };
}

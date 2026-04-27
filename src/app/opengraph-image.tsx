import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Kyma · 한국인을 위한 일본어 학습 플랫폼";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Load Korean fonts from Google Fonts at request time so the OG image can
// actually render Hangul (the default Edge runtime fonts can't).
async function loadFont(weight: 400 | 700 | 900): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, {
    headers: {
      // Force the User-Agent that returns woff2 + extracts the font URL clearly.
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((r) => r.text());
  const match = css.match(/src:\s*url\(([^)]+)\)\s+format\('(?:opentype|truetype|woff2)'\)/);
  if (!match) throw new Error("Could not parse Noto Sans KR font URL from CSS");
  const fontUrl = match[1];
  return await fetch(fontUrl).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const [regular, bold, black] = await Promise.all([
    loadFont(400),
    loadFont(700),
    loadFont(900),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #fff5f7 0%, #ffe4ec 35%, #fce7f3 70%, #f9d4e2 100%)",
          padding: "70px 80px",
          position: "relative",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* Decorative blur orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,114,182,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(192,132,252,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 600,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(251,207,232,0.6) 0%, transparent 70%)",
          }}
        />

        {/* Top: Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ec4899",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Kyma
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#9ca3af",
              fontWeight: 400,
              letterSpacing: "0.05em",
            }}
          >
            きょうま
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 22px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.85)",
              border: "1.5px solid #fbcfe8",
              color: "#ec4899",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            일본어 학습 플랫폼
          </div>
        </div>

        {/* Middle: Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#1f2937",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>일본어, 매일매일</span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span
                style={{
                  background: "linear-gradient(90deg, #f472b6, #fb7185)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                즐겁게
              </span>
              <span>배우자</span>
            </span>
          </div>

          <div
            style={{
              fontSize: 30,
              color: "#6b7280",
              lineHeight: 1.5,
              maxWidth: 900,
              fontWeight: 400,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>히라가나·단어·문법부터 AI 회화·NHK 뉴스까지</span>
            <span>한국인을 위한 일본어 학습 허브</span>
          </div>
        </div>

        {/* Bottom: Feature chips + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "1,500+ 단어", color: "#fce7f3" },
              { label: "200+ 문법", color: "#ede9fe" },
              { label: "AI 회화", color: "#fef3c7" },
              { label: "NHK 뉴스", color: "#dbeafe" },
            ].map((chip) => (
              <div
                key={chip.label}
                style={{
                  padding: "14px 24px",
                  borderRadius: 999,
                  background: chip.color,
                  color: "#1f2937",
                  fontSize: 24,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {chip.label}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9ca3af",
              fontWeight: 700,
            }}
          >
            kymanova.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans KR", data: black, weight: 900, style: "normal" },
      ],
    }
  );
}

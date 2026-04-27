import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Kyma · 한국인을 위한 일본어 학습 플랫폼";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          fontFamily: "sans-serif",
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
            background: "radial-gradient(circle, rgba(244,114,182,0.45) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(192,132,252,0.35) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(251,207,232,0.6) 0%, transparent 70%)",
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
              gap: 8,
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.85)",
              border: "1.5px solid #fbcfe8",
              color: "#ec4899",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            🌸 일본어 학습 플랫폼
          </div>
        </div>

        {/* Middle: Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 900,
              color: "#1f2937",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>일본어, 매일매일</span>
            <span>
              <span
                style={{
                  background: "linear-gradient(90deg, #f472b6, #fb7185)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                즐겁게
              </span>{" "}
              배우자
            </span>
          </div>

          <div
            style={{
              fontSize: 30,
              color: "#6b7280",
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            히라가나·단어·문법부터 AI 회화·NHK 뉴스까지
            <br />
            한국인을 위한 일본어 학습 허브
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
              { label: "📚 1,500+ 단어", color: "#fce7f3" },
              { label: "📖 200+ 문법", color: "#ede9fe" },
              { label: "🤖 AI 회화", color: "#fef3c7" },
              { label: "📡 NHK 뉴스", color: "#dbeafe" },
            ].map((chip) => (
              <div
                key={chip.label}
                style={{
                  padding: "14px 24px",
                  borderRadius: 999,
                  background: chip.color,
                  color: "#1f2937",
                  fontSize: 24,
                  fontWeight: 600,
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
              fontWeight: 600,
            }}
          >
            kymanova.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

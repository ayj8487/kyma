import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kyma · 매일매일 일본어",
    short_name: "Kyma",
    description:
      "히라가나·단어·문법부터 AI 회화·NHK 뉴스까지 — 한국인을 위한 일본어 학습 허브",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafafa",
    theme_color: "#f06f90",
    lang: "ko",
    categories: ["education", "books"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

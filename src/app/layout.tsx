import type { Metadata } from "next";
import { Noto_Sans_JP, Jua } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { CommandPaletteProvider } from "@/components/CommandPalette";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE_TITLE = "Kyma 🌸 매일매일 일본어";
const SITE_DESCRIPTION =
  "히라가나·단어·문법부터 AI 회화·NHK 뉴스까지 — 한국인을 위한 일본어 학습 허브. 매일 즐겁게 일본어를 배워보세요.";
const SITE_URL = "https://kymanova.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Kyma",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "일본어 학습",
    "JLPT",
    "히라가나",
    "가타카나",
    "일본어 단어",
    "일본어 문법",
    "AI 일본어",
    "NHK 뉴스",
    "Kyma",
    "きょうま",
  ],
  authors: [{ name: "AnYoungJun" }],
  creator: "AnYoungJun",
  publisher: "Kyma",
  openGraph: {
    type: "website",
    siteName: "Kyma",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "ko_KR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kyma · 한국인을 위한 일본어 학습 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} ${jua.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CommandPaletteProvider>
              <Navbar />
              <main>{children}</main>
            </CommandPaletteProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

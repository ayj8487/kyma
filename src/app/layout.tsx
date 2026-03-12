import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kyma - 일본어 학습",
  description:
    "Kyma는 히라가나, 가타카나, 단어 학습과 퀴즈를 통해 일본어를 쉽고 재미있게 배울 수 있는 학습 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

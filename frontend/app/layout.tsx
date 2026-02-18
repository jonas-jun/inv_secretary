import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StockInsight — AI 주식 뉴스 인사이트",
  description: "글로벌 상장사 최신 뉴스를 AI가 종합 요약해드립니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

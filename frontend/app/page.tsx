"use client";

/**
 * app/page.tsx
 * ─────────────
 * 홈 페이지: 미니멀 검색 중심 레이아웃.
 */

import { TickerSearch } from "@/components/ui/TickerSearch";

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      {/* 로고 + 타이틀 */}
      <div className="text-center space-y-2">
        <div className="text-4xl mb-2">📈</div>
        <h1 className="text-2xl font-bold text-slate-900">StockInsight</h1>
        <p className="text-slate-500 text-sm">
          티커를 검색하면 최신 뉴스를 AI가 종합 요약해드립니다.
        </p>
      </div>

      {/* 검색 */}
      <TickerSearch />
    </div>
  );
}

/**
 * components/ui/Skeletons.tsx
 * ────────────────────────────
 * 로딩 스켈레톤 컴포넌트 모음.
 */

/** 종목 뉴스 페이지 스켈레톤 */
export function NewsPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* DigestCard 스켈레톤 */}
      <div className="rounded-xl border bg-slate-50 p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3.5 bg-slate-200 rounded w-full" />
        ))}
      </div>

      {/* 기사 목록 스켈레톤 */}
      <div className="h-4 bg-slate-200 rounded w-1/5 mb-3" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-1.5 py-3 border-b border-slate-100">
          <div className="h-3.5 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
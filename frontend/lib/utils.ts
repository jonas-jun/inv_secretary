/**
 * lib/utils.ts
 * ────────────
 * 공통 유틸리티 함수.
 */

/** ISO 날짜 문자열을 "N시간 전" 형태로 변환 */
export function timeAgo(isoDate: string): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

/** Sentiment label → Tailwind 텍스트 색상 클래스 */
export function sentimentTextColor(label: string | null): string {
  switch (label) {
    case "Positive": return "text-emerald-600";
    case "Negative": return "text-red-500";
    default:         return "text-slate-500";
  }
}

/** Sentiment label → 배경 + 테두리 클래스 */
export function sentimentBgClass(label: string | null): string {
  switch (label) {
    case "Positive": return "bg-emerald-50 border-emerald-200";
    case "Negative": return "bg-red-50 border-red-200";
    default:         return "bg-slate-50 border-slate-200";
  }
}

/** Sentiment label → 이모지 */
export function sentimentEmoji(label: string | null): string {
  switch (label) {
    case "Positive": return "😊";
    case "Negative": return "😟";
    default:         return "😐";
  }
}

/** Sentiment score → 부호 포함 문자열 (예: +0.74, -0.32) */
export function formatScore(score: number | null): string {
  if (score === null || score === undefined) return "–";
  return score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
}

/** trend → 한글 레이블 + 화살표 */
export function trendLabel(trend: string | null): string {
  switch (trend) {
    case "improving":  return "↑ 개선";
    case "worsening":  return "↓ 악화";
    case "stable":     return "→ 보합";
    default:           return "";
  }
}

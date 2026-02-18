"use client";

/**
 * components/news/ArticleList.tsx
 * ─────────────────────────────────
 * 기사 제목/링크 목록.
 * 기사별 summary, sentiment는 제거되고 제목/출처/시간만 표시한다.
 */

import type { Article } from "@/lib/api";
import { timeAgo, formatDate } from "@/lib/utils";

function ArticleMeta({ source, publishedAt }: { source: string; publishedAt: string }) {
  const relative = timeAgo(publishedAt);
  const exact    = formatDate(publishedAt);
  return (
    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
      <span>{source}</span>
      {relative && (
        <>
          <span>·</span>
          <time dateTime={publishedAt} title={exact}>{relative}</time>
        </>
      )}
    </div>
  );
}

interface Props {
  articles: Article[];
  symbol?: string;
}

export function ArticleList({ articles, symbol }: Props) {
  return (
    <div>
      <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
        <span>📰</span>
        <span>관련 기사</span>
        <span className="text-xs font-normal text-slate-400">({articles.length}건)</span>
      </h2>

      <ul className="divide-y divide-slate-100">
        {articles.map((article, idx) => (
          <li key={article.id} className="py-3 flex gap-2">
            {symbol === "MARKET" && (
              <span className="mt-0.5 text-blue-500 font-semibold shrink-0 select-none w-5 text-center text-sm">{idx + 1}</span>
            )}
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block flex-1"
              >
                <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                  <span className="ml-1.5 inline-block opacity-0 group-hover:opacity-60 transition-opacity text-blue-500 text-xs">↗</span>
                </p>
                <ArticleMeta source={article.source} publishedAt={article.published_at} />
              </a>
            ) : (
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                  {article.title}
                </p>
                <ArticleMeta source={article.source} publishedAt={article.published_at} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

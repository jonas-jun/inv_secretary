"use client";

/**
 * components/news/ArticleList.tsx
 * ─────────────────────────────────
 * 기사 제목/링크 목록.
 * 기사별 summary, sentiment는 제거되고 제목/출처/시간만 표시한다.
 */

import type { Article } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

interface Props {
  articles: Article[];
}

export function ArticleList({ articles }: Props) {
  return (
    <div>
      <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
        <span>📰</span>
        <span>관련 기사</span>
        <span className="text-xs font-normal text-slate-400">({articles.length}건)</span>
      </h2>

      <ul className="divide-y divide-slate-100">
        {articles.map((article) => (
          <li key={article.id} className="py-3">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                <span>{article.source}</span>
                <span>·</span>
                <span>{timeAgo(article.published_at)}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

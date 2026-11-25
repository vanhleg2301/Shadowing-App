import Link from "next/link";
import { formatNewsDate, getArticleHref } from "@/lib/news";
import type { TechArticleItem } from "@/lib/tech-news";

interface ArticleListProps {
  articles: TechArticleItem[];
  // Show each article's topic, when the list mixes them.
  isTopicShown?: boolean;
}

export function ArticleList({ articles, isTopicShown = false }: ArticleListProps) {
  return (
    <ul className="stagger mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {articles.map((article) => (
        <li key={article.id}>
          <Link href={getArticleHref(article.id)} className="pressable block h-full rounded-3xl border border-line bg-surface p-4 hover:border-brand">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              {isTopicShown ? `${article.topic} · ` : ""}≈{article.level}
              <span className="font-semibold normal-case text-muted">
                {" "}
                · {formatNewsDate(article.published_at)} · {Math.max(1, Math.round(article.word_count / 200))} min read
              </span>
            </p>
            <p className="mt-1 font-bold leading-snug text-ink">{article.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{article.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

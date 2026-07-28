import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Article } from '../../lib/types';
import { formatDate, estimateReadingTime } from '../../lib/format';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const readingTime = article.reading_time ?? estimateReadingTime(article.body);
  const date = formatDate(article.published_at ?? article.created_at ?? null);

  return (
    <article
      className={`group h-full overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift ${
      featured ? 'md:grid md:grid-cols-2' : ''}`
      }>
      
      <Link to={`/articles/${article.slug}`} className="block h-full">
        <div className={`relative overflow-hidden bg-muted ${featured ? 'h-64 md:h-full' : 'aspect-[16/10]'}`}>
          {article.cover_image_url ?
          <img
            src={article.cover_image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" /> :


          <div className="flex h-full w-full items-center justify-center bg-muted font-heading text-2xl text-subtle/50">
              {article.title.slice(0, 1)}
            </div>
          }
          {article.category &&
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink">
              {article.category}
            </span>
          }
        </div>

        <div className={`flex flex-col p-6 ${featured ? 'justify-center md:p-10' : ''}`}>
          <h3
            className={`font-heading leading-snug text-ink transition-colors group-hover:text-teal-dark ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'}`
            }>
            
            {article.title}
          </h3>
          {article.excerpt &&
          <p className={`mt-3 text-sm leading-relaxed text-subtle ${featured ? 'md:text-base' : 'line-clamp-3'}`}>
              {article.excerpt}
            </p>
          }
          <div className="mt-6 flex items-center gap-4 text-xs text-subtle">
            {date && <time dateTime={article.published_at ?? undefined}>{date}</time>}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readingTime} min read
            </span>
          </div>
        </div>
      </Link>
    </article>);

}
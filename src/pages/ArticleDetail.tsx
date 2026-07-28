import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Check, Clock, Link2, Linkedin, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Article } from '../lib/types';
import { useSupabaseQuery, useSupabaseRow } from '../lib/useSupabaseQuery';
import { estimateReadingTime, formatDate, slugify } from '../lib/format';
import { PORTRAIT_IMAGE } from '../lib/heroImages';
import { ArticleCard } from '../components/site/ArticleCard';
import { Reveal } from '../components/site/Reveal';
import { EmptyState, ErrorState, Skeleton } from '../components/site/states';

interface Heading {
  id: string;
  text: string;
  level: number;
}

function prepareBody(body: string | null): {html: string;headings: Heading[];} {
  if (!body) return { html: '', headings: [] };

  const looksLikeHtml = /<\/?(p|h2|h3|ul|ol|li|blockquote|img|strong|em|a)\b/i.test(body);
  const source = looksLikeHtml ?
  body :
  body.
  split(/\n{2,}/).
  map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`).
  join('');

  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return { html: source, headings: [] };
  }

  const doc = new DOMParser().parseFromString(`<div id="root">${source}</div>`, 'text/html');
  const root = doc.getElementById('root');
  const headings: Heading[] = [];

  root?.querySelectorAll('h2, h3').forEach((node) => {
    const text = node.textContent?.trim() ?? '';
    if (!text) return;
    const id = slugify(text) || `section-${headings.length + 1}`;
    node.setAttribute('id', id);
    headings.push({ id, text, level: node.tagName === 'H2' ? 2 : 3 });
  });

  return { html: root?.innerHTML ?? source, headings };
}

export function ArticleDetail() {
  const { slug } = useParams<{slug: string;}>();
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const article = useSupabaseRow<Article>(
    () => supabase.from('articles').select('*').eq('slug', slug ?? '').eq('status', 'published').maybeSingle(),
    [slug]
  );

  const related = useSupabaseQuery<Article>(
    () =>
    supabase.
    from('articles').
    select('*').
    eq('status', 'published').
    neq('slug', slug ?? '').
    order('published_at', { ascending: false, nullsFirst: false }).
    limit(3),
    [slug]
  );

  const { html, headings } = useMemo(() => prepareBody(article.data?.body ?? null), [article.data?.body]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (article.loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-3/4" />
        <Skeleton className="mt-10 aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 8 }).map((_, index) =>
          <Skeleton key={index} className="h-4 w-full" />
          )}
        </div>
      </div>);

  }

  if (article.error) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <ErrorState message={article.error} onRetry={article.refetch} />
      </div>);

  }

  if (!article.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <EmptyState title="Article not found" description="This article may have been unpublished or moved." />
        <div className="mt-8 text-center">
          <Link to="/articles" className="text-sm font-medium text-teal hover:text-teal-dark">
            Back to all articles
          </Link>
        </div>
      </div>);

  }

  const current = article.data;
  const readingTime = current.reading_time ?? estimateReadingTime(current.body);

  return (
    <div className="w-full">
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-teal"
        aria-hidden="true" />
      

      {/* Cover */}
      <header className="relative flex min-h-[62vh] w-full items-end overflow-hidden bg-ink pt-32 pb-16">
        <div className="absolute inset-0">
          {current.cover_image_url &&
          <img src={current.cover_image_url} alt="" aria-hidden="true" className="h-full w-full object-cover animate-kenburns" />
          }
          <div className="absolute inset-0 bg-ink/65" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-4xl px-6 lg:px-10">
          
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Articles
          </Link>
          {current.category &&
          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-teal">{current.category}</p>
          }
          <h1 className="mt-4 font-heading text-3xl leading-[1.12] text-white sm:text-5xl">{current.title}</h1>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/70">
            <span className="flex items-center gap-3">
              <img src={PORTRAIT_IMAGE} alt="" className="h-9 w-9 rounded-full object-cover" />
              Dr. Oladeji, MD
            </span>
            {formatDate(current.published_at) && <time dateTime={current.published_at ?? undefined}>{formatDate(current.published_at)}</time>}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readingTime} min read
            </span>
          </div>
        </motion.div>
      </header>

      <div className="mx-auto grid max-w-content gap-14 px-6 py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10 lg:py-24">
        {/* TOC + share */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-8">
            {headings.length > 0 &&
            <nav aria-label="Table of contents">
                <p className="text-xs uppercase tracking-[0.2em] text-subtle">Contents</p>
                <ul className="mt-4 space-y-3 border-l border-line pl-4">
                  {headings.map((heading) =>
                <li key={heading.id} className={heading.level === 3 ? 'pl-3' : ''}>
                      <a href={`#${heading.id}`} className="text-sm leading-snug text-subtle transition-colors hover:text-teal">
                        {heading.text}
                      </a>
                    </li>
                )}
                </ul>
              </nav>
            }

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-subtle">Share</p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(current.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
                  
                  <Twitter className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Share on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
                  
                  <Linkedin className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shareUrl);
                    setCopied(true);
                  }}
                  aria-label="Copy link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
                  
                  {copied ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <article className="min-w-0">
          {current.excerpt &&
          <p className="mb-10 border-l-2 border-teal pl-6 font-heading text-xl leading-relaxed text-ink sm:text-2xl">
              {current.excerpt}
            </p>
          }
          {html ?
          <div className="prose-editorial max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} /> :

          <EmptyState title="This article has no content yet" />
          }

          {(current.tags ?? []).length > 0 &&
          <ul className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8">
              {(current.tags ?? []).map((tag) =>
            <li key={tag} className="rounded-full border border-line px-3 py-1.5 text-xs text-subtle">
                  #{tag}
                </li>
            )}
            </ul>
          }
        </article>
      </div>

      {/* Related */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10">
          <Reveal>
            <h2 className="mb-12 font-heading text-3xl text-ink">Keep reading</h2>
          </Reveal>
          {related.loading ?
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) =>
            <Skeleton key={item} className="aspect-[4/3] w-full rounded-2xl" />
            )}
            </div> :
          related.data.length === 0 ?
          <EmptyState title="No other articles yet" /> :

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.data.map((item) =>
            <ArticleCard key={item.id} article={item} />
            )}
            </div>
          }
        </div>
      </section>
    </div>);

}
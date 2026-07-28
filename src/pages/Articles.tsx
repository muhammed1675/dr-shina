import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Article } from '../lib/types';
import { useSupabaseQuery } from '../lib/useSupabaseQuery';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES } from '../lib/heroImages';
import { PageHero } from '../components/site/PageHero';
import { ArticleCard } from '../components/site/ArticleCard';
import { Reveal, Stagger, StaggerItem } from '../components/site/Reveal';
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/site/states';

const PAGE_SIZE = 6;

type SortMode = 'latest' | 'popular';

export function Articles() {
  const { hero } = useSiteSettings();
  const copy = hero('articles_hero');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('latest');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data, loading, error, refetch } = useSupabaseQuery<Article>(
    () =>
    supabase.
    from('articles').
    select('*').
    eq('status', 'published').
    order('published_at', { ascending: false, nullsFirst: false }),
    []
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(data.map((item) => item.category).filter(Boolean) as string[]))],
    [data]
  );

  const tags = useMemo(() => Array.from(new Set(data.flatMap((item) => item.tags ?? []))).slice(0, 14), [data]);

  const featured = data[0] ?? null;

  const filtered = useMemo(() => {
    const rest = data.slice(1);
    const term = query.trim().toLowerCase();
    let result = rest.filter((article) => {
      const matchesTerm =
      term.length === 0 ||
      article.title.toLowerCase().includes(term) ||
      (article.excerpt ?? '').toLowerCase().includes(term) ||
      (article.tags ?? []).some((item) => item.toLowerCase().includes(term));
      const matchesCategory = category === 'All' || article.category === category;
      const matchesTag = !tag || (article.tags ?? []).includes(tag);
      return matchesTerm && matchesCategory && matchesTag;
    });

    if (sort === 'popular') {
      result = [...result].sort((a, b) => (b.reading_time ?? 0) - (a.reading_time ?? 0));
    }
    return result;
  }, [data, query, category, tag, sort]);

  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.articles}
        eyebrow="Articles"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Articles' }]} />
      

      <div className="mx-auto max-w-content px-6 py-20 lg:px-10 lg:py-24">
        {loading ?
        <CardSkeletonGrid count={6} /> :
        error ?
        <ErrorState message={error} onRetry={refetch} /> :
        data.length === 0 ?
        <EmptyState
          title="No articles published yet"
          description="New essays and reflections will appear here as soon as they are published." /> :


        <>
            {featured &&
          <Reveal className="mb-20">
                <p className="mb-6 text-xs uppercase tracking-[0.28em] text-teal">Featured</p>
                <ArticleCard article={featured} featured />
              </Reveal>
          }

            {/* Controls */}
            <Reveal className="sticky top-20 z-30 -mx-6 mb-12 border-y border-line bg-background/95 px-6 py-5 backdrop-blur lg:-mx-10 lg:px-10">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
                    <label htmlFor="article-search" className="sr-only">
                      Search articles
                    </label>
                    <input
                    id="article-search"
                    type="search"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setVisible(PAGE_SIZE);
                    }}
                    placeholder="Search articles"
                    className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-subtle/70 focus:border-teal" />
                  
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-line bg-card p-1" role="tablist" aria-label="Sort articles">
                    {(['latest', 'popular'] as SortMode[]).map((mode) =>
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={sort === mode}
                    onClick={() => setSort(mode)}
                    className={`rounded-full px-4 py-2 text-sm capitalize transition-colors ${
                    sort === mode ? 'bg-ink text-white' : 'text-subtle hover:text-ink'}`
                    }>
                    
                        {mode}
                      </button>
                  )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((item) =>
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors ${
                  category === item ? 'border-teal bg-teal text-white' : 'border-line bg-card text-subtle hover:border-teal hover:text-teal'}`
                  }>
                  
                      {item}
                    </button>
                )}
                </div>

                {tags.length > 0 &&
              <div className="flex flex-wrap items-center gap-2">
                    {tags.map((item) =>
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTag(tag === item ? null : item);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`text-xs transition-colors ${tag === item ? 'text-teal' : 'text-subtle hover:text-ink'}`}>
                  
                        #{item}
                      </button>
                )}
                  </div>
              }
              </div>
            </Reveal>

            {filtered.length === 0 ?
          <EmptyState title="No matching articles" description="Try a different search term, category or tag." /> :

          <>
                <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.slice(0, visible).map((article) =>
              <StaggerItem key={article.id}>
                      <ArticleCard article={article} />
                    </StaggerItem>
              )}
                </Stagger>

                {visible < filtered.length &&
            <div className="mt-14 text-center">
                    <button
                type="button"
                onClick={() => setVisible((value) => value + PAGE_SIZE)}
                className="rounded-full border border-line bg-card px-7 py-3.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-teal hover:text-teal">
                
                      Load more
                    </button>
                  </div>
            }
              </>
          }
          </>
        }
      </div>
    </div>);

}
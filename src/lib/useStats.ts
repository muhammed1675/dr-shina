import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { ImpactStat } from './types';

export interface PublicStats {
  articles: number;
  events: number;
  projects: number;
  livesImpacted: number;
}

function parseNumber(value: string): number {
  const digits = value.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Aggregated counters used by the Home hero stat band. */
export function usePublicStats(): {stats: PublicStats;loading: boolean;} {
  const [stats, setStats] = useState<PublicStats>({ articles: 0, events: 0, projects: 0, livesImpacted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;

    const run = async () => {
      const [articles, events, projects, impact] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('speaking_events').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('impact_stats')]
      );

      if (!active) return;

      let lives = 0;
      for (const row of impact.data ?? []) {
        const list = row.impact_stats as ImpactStat[] | null ?? [];
        if (!Array.isArray(list)) continue;
        for (const stat of list) {
          if (/live|people|patient|reached|impact/i.test(stat.label ?? '')) {
            lives += parseNumber(String(stat.value ?? ''));
          }
        }
      }

      setStats({
        articles: articles.count ?? 0,
        events: events.count ?? 0,
        projects: projects.count ?? 0,
        livesImpacted: Math.round(lives)
      });
      setLoading(false);
    };

    run().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { stats, loading };
}

export interface AdminStats {
  articles: number;
  galleryImages: number;
  projects: number;
  upcomingEvents: number;
  unreadMessages: number;
  subscribers: number;
  mediaItems: number;
  testimonials: number;
}

export function useAdminStats(): {stats: AdminStats;loading: boolean;error: string | null;} {
  const [stats, setStats] = useState<AdminStats>({
    articles: 0,
    galleryImages: 0,
    projects: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    subscribers: 0,
    mediaItems: 0,
    testimonials: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase is not connected yet. Add your keys to .env.local.');
      return;
    }
    let active = true;

    const count = (table: string) => supabase.from(table).select('id', { count: 'exact', head: true });

    Promise.all([
    count('articles'),
    count('gallery_images'),
    count('projects'),
    supabase.from('speaking_events').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    count('newsletter_subscribers'),
    count('media_items'),
    count('testimonials')]
    ).
    then((results) => {
      if (!active) return;
      const failed = results.find((result) => result.error);
      if (failed?.error) setError(failed.error.message);
      setStats({
        articles: results[0].count ?? 0,
        galleryImages: results[1].count ?? 0,
        projects: results[2].count ?? 0,
        upcomingEvents: results[3].count ?? 0,
        unreadMessages: results[4].count ?? 0,
        subscribers: results[5].count ?? 0,
        mediaItems: results[6].count ?? 0,
        testimonials: results[7].count ?? 0
      });
      setLoading(false);
    }).
    catch((err: unknown) => {
      if (!active) return;
      setError(err instanceof Error ? err.message : 'Could not load dashboard stats.');
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { stats, loading, error };
}
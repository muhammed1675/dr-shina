import { useCallback, useEffect, useRef, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { isSupabaseConfigured, MISSING_CONFIG_MESSAGE } from './supabase';

interface QueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

type Fetcher<T> = () => PromiseLike<{data: T[] | null;error: PostgrestError | null;}>;

/**
 * Small data-fetching primitive used across the site and admin.
 * Always exposes loading + error so no screen is ever left blank.
 */
export function useSupabaseQuery<T>(fetcher: Fetcher<T>, deps: unknown[] = []): QueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured) {
      setData([]);
      setError(MISSING_CONFIG_MESSAGE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.resolve(fetcherRef.current()).
    then((result) => {
      if (cancelled) return;
      if (result.error) {
        setError(result.error.message);
        setData([]);
      } else {
        setData(result.data ?? []);
      }
    }).
    catch((err: unknown) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Something went wrong while loading data.');
      setData([]);
    }).
    then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}

interface SingleResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupabaseRow<T>(
fetcher: () => PromiseLike<{data: T | null;error: PostgrestError | null;}>,
deps: unknown[] = [])
: SingleResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured) {
      setData(null);
      setError(MISSING_CONFIG_MESSAGE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.resolve(fetcherRef.current()).
    then((result) => {
      if (cancelled) return;
      if (result.error) {
        setError(result.error.message);
        setData(null);
      } else {
        setData(result.data);
      }
    }).
    catch((err: unknown) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Something went wrong while loading data.');
    }).
    then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch };
}
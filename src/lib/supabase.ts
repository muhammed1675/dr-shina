import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Environment variables (see .env.example):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  <- server-only, never imported here
 *
 * This app is a client-rendered React app, so only the URL + anon key are read
 * in the browser. Admin writes are authorised by the logged-in Supabase Auth
 * session together with the "authenticated" RLS policies in supabase/schema.sql.
 * The service-role key must only ever be used from a server context.
 */
type EnvBag = Record<string, string | undefined>;

function readEnv(): EnvBag {
  const bag: EnvBag = {};
  try {
    const metaEnv = (import.meta as unknown as {env?: EnvBag;}).env;
    if (metaEnv) Object.assign(bag, metaEnv);
  } catch {

    /* import.meta unavailable */}
  try {
    const procEnv = (globalThis as unknown as {process?: {env?: EnvBag;};}).process?.env;
    if (procEnv) Object.assign(bag, procEnv);
  } catch {

    /* process unavailable */}
  return bag;
}

const env = readEnv();

function pick(...keys: string[]): string {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  }
  return '';
}

export const SUPABASE_URL = pick(
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL'
);

export const SUPABASE_ANON_KEY = pick(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY'
);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Bucket used for every admin image upload. */
export const MEDIA_BUCKET = 'media';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'doctor-brand-auth'
    }
  }
);

export const MISSING_CONFIG_MESSAGE =
'Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface HeroCopy {
  headline: string;
  subtitle: string;
}

export interface SocialLinks {
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

export type SettingsMap = Record<string, unknown>;

/** Fallback copy used until the owner edits it in Admin → Site Settings. */
export const DEFAULT_SETTINGS = {
  home_hero: {
    headline: 'Medicine Beyond The Clinic — Building Health, Leadership & Communities',
    subtitle:
    'Physician, public speaker and health advocate working at the intersection of clinical care, leadership and community.'
  },
  about_hero: {
    headline: 'A Life In Service Of Health',
    subtitle: 'From the ward to the lectern — the journey, the philosophy and the values behind the work.'
  },
  articles_hero: {
    headline: 'Writing On Health, Leadership & Society',
    subtitle: 'Essays, research reflections and practical guidance for clinicians, leaders and curious readers.'
  },
  gallery_hero: {
    headline: 'Gallery & Media',
    subtitle: 'Moments from clinics, conferences, communities and conversations.'
  },
  projects_hero: {
    headline: 'Projects & Speaking',
    subtitle: 'Community health initiatives and keynotes that turn ideas into measurable impact.'
  },
  contact_hero: {
    headline: 'Let’s Start A Conversation',
    subtitle: 'For speaking invitations, collaborations, media requests and mentorship enquiries.'
  },
  social_links: {
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  },
  contact_info: {
    email: '',
    phone: '',
    location: ''
  }
} satisfies SettingsMap;

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

interface SiteSettingsContextValue {
  settings: SettingsMap;
  loading: boolean;
  error: string | null;
  hero: (key: string) => HeroCopy;
  social: SocialLinks;
  contact: ContactInfo;
  refetch: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: {children: React.ReactNode;}) {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase.
    from('site_settings').
    select('key, value').
    then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
      } else {
        const map: SettingsMap = {};
        for (const row of data ?? []) map[row.key as string] = row.value;
        setSettings(map);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [nonce]);

  const value = useMemo<SiteSettingsContextValue>(() => {
    const merged: SettingsMap = { ...DEFAULT_SETTINGS, ...settings };
    return {
      settings: merged,
      loading,
      error,
      refetch: () => setNonce((n) => n + 1),
      hero: (key: string) => {
        const fallback = (DEFAULT_SETTINGS as SettingsMap)[key] as HeroCopy | undefined;
        const stored = merged[key] as Partial<HeroCopy> | undefined;
        return {
          headline: stored?.headline || fallback?.headline || '',
          subtitle: stored?.subtitle || fallback?.subtitle || ''
        };
      },
      social: { ...DEFAULT_SETTINGS.social_links, ...(merged.social_links as Partial<SocialLinks> ?? {}) },
      contact: { ...DEFAULT_SETTINGS.contact_info, ...(merged.contact_info as Partial<ContactInfo> ?? {}) }
    };
  }, [settings, loading, error]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsContextValue {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  return context;
}
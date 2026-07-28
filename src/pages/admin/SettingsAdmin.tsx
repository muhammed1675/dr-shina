import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { TextAreaField, TextField } from '../../components/admin/fields';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  ContactInfo,
  DEFAULT_SETTINGS,
  HeroCopy,
  SocialLinks,
  useSiteSettings } from
'../../lib/SiteSettingsProvider';

const HERO_KEYS: {key: string;label: string;}[] = [
{ key: 'home_hero', label: 'Home' },
{ key: 'about_hero', label: 'About' },
{ key: 'articles_hero', label: 'Articles' },
{ key: 'gallery_hero', label: 'Gallery & Media' },
{ key: 'projects_hero', label: 'Projects & Speaking' },
{ key: 'contact_hero', label: 'Contact' }];


export function SettingsAdmin() {
  const { settings, loading, refetch } = useSiteSettings();
  const [heroes, setHeroes] = useState<Record<string, HeroCopy>>({});
  const [social, setSocial] = useState<SocialLinks>(DEFAULT_SETTINGS.social_links);
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_SETTINGS.contact_info);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const nextHeroes: Record<string, HeroCopy> = {};
    for (const { key } of HERO_KEYS) {
      const fallback = (DEFAULT_SETTINGS as Record<string, unknown>)[key] as HeroCopy;
      const stored = settings[key] as Partial<HeroCopy> | undefined;
      nextHeroes[key] = {
        headline: stored?.headline ?? fallback.headline,
        subtitle: stored?.subtitle ?? fallback.subtitle
      };
    }
    setHeroes(nextHeroes);
    setSocial({ ...DEFAULT_SETTINGS.social_links, ...(settings.social_links as Partial<SocialLinks> ?? {}) });
    setContact({ ...DEFAULT_SETTINGS.contact_info, ...(settings.contact_info as Partial<ContactInfo> ?? {}) });
  }, [loading, settings]);

  const handleSave = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not connected. Add your keys to .env.local.');
      return;
    }
    setSaving(true);
    const rows = [
    ...HERO_KEYS.map(({ key }) => ({ key, value: heroes[key] })),
    { key: 'social_links', value: social },
    { key: 'contact_info', value: contact }];

    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Site settings saved');
    refetch();
  };

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="Edit page headlines, social links and contact details — no redeploy needed."
        action={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-60">
          
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Save changes
          </button>
        } />
      

      {loading ?
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-6 py-16 text-sm text-subtle">
          <Loader2 className="h-4 w-4 animate-spin text-teal" aria-hidden="true" />
          Loading settings…
        </div> :

      <div className="space-y-6">
          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="font-heading text-xl text-ink">Page hero copy</h2>
            <p className="mt-1 text-sm text-subtle">The large headline and subtitle at the top of each page.</p>
            <div className="mt-6 space-y-8">
              {HERO_KEYS.map(({ key, label }) =>
            <div key={key} className="border-t border-line pt-6 first:border-0 first:pt-0">
                  <p className="mb-4 text-xs uppercase tracking-[0.2em] text-teal">{label}</p>
                  <div className="space-y-4">
                    <TextField
                  label="Headline"
                  value={heroes[key]?.headline ?? ''}
                  onChange={(value) => setHeroes((prev) => ({ ...prev, [key]: { ...prev[key], headline: value } }))} />
                
                    <TextAreaField
                  label="Subtitle"
                  rows={2}
                  value={heroes[key]?.subtitle ?? ''}
                  onChange={(value) => setHeroes((prev) => ({ ...prev, [key]: { ...prev[key], subtitle: value } }))} />
                
                  </div>
                </div>
            )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="font-heading text-xl text-ink">Social links</h2>
            <p className="mt-1 text-sm text-subtle">Leave a field blank to hide that icon.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <TextField label="Twitter / X" value={social.twitter} onChange={(value) => setSocial((prev) => ({ ...prev, twitter: value }))} placeholder="https://" />
              <TextField label="LinkedIn" value={social.linkedin} onChange={(value) => setSocial((prev) => ({ ...prev, linkedin: value }))} placeholder="https://" />
              <TextField label="Instagram" value={social.instagram} onChange={(value) => setSocial((prev) => ({ ...prev, instagram: value }))} placeholder="https://" />
              <TextField label="YouTube" value={social.youtube} onChange={(value) => setSocial((prev) => ({ ...prev, youtube: value }))} placeholder="https://" />
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="font-heading text-xl text-ink">Contact details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <TextField label="Email" value={contact.email} onChange={(value) => setContact((prev) => ({ ...prev, email: value }))} type="email" />
              <TextField label="Phone" value={contact.phone} onChange={(value) => setContact((prev) => ({ ...prev, phone: value }))} />
              <TextField label="Location" value={contact.location} onChange={(value) => setContact((prev) => ({ ...prev, location: value }))} />
            </div>
          </section>
        </div>
      }
    </div>);

}
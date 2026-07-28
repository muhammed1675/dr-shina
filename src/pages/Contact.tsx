import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Instagram, Linkedin, Loader2, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES } from '../lib/heroImages';
import { PageHero } from '../components/site/PageHero';
import { Reveal } from '../components/site/Reveal';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', subject: '', message: '' };

export function Contact() {
  const { hero, social, contact } = useSiteSettings();
  const copy = hero('contact_hero');
  const [params] = useSearchParams();
  const speakingIntent = params.get('intent') === 'speaking';

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    subject: speakingIntent ? 'Speaking invitation' : ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Please share a little more detail (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    if (!isSupabaseConfigured) {
      setStatus('error');
      setFeedback('The contact form is not connected yet. Add your Supabase keys to .env.local.');
      return;
    }

    setStatus('loading');
    setFeedback('');

    const { error } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim()
    });

    if (error) {
      setStatus('error');
      setFeedback('Your message didn’t send. Please try again in a moment.');
      return;
    }

    setStatus('success');
    setFeedback('Thank you — your message has been received. Expect a reply within a few working days.');
    setForm(EMPTY);
  };

  const socials = [
  { label: 'Twitter', href: social.twitter, Icon: Twitter },
  { label: 'LinkedIn', href: social.linkedin, Icon: Linkedin },
  { label: 'Instagram', href: social.instagram, Icon: Instagram },
  { label: 'YouTube', href: social.youtube, Icon: Youtube }].
  filter((item) => Boolean(item.href));

  const fieldClass = (field: keyof FormState, multiline = false) =>
  `w-full rounded-xl border bg-card px-4 ${multiline ? 'py-3' : 'h-12'} text-sm text-ink outline-none transition-colors placeholder:text-subtle/60 focus:border-teal ${
  errors[field] ? 'border-destructive' : 'border-line'}`;


  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.contact}
        eyebrow="Contact"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      

      <div className="mx-auto grid max-w-content gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-28">
        <Reveal direction="left">
          <h2 className="font-heading text-3xl leading-tight text-ink">Send a message</h2>
          <p className="mt-3 text-sm leading-relaxed text-subtle">
            Speaking invitations, media requests, collaborations and mentorship enquiries all arrive here.
          </p>

          {status === 'success' ?
          <div
            role="status"
            className="mt-10 flex items-start gap-4 rounded-2xl border border-success/30 bg-success/5 px-6 py-8">
            
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="font-heading text-xl text-ink">Message sent</p>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{feedback}</p>
                <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setFeedback('');
                }}
                className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-teal hover:text-teal">
                
                  Send another message
                </button>
              </div>
            </div> :

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
                    Name
                  </label>
                  <input id="name" type="text" value={form.name} onChange={update('name')} className={fieldClass('name')} />
                  {errors.name && <p className="mt-2 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
                    Email
                  </label>
                  <input id="email" type="email" value={form.email} onChange={update('email')} className={fieldClass('email')} />
                  {errors.email && <p className="mt-2 text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-ink">
                  Subject
                </label>
                <input id="subject" type="text" value={form.subject} onChange={update('subject')} className={fieldClass('subject')} />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">
                  Message
                </label>
                <textarea id="message" rows={6} value={form.message} onChange={update('message')} className={fieldClass('message', true)} />
                {errors.message && <p className="mt-2 text-xs text-destructive">{errors.message}</p>}
              </div>

              {status === 'error' &&
            <p role="alert" className="text-sm text-destructive">
                  {feedback}
                </p>
            }

              <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-full bg-teal px-8 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark disabled:translate-y-0 disabled:opacity-60">
              
                {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {status === 'loading' ? 'Sending' : 'Send message'}
              </button>
            </form>
          }
        </Reveal>

        <Reveal direction="right" delay={0.1} className="space-y-10">
          <div className="rounded-2xl border border-line bg-card p-8">
            <h2 className="font-heading text-2xl text-ink">Direct details</h2>
            <ul className="mt-6 space-y-4 text-sm text-subtle">
              {contact.email &&
              <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-teal" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-teal">
                    {contact.email}
                  </a>
                </li>
              }
              {contact.phone &&
              <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-teal" aria-hidden="true" />
                  <a href={`tel:${contact.phone}`} className="transition-colors hover:text-teal">
                    {contact.phone}
                  </a>
                </li>
              }
              {contact.location &&
              <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
                  {contact.location}
                </li>
              }
              {!contact.email && !contact.phone && !contact.location &&
              <li>Contact details can be added in Admin → Site Settings.</li>
              }
            </ul>

            {socials.length > 0 &&
            <ul className="mt-8 flex gap-3 border-t border-line pt-6">
                {socials.map(({ label, href, Icon }) =>
              <li key={label}>
                    <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
                  
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
              )}
              </ul>
            }
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <iframe
              title="Location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.30%2C6.42%2C3.50%2C6.58&layer=mapnik"
              className="h-64 w-full border-0"
              loading="lazy" />
            
            <div className="p-6">
              <p className="font-heading text-lg text-ink">Based in Lagos, available worldwide</p>
              <p className="mt-2 text-sm leading-relaxed text-subtle">
                Speaking engagements are accepted internationally, in person or virtually.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <section className="bg-ink">
        <div className="mx-auto max-w-content px-6 py-24 text-center lg:px-10">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-heading text-3xl leading-tight text-white sm:text-4xl">
              Looking for a keynote speaker who leaves an audience changed?
            </h2>
            <a
              href="#name"
              className="mt-10 inline-flex rounded-full bg-teal px-8 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
              
              Book Speaking
            </a>
          </Reveal>
        </div>
      </section>
    </div>);

}
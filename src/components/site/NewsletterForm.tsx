import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterFormProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function NewsletterForm({ variant = 'light', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const dark = variant === 'dark';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus('error');
      setMessage('Newsletter is not connected yet. Add your Supabase keys to .env.local.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const { error } = await supabase.from('newsletter_subscribers').insert({ email: trimmed });

    if (error) {
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        setStatus('success');
        setMessage("You&apos;re already subscribed — thank you.");
        setEmail('');
        return;
      }
      setStatus('error');
      setMessage("We couldn&apos;t subscribe you just now. Please try again.");
      return;
    }

    setStatus('success');
    setMessage('Thank you — please check your inbox for a warm welcome.');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor={`newsletter-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${variant}`}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="Enter your email address"
          autoComplete="email"
          className={`h-12 w-full min-w-0 flex-1 rounded-full border px-5 text-base font-normal leading-none outline-none transition-colors focus:border-teal sm:text-sm ${
          dark ?
          'border-white/20 bg-white/5 text-white placeholder:text-white/40' :
          'border-line bg-white text-ink placeholder:text-subtle/70'}`
          } />
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-7 text-base font-medium text-white transition-all hover:bg-teal-dark disabled:opacity-60 sm:w-auto sm:text-sm">
          
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {status === 'success' && <Check className="h-4 w-4" aria-hidden="true" />}
          {status === 'loading' ? 'Subscribing' : 'Subscribe'}
        </button>
      </div>

      <p
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-sm ${
        status === 'error' ? 'text-destructive' : status === 'success' ? 'text-success' : dark ? 'text-white/50' : 'text-subtle'}`
        }>
        
        {message || 'One thoughtful email a month. No noise, unsubscribe anytime.'}
      </p>
    </form>
  );
}

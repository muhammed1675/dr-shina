import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterFormProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const mobileAlignmentCss = `
  .newsletter-form-row {
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .newsletter-email-input,
  .newsletter-submit-button {
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 52px !important;
    min-height: 52px !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    border-radius: 9999px !important;
    font-size: 16px !important;
    line-height: 1.2 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  .newsletter-email-input {
    padding: 0 22px !important;
  }

  .newsletter-email-input::placeholder {
    font-size: 16px !important;
    line-height: 1.2 !important;
    opacity: 1 !important;
  }

  .newsletter-submit-button {
    justify-content: center !important;
    gap: 8px !important;
    padding: 0 28px !important;
  }

  @media (min-width: 640px) {
    .newsletter-form-row {
      flex-direction: row !important;
      align-items: center !important;
    }

    .newsletter-email-input,
    .newsletter-submit-button {
      height: 44px !important;
      min-height: 44px !important;
      font-size: 14px !important;
    }

    .newsletter-email-input::placeholder {
      font-size: 14px !important;
    }

    .newsletter-submit-button {
      width: auto !important;
    }
  }
`;


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
        setMessage("You're already subscribed — thank you.");
        setEmail('');
        return;
      }
      setStatus('error');
      setMessage("We couldn't subscribe you just now. Please try again.");
      return;
    }

    setStatus('success');
    setMessage('Thank you — please check your inbox for a warm welcome.');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <style>{mobileAlignmentCss}</style>

      <div className="newsletter-form-row">
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
          className={`newsletter-email-input min-w-0 flex-1 border font-normal outline-none transition-colors focus:border-teal ${
            dark
              ? 'border-white/20 bg-white/5 text-white placeholder:text-white/40'
              : 'border-line bg-white text-ink placeholder:text-subtle/70'
          }`}
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="newsletter-submit-button shrink-0 bg-teal font-medium text-white transition-all hover:bg-teal-dark disabled:opacity-60"
        >
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {status === 'success' && <Check className="h-4 w-4" aria-hidden="true" />}
          {status === 'loading' ? 'Subscribing' : 'Subscribe'}
        </button>
      </div>

      <p
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] text-sm ${
          status === 'error' ? 'text-destructive' : status === 'success' ? 'text-success' : dark ? 'text-white/50' : 'text-subtle'
        }`}
      >
        {message || 'One thoughtful email a month. No noise, unsubscribe anytime.'}
      </p>
    </form>
  );
}

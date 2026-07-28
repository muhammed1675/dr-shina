import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../lib/AuthProvider';
import { isSupabaseConfigured } from '../../lib/supabase';

export function AdminLogin() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFA] px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-white p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-heading text-2xl text-ink">Owner sign in</h1>
          <p className="mt-2 text-sm text-subtle">Manage articles, gallery, projects, speaking and messages.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal" />
              
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal" />
              
            </div>

            {error &&
            <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            }

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-60">
              
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Sign in
            </button>
          </form>
        </div>

        {!isSupabaseConfigured &&
        <p className="mt-6 text-center text-xs leading-relaxed text-subtle">
            Supabase isn’t connected. Add your keys to <code className="text-ink">.env.local</code>, then create the owner
            account in Supabase → Authentication → Users.
          </p>
        }
      </div>
    </div>);

}
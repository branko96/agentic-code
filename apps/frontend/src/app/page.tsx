'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, persistToken, readToken } from '../lib/auth';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = readToken();

    if (token) {
      router.replace('/dashboard');
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      persistToken(response.accessToken);
      setPassword('');
      router.replace('/dashboard');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <p className="text-sm text-muted">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-surface-border bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sign in with your existing backend account.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  );
}

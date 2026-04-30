'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    Promise.all([getMe(token), getConfig(token)])
      .then(([user, config]) => {
        setSession({ user, config });
      })
      .catch(() => {
        clearToken();
        setSession(null);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      persistToken(response.accessToken);

      const [user, config] = await Promise.all([
        getMe(response.accessToken),
        getConfig(response.accessToken),
      ]);

      setSession({ user, config });
      setPassword('');
    } catch (caughtError) {
      setSession(null);
      clearToken();
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setSession(null);
    setPassword('');
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <p className="text-sm text-muted">Checking session...</p>
      </main>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen px-6 py-6 text-foreground">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-surface-border bg-surface/90 px-5 py-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div>
            <p className="text-lg font-semibold text-white">{session.config.appName}</p>
            <p className="text-sm text-muted">
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-surface-foreground">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-sm text-muted">{session.user.email}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Log out
            </button>
          </div>
        </nav>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111827] px-8 py-10 shadow-2xl shadow-black/30">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <div className="text-3xl leading-none text-[#111827]">✦</div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-[#9ca3af]">Login to your account</p>
        </div>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[#e5e7eb]">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#e5e7eb]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-2xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-[#2563eb] px-4 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

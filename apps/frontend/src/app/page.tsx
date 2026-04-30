'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';

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

      const config = await getConfig(response.accessToken);

      setSession({ user: response.user, config });
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

            <button type="button" onClick={handleLogout} className={primaryButtonClassName}>
              Log out
            </button>
          </div>
        </nav>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
          <div className="h-7 w-7 rounded-xl bg-blue-600" />
        </div>

        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-950">Log in</h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Sign in with your existing backend account.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>

            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  );
}

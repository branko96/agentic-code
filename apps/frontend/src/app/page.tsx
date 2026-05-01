'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';
const formInputClassName =
  'h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100';
const featureCardClassName = 'rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

async function loadSession(token: string) {
  const [user, config] = await Promise.all([getMe(token), getConfig(token)]);
  return { user, config };
}

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

    loadSession(token)
      .then((nextSession) => {
        setSession(nextSession);
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

      const nextSession = await loadSession(response.accessToken);

      setSession(nextSession);
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground lg:px-10 lg:py-10">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-[#081120] shadow-[0_30px_80px_rgba(2,6,23,0.65)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between overflow-hidden px-8 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#0b1730_0%,#081120_100%)]" />
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
              Welcome back
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl">
              Manage your workspace with a polished login experience.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
              Sign in to access your backend account, review environment details, and continue where
              you left off.
            </p>
          </div>
          <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2">
            <div className={featureCardClassName}>
              <p className="text-sm font-medium text-white">Secure access</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Authenticate with your existing credentials.
              </p>
            </div>
            <div className={featureCardClassName}>
              <p className="text-sm font-medium text-white">Fast setup</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use the same API configuration already wired into the app.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-8 lg:px-10">
          <section className="w-full max-w-md">
            <p className="text-sm font-medium text-cyan-700">Login</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Access your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in with your existing backend account.
            </p>
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={formInputClassName}
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
                  className={formInputClassName}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

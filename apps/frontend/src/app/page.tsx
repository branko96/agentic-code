'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

const loginHighlights = [
  'Track team activity in one place',
  'Review environment details instantly',
  'Access support channels without leaving the app',
];

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
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-lg font-semibold text-slate-950">{session.config.appName}</p>
            <p className="text-sm text-muted">
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
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
    <main className="auth-shell flex min-h-screen items-center justify-center px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <section className="auth-card relative grid w-full max-w-6xl overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex flex-col justify-between gap-10 bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_26%)]" />
          <div className="relative space-y-6">
            <span className="auth-pill border-white/15 bg-white/10 text-white/80">
              Welcome back
            </span>

            <div className="space-y-4">
              <h1 className="max-w-md text-4xl font-semibold tracking-tight sm:text-5xl">
                Manage your workspace with a cleaner login experience.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                Sign in to review your account, check environment details, and continue working from
                a single secure place.
              </p>
            </div>

            <ul className="space-y-3">
              {loginHighlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-medium text-white/90">
              Fast access for your existing backend account
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="mt-1 text-xs text-slate-300">Availability</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">1</p>
                <p className="mt-1 text-xs text-slate-300">Secure access point</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-semibold">100%</p>
                <p className="mt-1 text-xs text-slate-300">Focused workflow</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white/70 px-6 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="space-y-3">
              <span className="auth-pill">Account access</span>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Log in</h2>
              <p className="text-sm leading-6 text-slate-600">
                Enter your credentials to continue to the dashboard.
              </p>
            </div>

            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${primaryButtonClassName} mt-2 w-full disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none`}
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Protected access for your configured backend user.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

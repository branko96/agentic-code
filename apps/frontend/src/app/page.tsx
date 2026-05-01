'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

const primaryButtonClassName =
  'inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';

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
  const [rememberSession, setRememberSession] = useState(false);

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
    setRememberSession(false);
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
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-light tracking-tight text-white">Log in</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in with your existing backend account.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="remember-session"
              className="flex items-center gap-2 text-sm text-slate-400"
            >
              <input
                id="remember-session"
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => setRememberSession(event.target.checked)}
                className="h-4 w-4 rounded border border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
              <span>Remember me</span>
            </label>

            <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
              Forgot password?
            </a>
          </div>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser } from '../types/auth';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    getMe(token)
      .then((nextUser) => {
        setUser(nextUser);
      })
      .catch(() => {
        clearToken();
        setUser(null);
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
      setUser(response.user);
    } catch (caughtError) {
      setUser(null);
      clearToken();
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setPassword('');
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
        <p className="text-sm text-slate-300">Checking session...</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-white">You are logged in</h1>
          <p className="mt-4 text-slate-300">
            Logged in as {user.firstName} {user.lastName}
          </p>
          <p className="mt-2 break-all text-slate-200">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            Log out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sign in with your existing backend account.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
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
              className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </section>
    </main>
  );
}

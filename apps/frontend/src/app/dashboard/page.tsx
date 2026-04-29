'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearToken, getMe, readToken } from '../../lib/auth';
import type { AuthUser } from '../../types/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      window.location.replace('/');
      return;
    }

    getMe(token)
      .then((nextUser) => {
        setUser(nextUser);
      })
      .catch(() => {
        clearToken();
        window.location.replace('/');
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  function handleLogout() {
    clearToken();
    window.location.replace('/');
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
        <p className="text-sm text-slate-300">Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-200">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Welcome back, {user.firstName}
        </h1>
        <p className="mt-4 text-slate-300">
          Your session is active and protected by the backend bearer token flow.
        </p>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-sm text-slate-200">
          <div>
            <dt className="text-slate-400">Name</dt>
            <dd className="mt-1 text-base text-white">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="mt-1 break-all text-base text-white">{user.email}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 font-medium text-slate-100 transition hover:bg-white/10"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

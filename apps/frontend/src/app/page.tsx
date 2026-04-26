'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'

export default function Home() {
  const { isAuthenticated, isLoading, logout, user } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-50">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
            Agentic Code
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Frontend authentication</h1>
          <p className="text-base text-slate-300">
            Minimal Next.js auth flow wired to the NestJS backend contract.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          {isLoading ? (
            <p className="text-sm text-slate-300">Checking your session...</p>
          ) : isAuthenticated && user ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Welcome back, {user.firstName} {user.lastName}
                </h2>
                <p className="mt-1 text-sm text-slate-300">Signed in as {user.email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                >
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Create an account or sign in to test the protected dashboard flow.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

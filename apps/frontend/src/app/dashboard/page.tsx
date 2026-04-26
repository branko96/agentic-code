'use client'

import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/components/auth-provider'

export default function DashboardPage() {
  const { logout, user } = useAuth()

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-50">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
              Protected dashboard
            </p>
            <h1 className="text-3xl font-semibold">Authenticated session</h1>
            <p className="text-sm text-slate-300">
              This page only renders after the stored token is validated with <code>/auth/me</code>.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-6">
            <dl className="space-y-4 text-sm text-slate-200">
              <div>
                <dt className="text-slate-400">User ID</dt>
                <dd className="mt-1 font-medium">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Name</dt>
                <dd className="mt-1 font-medium">
                  {user?.firstName} {user?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Email</dt>
                <dd className="mt-1 font-medium">{user?.email}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
              Back home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!firstName || !lastName || !email || !password) {
      setError('All fields are required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await register({ firstName, lastName, email, password })
      router.push('/dashboard')
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/30">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="text-sm text-slate-300">Register and land directly on the protected dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block space-y-2 text-sm">
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none transition focus:border-sky-500"
              autoComplete="given-name"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span>Last name</span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none transition focus:border-sky-500"
              autoComplete="family-name"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none transition focus:border-sky-500"
              autoComplete="email"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none transition focus:border-sky-500"
              autoComplete="new-password"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Already have an account?{' '}
          <Link href="/login" className="text-sky-400 hover:text-sky-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconLogin2, IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
      <main
        className="flex min-h-screen items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        <p style={{ color: '#6b7280' }}>Checking session...</p>
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
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-white px-8 pb-8 pt-10 shadow-sm"
        style={{ borderColor: '#e5e7eb', borderRadius: '16px' }}
      >
        {/* Icon badge */}
        <div
          className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#7f77dd', borderRadius: '8px' }}
        >
          <IconLogin2 size={20} color="white" />
        </div>

        <h1
          className="text-center text-[22px] font-medium tracking-tight"
          style={{ color: '#111827' }}
        >
          Iniciar sesión
        </h1>
        <p className="mt-1.5 text-center text-sm" style={{ color: '#6b7280' }}>
          Ingresa con tu cuenta existente
        </p>

        <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <p
              className="mb-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: '#6b7280', letterSpacing: '0.02em' }}
            >
              Correo electrónico
            </p>
            <div className="relative">
              <IconMail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg border bg-white pl-9 pr-3 text-sm outline-none transition"
                style={{
                  height: '38px',
                  borderColor: '#e5e7eb',
                  color: '#111827',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7f77dd';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <p
              className="mb-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: '#6b7280', letterSpacing: '0.02em' }}
            >
              Contraseña
            </p>
            <div className="relative">
              <IconLock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border bg-white pl-9 pr-9 text-sm outline-none transition"
                style={{
                  height: '38px',
                  borderColor: '#e5e7eb',
                  color: '#111827',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7f77dd';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error ? (
            <p
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#dc2626',
              }}
            >
              {error}
            </p>
          ) : null}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg px-4 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#7f77dd' }}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-medium" style={{ color: '#7f77dd' }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}

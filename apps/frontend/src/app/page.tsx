'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconLogin2, IconUserPlus, IconEye, IconEyeOff } from '@tabler/icons-react';
import {
  clearToken,
  getConfig,
  getMe,
  login,
  persistToken,
  readToken,
  register,
} from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

/* ─────────────────────────────────────────────── */
/*  Tab switcher: 'login' | 'register'             */
/* ─────────────────────────────────────────────── */

type Tab = 'login' | 'register';

/* ─────────────────────────────────────────────── */
/*  Register helpers                               */
/* ─────────────────────────────────────────────── */

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#14b8a6'] as const;

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/* ─────────────────────────────────────────────── */
/*  Shared input style helpers                     */
/* ─────────────────────────────────────────────── */

const inputBaseStyle: Record<string, string> = {
  height: '38px',
  borderColor: '#e5e7eb',
  color: '#111827',
};

function focusHandler(e: React.FocusEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.borderColor = '#7f77dd';
  el.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
}

function blurHandler(e: React.FocusEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.borderColor = '#e5e7eb';
  el.style.boxShadow = 'none';
}

/* ─────────────────────────────────────────────── */
/*  Main component                                 */
/* ─────────────────────────────────────────────── */

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [tab, setTab] = useState<Tab>('login');

  /* Register-only state */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

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

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Debes aceptar los Términos y Condiciones');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({ firstName, lastName, email, password });
      persistToken(response.accessToken);

      const config = await getConfig(response.accessToken);

      setSession({ user: response.user, config });
      setPassword('');
    } catch (caughtError) {
      setSession(null);
      clearToken();
      setError(caughtError instanceof Error ? caughtError.message : 'Error al registrarse');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setSession(null);
    setPassword('');
  }

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setError('');
  }

  /* ── Loading ── */
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

  /* ── Authenticated ── */
  if (session) {
    return (
      <main
        className="flex min-h-screen items-start justify-center px-4 py-12"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        <div
          className="w-full max-w-sm rounded-2xl border bg-white px-8 pb-8 pt-10 shadow-sm"
          style={{ borderColor: '#e5e7eb', borderRadius: '16px' }}
        >
          {/* Icon badge — igual que el auth card */}
          <div
            className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#7f77dd', borderRadius: '8px' }}
          >
            <IconLogin2 size={20} color="white" />
          </div>

          {/* App name + environment */}
          <div className="text-center mb-6">
            <p className="text-lg font-semibold" style={{ color: '#111827' }}>
              {session.config.appName}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          {/* User details en una caja con borde */}
          <div className="rounded-lg border px-4 py-3 mb-6" style={{ borderColor: '#e5e7eb' }}>
            <p className="text-sm font-medium" style={{ color: '#111827' }}>
              {session.user.firstName} {session.user.lastName}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {session.user.email}
            </p>
          </div>

          {/* Botón de logout con acento #7f77dd */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-3 text-[15px] font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#7f77dd' }}
          >
            Log out
          </button>
        </div>
      </main>
    );
  }

  /* ── Auth card with tabs ── */
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
          {tab === 'login' ? (
            <IconLogin2 size={20} color="white" />
          ) : (
            <IconUserPlus size={20} color="white" />
          )}
        </div>

        {/* Tabs */}
        <div
          className="mx-auto mb-7 flex w-fit gap-1 rounded-lg p-1"
          style={{ backgroundColor: '#f3f4f6' }}
        >
          <button
            type="button"
            onClick={() => switchTab('login')}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition"
            style={
              tab === 'login'
                ? {
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }
                : { color: '#6b7280' }
            }
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition"
            style={
              tab === 'register'
                ? {
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }
                : { color: '#6b7280' }
            }
          >
            Crear cuenta
          </button>
        </div>

        {/* ── Login form ── */}
        {tab === 'login' && (
          <>
            <p className="mt-0 mb-6 text-center text-sm" style={{ color: '#6b7280' }}>
              Ingresa con tu cuenta existente
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
              <div>
                <p
                  className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: '#6b7280', letterSpacing: '0.02em' }}
                >
                  Correo electrónico
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                  style={inputBaseStyle}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <p
                  className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: '#6b7280', letterSpacing: '0.02em' }}
                >
                  Contraseña
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                  style={inputBaseStyle}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                  autoComplete="current-password"
                  required
                />
              </div>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg px-4 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#7f77dd' }}
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          </>
        )}

        {/* ── Register form ── */}
        {tab === 'register' && (
          <>
            <p className="mt-0 mb-6 text-center text-sm" style={{ color: '#6b7280' }}>
              Ingresa tus datos para registrarte
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit}>
              {/* Full name */}
              <div>
                <p
                  className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: '#6b7280', letterSpacing: '0.02em' }}
                >
                  Nombre completo
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                    style={inputBaseStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    required
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellido"
                    className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                    style={inputBaseStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <p
                  className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: '#6b7280', letterSpacing: '0.02em' }}
                >
                  Correo electrónico
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                  style={inputBaseStyle}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                  autoComplete="email"
                  required
                />
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
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border bg-white pr-9 pl-3 text-sm outline-none transition"
                    style={inputBaseStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    autoComplete="new-password"
                    required
                    minLength={8}
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

                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2, 3].map((index) => {
                      const strength = getPasswordStrength(password);
                      return (
                        <div
                          key={index}
                          className="h-[3px] flex-1 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: index < strength ? STRENGTH_COLORS[index] : '#e5e7eb',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Date of birth */}
              <div>
                <p
                  className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                  style={{ color: '#6b7280', letterSpacing: '0.02em' }}
                >
                  Fecha de nacimiento
                </p>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                  style={inputBaseStyle}
                  onFocus={focusHandler}
                  onBlur={blurHandler}
                />
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 text-sm" style={{ color: '#6b7280' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#7f77dd]"
                />
                <span>
                  Acepto los{' '}
                  <span style={{ color: '#7f77dd' }} className="font-medium">
                    Términos y Condiciones
                  </span>
                </span>
              </label>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg px-4 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: '#7f77dd' }}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          </>
        )}

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          {tab === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => switchTab('register')}
                className="font-medium"
                style={{
                  color: '#7f77dd',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Crear cuenta
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="font-medium"
                style={{
                  color: '#7f77dd',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

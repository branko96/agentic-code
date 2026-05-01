'use client';

import { FormEvent, useEffect, useState } from 'react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import type { AuthUser, NavbarConfig } from '../types/auth';

const primaryButtonClassName =
  'inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';
const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [config, setConfig] = useState<NavbarConfig | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [rememberSession, setRememberSession] = useState(false);

  async function loadSession(token: string, nextUser?: AuthUser) {
    const resolvedUser = nextUser ?? (await getMe(token));
    const resolvedConfig = await getConfig(token);

    setUser(resolvedUser);
    setConfig(resolvedConfig);
  }

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    loadSession(token)
      .catch(() => {
        clearToken();
        setUser(null);
        setConfig(null);
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
      await loadSession(response.accessToken, response.user);
      setPassword('');
    } catch (caughtError) {
      setUser(null);
      setConfig(null);
      clearToken();
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setConfig(null);
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

  if (user && config) {
    return (
      <main className="min-h-screen px-6 py-6 text-foreground">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-surface-border bg-surface/90 px-5 py-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div>
            <p className="text-lg font-semibold text-white">{config.appName}</p>
            <p className="text-sm text-muted">
              {config.environment} · {config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-surface-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted">{user.email}</p>
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
        <h1 className="text-3xl font-light tracking-tight text-white">Bienvenido de nuevo</h1>
        <p className="mt-2 text-sm text-slate-400">
          Introduce tus credenciales para acceder a tu cuenta
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nombre@empresa.com"
              className={inputClassName}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
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
              <span>Mantener sesión iniciada</span>
            </label>

            <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
              ¿Has olvidado tu contraseña?
            </a>
          </div>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-slate-400">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="font-medium text-white transition-colors hover:text-indigo-300">
              Regístrate gratis
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}

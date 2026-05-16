'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconUserScan, IconEye, IconEyeOff } from '@tabler/icons-react';
import { register } from '../../lib/auth';
import type { RegisterInput } from '../../types/auth';

function getPasswordStrength(password: string): { label: string; segments: number; color: string } {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Débil', segments: 1, color: 'bg-red-400' };
  if (score <= 2) return { label: 'Regular', segments: 2, color: 'bg-orange-400' };
  if (score <= 3) return { label: 'Buena', segments: 3, color: 'bg-yellow-400' };
  return { label: 'Fuerte', segments: 4, color: 'bg-green-400' };
}

const inputClassName =
  'w-full rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40';

const fieldLabelClassName = 'flex flex-col gap-1.5 text-sm font-medium text-slate-100';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const input: RegisterInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        ...(dateOfBirth ? { dateOfBirth } : {}),
      };

      await register(input);
      router.push('/');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-foreground">
      <section className="w-full max-w-md rounded-3xl border border-surface-border bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15">
            <IconUserScan size={28} className="text-primary" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted">Ingresa tus datos para registrarte</p>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <label className={`${fieldLabelClassName} flex-1`}>
              Nombre
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
                placeholder="Juan"
                autoComplete="given-name"
                required
              />
            </label>
            <label className={`${fieldLabelClassName} flex-1`}>
              Apellido
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
                placeholder="Pérez"
                autoComplete="family-name"
                required
              />
            </label>
          </div>

          <label className={fieldLabelClassName}>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
              placeholder="juan@ejemplo.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={fieldLabelClassName}>
            Contraseña
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClassName} pr-10`}
                placeholder="··········"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </label>

          {password.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((segment) => (
                  <div
                    key={segment}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      segment <= strength.segments ? strength.color : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted text-right">{strength.label}</p>
            </div>
          )}

          <label className={fieldLabelClassName}>
            Fecha de nacimiento
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputClassName}
              max={new Date().toISOString().split('T')[0]}
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 accent-primary rounded"
              required
            />
            <span>
              Acepto los{' '}
              <Link
                href="/terms"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                Términos y Condiciones
              </Link>
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !agreeTerms}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

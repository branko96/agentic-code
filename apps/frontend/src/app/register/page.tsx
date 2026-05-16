'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconMail,
  IconLock,
  IconUser,
  IconCalendar,
  IconEye,
  IconEyeOff,
  IconUserPlus,
} from '@tabler/icons-react';
import { persistToken, register } from '../../lib/auth';

const STRENGTH_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#14b8a6'] as const;

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

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

    if (!agreeTerms) {
      setError('Debes aceptar los Términos y Condiciones');
      setIsSubmitting(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('El nombre completo es obligatorio');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await register({ firstName, lastName, email, password });
      persistToken(response.accessToken);
      router.push('/');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Error al registrarse');
    } finally {
      setIsSubmitting(false);
    }
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
          <IconUserPlus size={20} color="white" />
        </div>

        <h1
          className="text-center text-[22px] font-medium tracking-tight"
          style={{ color: '#111827' }}
        >
          Crear cuenta
        </h1>
        <p className="mt-1.5 text-center text-sm" style={{ color: '#6b7280' }}>
          Ingresa tus datos para registrarte
        </p>

        <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Full name (two side-by-side inputs under one label) */}
          <div>
            <p
              className="mb-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: '#6b7280', letterSpacing: '0.02em' }}
            >
              Nombre completo
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <IconUser
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9ca3af' }}
                />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
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
                  required
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                  className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
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
                  required
                />
              </div>
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
            <div className="relative">
              <IconMail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-[3px] flex-1 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: index < strength ? STRENGTH_COLORS[index] : '#e5e7eb',
                    }}
                  />
                ))}
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
            <div className="relative">
              <IconCalendar
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9ca3af' }}
              />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
              />
            </div>
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
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/" className="font-medium" style={{ color: '#7f77dd' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

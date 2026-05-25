'use client';

import { useState } from 'react';
import { register, persistToken } from '@/lib/auth';
import PasswordStrength from '@/components/auth/password-strength';

type RegisterError = 'email_in_use' | 'network' | null;

type RegisterFormProps = {
  onAuthSuccess: () => void;
  onSwitchToLogin: () => void;
};

function EyeOpenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function RegisterForm({ onAuthSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RegisterError>(null);

  const isDisabled = !firstName || !lastName || !email || !password || !acceptedTerms || isLoading;

  const inputClass =
    'h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await register({ firstName, lastName, email, password });
      persistToken(response.accessToken);
      onAuthSuccess();
    } catch (err) {
      if (err instanceof Error && err.message.includes('already in use')) {
        setError('email_in_use');
      } else {
        setError('network');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error === 'network' && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          Error de conexion. Intentalo de nuevo.
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          NOMBRE
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          className={inputClass}
          autoComplete="given-name"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          APELLIDO
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          className={inputClass}
          autoComplete="family-name"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className={
            error === 'email_in_use'
              ? `${inputClass} ring-2 ring-danger/30 border-danger`
              : inputClass
          }
          autoComplete="email"
          disabled={isLoading}
          required
        />
        {error === 'email_in_use' && (
          <p className="mt-1 text-xs text-danger">Ese email ya esta en uso</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          CONTRASENA
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-10`}
            autoComplete="new-password"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-surface-border bg-surface text-primary focus:ring-primary/30"
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-xs text-muted">
          Acepto los{' '}
          <a href="#" className="text-primary hover:underline">
            Terminos y Condiciones
          </a>{' '}
          y{' '}
          <a href="#" className="text-primary hover:underline">
            Politica de Privacidad
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-flex items-center">
            <SpinnerIcon />
            Creando cuenta...
          </span>
        ) : (
          'Crear cuenta'
        )}
      </button>

      <p className="mt-2 text-center text-sm text-muted">
        Ya tenes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-primary hover:underline"
        >
          Iniciar sesion
        </button>
      </p>
    </form>
  );
}

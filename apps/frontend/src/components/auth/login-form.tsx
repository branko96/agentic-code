'use client';

import { useState } from 'react';
import { login, persistToken } from '@/lib/auth';

type LoginError = 'invalid_credentials' | 'network' | null;

type LoginFormProps = {
  onAuthSuccess: () => void;
  onSwitchToRegister: () => void;
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

export default function LoginForm({ onAuthSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      persistToken(response.accessToken);
      onAuthSuccess();
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        setError('invalid_credentials');
      } else {
        setError('network');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    'h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary';

  const errorInputClass =
    'h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground px-3 text-sm outline-none transition ring-2 ring-danger/30 border-danger';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error === 'network' && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          Error de conexion. Intentalo de nuevo.
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className={error === 'invalid_credentials' ? errorInputClass : inputClass}
          autoComplete="email"
          disabled={isLoading}
          required
        />
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
            className={
              error === 'invalid_credentials' ? `${errorInputClass} pr-10` : `${inputClass} pr-10`
            }
            autoComplete="current-password"
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
        {error === 'invalid_credentials' && (
          <p className="mt-1 text-xs text-danger">Credenciales invalidas</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="inline-flex items-center">
            <SpinnerIcon />
            Iniciando sesion...
          </span>
        ) : (
          'Iniciar sesion'
        )}
      </button>

      <p className="mt-2 text-center text-sm text-muted">
        Sin cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-primary hover:underline"
        >
          Crear una
        </button>
      </p>
    </form>
  );
}

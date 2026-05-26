'use client';

import { useState } from 'react';
import { Input } from '@/components/aria/Input';
import { SubmitButton } from '@/components/aria/SubmitButton';
import { PasswordMeter } from '@/components/aria/PasswordMeter';
import {
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@/components/aria/icons';

type RegisterError = 'email_in_use' | 'network' | null;

type Props = {
  onSubmit: (data: { first: string; last: string; email: string; pass: string }) => Promise<void>;
  loading: boolean;
  success: boolean;
  onSwitchToLogin: () => void;
};

export function RegisterForm({ onSubmit, loading, success, onSwitchToLogin }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<RegisterError>(null);

  const isDisabled = !firstName || !lastName || !email || !password || !acceptedTerms || loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ first: firstName, last: lastName, email, pass: password });
    } catch (err) {
      if (err instanceof Error && err.message.includes('already in use')) {
        setError('email_in_use');
      } else {
        setError('network');
      }
    }
  }

  const eyeToggle = (
    <button
      type="button"
      tabIndex={-1}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onClick={() => setShowPassword((v) => !v)}
      className="text-muted hover:text-foreground transition-colors"
    >
      {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {error === 'network' && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
          Error de conexion. Intentalo de nuevo.
        </div>
      )}

      <Input
        label="NOMBRE"
        type="text"
        placeholder="Nombre"
        icon={<UserIcon />}
        autoComplete="given-name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={loading}
      />

      <Input
        label="APELLIDO"
        type="text"
        placeholder="Apellido"
        icon={<UserIcon />}
        autoComplete="family-name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        disabled={loading}
      />

      <Input
        label="EMAIL"
        type="email"
        placeholder="correo@ejemplo.com"
        icon={<EnvelopeIcon />}
        autoComplete="email"
        error={error === 'email_in_use' ? 'Ese email ya esta en uso' : undefined}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <Input
        label="CONTRASENA"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        icon={<LockIcon />}
        rightSlot={eyeToggle}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <PasswordMeter password={password} />

      <label className="flex items-start gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 accent-[#22d3ee]"
        />
        <span>
          Acepto los{' '}
          <a href="#" className="text-[#22d3ee] hover:underline">
            Terminos y Condiciones
          </a>{' '}
          y la{' '}
          <a href="#" className="text-[#22d3ee] hover:underline">
            Politica de Privacidad
          </a>
        </span>
      </label>

      <SubmitButton isLoading={loading} isSuccess={success} disabled={isDisabled}>
        Crear cuenta
      </SubmitButton>

      <p className="text-sm text-white/50 text-center">
        Ya tenes cuenta?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-[#22d3ee] hover:underline">
          Iniciar sesion
        </button>
      </p>
    </form>
  );
}

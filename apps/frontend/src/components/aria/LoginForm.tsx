'use client';

import { useState } from 'react';
import { Input } from '@/components/aria/Input';
import { SubmitButton } from '@/components/aria/SubmitButton';
import { SocialRow } from '@/components/aria/SocialRow';
import { EnvelopeIcon, LockIcon, EyeOpenIcon, EyeClosedIcon } from '@/components/aria/icons';

type LoginError = 'invalid_credentials' | 'network' | null;

type Props = {
  onSubmit: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
  loading: boolean;
  success: boolean;
  onSwitchToRegister: () => void;
};

export function LoginForm({ onSubmit, loading, success, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<LoginError>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ email, pass: password, remember });
    } catch (err) {
      if (err instanceof Error && err.message.includes('Invalid')) {
        setError('invalid_credentials');
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
        label="EMAIL"
        type="email"
        placeholder="correo@ejemplo.com"
        icon={<EnvelopeIcon />}
        autoComplete="email"
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
        autoComplete="current-password"
        error={error === 'invalid_credentials' ? 'Credenciales invalidas' : undefined}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="accent-[#22d3ee]"
        />
        Recordar sesion
      </label>

      <SubmitButton isLoading={loading} isSuccess={success}>
        Iniciar sesion
      </SubmitButton>

      <SocialRow
        providers={[
          { name: 'Google', onClick: () => {} },
          { name: 'GitHub', onClick: () => {} },
        ]}
        label="O continuar con"
      />

      <p className="text-sm text-white/50 text-center">
        Sin cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[#22d3ee] hover:underline"
        >
          Crear una
        </button>
      </p>
    </form>
  );
}

# Tasks -- ARIA Chunk 4b-ii: LoginForm + RegisterForm + AuthCard + delete v1 auth

**Change**: `claude-c7d6082b-59de-42e2-8506-4f97d11a748c`
**Delivery strategy**: single-pr (est. ~300 lines, under 400 threshold)
**Authoritative source**: design.md (NOT spec files -- design defines controlled composition pattern)

---

## Task 1: Create `apps/frontend/src/components/aria/LoginForm.tsx`

**Depends on**: nothing (uses existing ARIA atoms)
**Est. lines**: ~100

### Requirements

- `'use client'` directive
- **Props** (from design.md):
  ```tsx
  type LoginFormProps = {
    onSubmit: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
    loading: boolean;
    success: boolean;
    onSwitchToRegister: () => void;
  };
  ```
- **Local state**: `email`, `password`, `showPassword`, `remember`, `LoginError` type
- **Error type**: `'invalid_credentials' | 'network' | null`
- **Submit flow**:
  ```
  handleSubmit(e)
    e.preventDefault()
    setError(null)
    try { await onSubmit({ email, pass, remember }); }
    catch (err):
      if err.message.includes('Invalid') -> setError('invalid_credentials')
      else -> setError('network')
  ```
  NOTE: the page's `onLogin` does NOT catch -- errors propagate to the form's catch. The form is responsible for error-to-UI mapping.
- **Form structure**:
  1. Network error banner (conditional): `rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger` with "Error de conexion. Intentalo de nuevo."
  2. Email `<Input label="EMAIL" type="email" placeholder="correo@ejemplo.com" icon={<EnvelopeIcon />} autoComplete="email" />` -- neutral for all errors
  3. Password `<Input label="CONTRASENA" type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={<LockIcon />} rightSlot={eyeToggle} autoComplete="current-password" error={error === 'invalid_credentials' ? 'Credenciales invalidas' : undefined} />`
  4. Remember me checkbox: inline `<input type="checkbox">` + `<label>` for "Recordar sesion" -- UI-only, NOT sent to login()
  5. `<SubmitButton isLoading={loading} isSuccess={success}>Iniciar sesion</SubmitButton>`
  6. Footer link: "Sin cuenta?" + `<button onClick={onSwitchToRegister}>Crear una</button>`
- **Eye toggle**: `rightSlot` with `EyeOpenIcon`/`EyeClosedIcon` and `tabIndex={-1}`, `aria-label`
- **SocialRow** rendered below SubmitButton, inside LoginForm:
  ```tsx
  <SocialRow
    providers={[
      { name: 'Google', onClick: () => {} },
      { name: 'GitHub', onClick: () => {} },
    ]}
    label="O continuar con"
  />
  ```
- **Input disabled state**: `disabled={loading}` on all inputs (eye toggle stays interactive)
- **Imports**:
  ```tsx
  import { useState } from 'react';
  import { Input } from '@/components/aria/Input';
  import { SubmitButton } from '@/components/aria/SubmitButton';
  import { SocialRow } from '@/components/aria/SocialRow';
  import { EnvelopeIcon, LockIcon, EyeOpenIcon, EyeClosedIcon } from '@/components/aria/icons';
  ```

### Verification

- No type errors in component
- Named export (not default) -- design says `export function LoginForm` or `export const LoginForm`

---

## Task 2: Create `apps/frontend/src/components/aria/RegisterForm.tsx`

**Depends on**: Task 1 (same pattern, no strict dependency)
**Est. lines**: ~110

### Requirements

- `'use client'` directive
- **Props** (from design.md):
  ```tsx
  type RegisterFormProps = {
    onSubmit: (data: { first: string; last: string; email: string; pass: string }) => Promise<void>;
    loading: boolean;
    success: boolean;
    onSwitchToLogin: () => void;
  };
  ```
- **Local state**: `firstName`, `lastName`, `email`, `password`, `showPassword`, `acceptedTerms`, `RegisterError` type
- **Error type**: `'email_in_use' | 'network' | null`
- **Submit flow**: Same pattern as LoginForm, but catches `'already in use'` for `email_in_use`
- **Disabled gate**:
  ```tsx
  const isDisabled = !firstName || !lastName || !email || !password || !acceptedTerms || loading;
  ```
- **Form structure**:
  1. Network error banner (same style as LoginForm)
  2. First name `<Input label="NOMBRE" type="text" placeholder="Nombre" icon={<UserIcon />} autoComplete="given-name" />`
  3. Last name `<Input label="APELLIDO" type="text" placeholder="Apellido" icon={<UserIcon />} autoComplete="family-name" />`
  4. Email `<Input label="EMAIL" type="email" placeholder="correo@ejemplo.com" icon={<EnvelopeIcon />} autoComplete="email" error={error === 'email_in_use' ? 'Ese email ya esta en uso' : undefined} />`
  5. Password `<Input label="CONTRASENA" type={showPassword ? 'text' : 'password'} placeholder="••••••••" icon={<LockIcon />} rightSlot={eyeToggle} autoComplete="new-password" />`
  6. `<PasswordMeter password={password} />`
  7. Terms checkbox: inline HTML `<input type="checkbox">` + `<label>` with links to Terminos y Condiciones / Politica de Privacidad (href="#")
  8. `<SubmitButton isLoading={loading} isSuccess={success} disabled={isDisabled}>Crear cuenta</SubmitButton>`
  9. Footer link: "Ya tenes cuenta?" + `<button onClick={onSwitchToLogin}>Iniciar sesion</button>`
- **No SocialRow** -- only LoginForm shows SocialRow
- **Imports**:
  ```tsx
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
  ```

### Verification

- No type errors in component
- Named export (not default)

---

## Task 3: Create `apps/frontend/src/components/aria/AuthCard.tsx`

**Depends on**: Task 1, Task 2 (imports LoginForm and RegisterForm)
**Est. lines**: ~60

### Requirements

- `'use client'` directive
- **Props** (from design.md -- controlled composition):
  ```tsx
  type AuthCardProps = {
    onLogin: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
    onRegister: (data: {
      first: string;
      last: string;
      email: string;
      pass: string;
    }) => Promise<void>;
    loading: boolean;
    success: boolean;
  };
  ```
- **Internal state**: `activeTab: TabId` = `'login'`
- **Rendering structure**:
  ```
  <div className="relative mx-auto w-full max-w-[420px] p-6">
    <Corners color="#22d3ee">
      <div className="flex flex-col items-center gap-6" style={cardStyle}>
        <BrandMark />
        <Tabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'login' ? (
          <LoginForm
            onSubmit={props.onLogin}
            loading={props.loading}
            success={props.success}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        ) : (
          <RegisterForm
            onSubmit={props.onRegister}
            loading={props.loading}
            success={props.success}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
      </div>
    </Corners>
  </div>
  ```
- **Glassmorphism card style** (inline):
  ```tsx
  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(15, 23, 42, 0.6))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: 'inset 0 1px 0 rgba(34, 211, 238, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
  };
  ```
- **Tailwind classes**: `rounded-xl`, `p-6`, `flex flex-col items-center gap-6` on the inner div
- **Imports**:
  ```tsx
  import { useState } from 'react';
  import Tabs from '@/components/aria/Tabs';
  import type { TabId } from '@/components/aria/Tabs';
  import Corners from '@/components/aria/Corners';
  import BrandMark from '@/components/auth/brand-mark';
  import { LoginForm } from './LoginForm';
  import { RegisterForm } from './RegisterForm';
  ```

### Verification

- No type errors
- Correct prop passthrough to forms (onLogin -> LoginForm's onSubmit, onRegister -> RegisterForm's onSubmit)
- Named export (design says `export function AuthCard` -- NOT default)

---

## Task 4: Modify `apps/frontend/src/app/auth/page.tsx`

**Depends on**: Task 3 (needs AuthCard)
**Est. lines**: ~40 changed (net reduction of ~15 lines)

### Requirements

- **Remove imports**:
  ```tsx
  import BrandMark from '@/components/auth/brand-mark';
  import Tabs from '@/components/auth/tabs';
  import LoginForm from '@/components/auth/login-form';
  import RegisterForm from '@/components/auth/register-form';
  ```
- **Add import**:

  ```tsx
  import AuthCard from '@/components/aria/AuthCard';
  ```

  NOTE: If AuthCard uses named export, change to `import { AuthCard } from '@/components/aria/AuthCard'`. Check Task 3's export style.

- **Remove state**:
  ```tsx
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  ```
- **Add state**:
  ```tsx
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  ```
- **Keep**: `useEffect` with `readToken()` auto-redirect (import `useEffect`, `readToken` stay)
- **Keep**: `router` import and `useRouter()` call
- **Remove**: `function handleAuthSuccess() { router.push('/'); }`
- **Add auth lifecycle handlers**:

  ```tsx
  async function onLogin(data: { email: string; pass: string; remember: boolean }) {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await login({ email: data.email, password: data.pass });
      persistToken(response.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      // Error propagates to LoginForm's handleSubmit for UI mapping
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(data: { first: string; last: string; email: string; pass: string }) {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await register({
        firstName: data.first,
        lastName: data.last,
        email: data.email,
        password: data.pass,
      });
      persistToken(response.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }
  ```

  CRITICAL: The page's handlers re-throw errors so they propagate to the form. The form catches and maps to UI states.

- **Replace JSX**: The old card content:

  ```tsx
  <div className="mx-auto w-full max-w-[420px] p-6">
    <BrandMark />
    <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-lg">
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pt-6">
        {activeTab === 'login' ? (
          <LoginForm
            onAuthSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        ) : (
          <RegisterForm
            onAuthSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
      </div>
    </div>
  </div>
  ```

  becomes:

  ```tsx
  <AuthCard onLogin={onLogin} onRegister={onRegister} loading={loading} success={success} />
  ```

- **Remove unused imports**: `useState` can be removed if only `useEffect` is needed (but `useState` IS needed for loading/success). Keep both `useState` and `useEffect`.

- **Final imports**:

  ```tsx
  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { login, register, persistToken, readToken } from '@/lib/auth';
  import AuthCard from '@/components/aria/AuthCard';
  import Background from '@/components/aria/Background';
  import TopBar from '@/components/aria/TopBar';
  import StatusTicker from '@/components/aria/StatusTicker';
  import Footer from '@/components/aria/Footer';
  import { LeftPanel, RightPanel } from '@/components/aria/SidePanels';
  ```

### Verification

- All old v1 imports removed from page.tsx
- Page compiles with no type errors
- Auth lifecycle is correct: page owns loading/success, forms catch errors

---

## Task 5: Delete v1 auth components (4 files)

**Depends on**: Task 4 (page no longer references v1 imports)
**Est. lines**: 0 (deletion only)

### Files to delete

1. `apps/frontend/src/components/auth/login-form.tsx`
2. `apps/frontend/src/components/auth/register-form.tsx`
3. `apps/frontend/src/components/auth/password-strength.tsx`
4. `apps/frontend/src/components/auth/tabs.tsx`

### File to KEEP

- `apps/frontend/src/components/auth/brand-mark.tsx`

### Pre-deletion verification

Grep for remaining references to deleted files:

```bash
rg "@/components/auth/login-form" apps/frontend/src/
rg "@/components/auth/register-form" apps/frontend/src/
rg "@/components/auth/password-strength" apps/frontend/src/
rg "@/components/auth/tabs" apps/frontend/src/
```

All should return zero results.

Post-deletion, verify:

```bash
rg "@/components/auth/brand-mark" apps/frontend/src/
```

Should return exactly 1 result (in `AuthCard.tsx`).

---

## Task 6: Verify build

**Depends on**: Tasks 1-5 all complete
**Est. lines**: 0 (verification only)

### Steps

1. `pnpm install` (if node_modules missing)
2. `pnpm --filter frontend typecheck` -- must pass with zero errors
3. `pnpm --filter frontend build` -- must pass with zero errors
4. Check for any dangling imports to deleted v1 files
5. Verify `apps/frontend/src/components/auth/` contains ONLY `brand-mark.tsx`

### Known issues to watch for

- `Tabs` ARIA component uses `onChange` (NOT `onTabChange` from v1) -- AuthCard already uses correct API
- If AuthCard uses named export (`export function AuthCard`), page must use `{ AuthCard }` import syntax. If default export (`export default function AuthCard`), use `import AuthCard from`. Design doesn't specify; decide in Task 3 and align Task 4.
- `pnpm` is the package manager (not npm) -- use `pnpm build`

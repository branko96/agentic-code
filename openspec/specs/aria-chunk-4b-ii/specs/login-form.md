# LoginForm -- Detailed Spec

**File**: `apps/frontend/src/components/aria/LoginForm.tsx`
**Status**: NEW

---

## 1. TypeScript Types

```typescript
type LoginError = 'invalid_credentials' | 'network' | null;

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

interface LoginFormProps {
  onAuthSuccess: () => void;
  onSwitchToRegister: () => void;
}
```

## 2. Component Contract

### 2.1 Internal State

| State          | Type         | Initial | Description                               |
| -------------- | ------------ | ------- | ----------------------------------------- |
| `email`        | `string`     | `''`    | Controlled email input value              |
| `password`     | `string`     | `''`    | Controlled password input value           |
| `showPassword` | `boolean`    | `false` | Toggles password input type text/password |
| `rememberMe`   | `boolean`    | `false` | "Remember me" checkbox state              |
| `isLoading`    | `boolean`    | `false` | Busy state during submit                  |
| `error`        | `LoginError` | `null`  | Error discriminator; drives UI rendering  |

### 2.2 Rendering Structure

```
<form className="flex flex-col gap-4">
  [network error banner]         // only shown when error === 'network'
  <Input                         // email field
    label="EMAIL"
    type="email"
    placeholder="correo@ejemplo.com"
    icon={<EnvelopeIcon />}
    autoComplete="email"
  />
  <Input                         // password field
    label="CONTRASENA"
    type={showPassword ? 'text' : 'password'}
    placeholder="••••••••"
    icon={<LockIcon />}
    rightSlot={<eye toggle button />}
    autoComplete="current-password"
    error={error === 'invalid_credentials' ? 'Credenciales invalidas' : undefined}
  />
  <label>                        // "Remember me" checkbox row
    <input type="checkbox" /> Recordar sesion
  </label>
  <SubmitButton                  // submit
    isLoading={isLoading}
    disabled={isLoading}
  >
    Iniciar sesion
  </SubmitButton>
  <p>                            // footer switch link
    Sin cuenta?
    <button onClick={onSwitchToRegister}>Crear una</button>
  </p>
</form>
```

### 2.3 Field-Level Error Handling

- **Email field**: No field-level error shown for invalid credentials. The email input remains neutral (no red ring).
- **Password field**: When `error === 'invalid_credentials'`, the `error` prop is passed to the `Input` component. This triggers the red ring (`ring-2 ring-red-400/30 border-red-400`) via Input's internal logic, AND renders the error text below the field: "Credenciales invalidas". The error text uses the `aria-accent`-colored XMarkIcon prefix, matching the Field component's error rendering pattern.
- **Network error**: Banner at the top, inside the `<form>`, ABOVE all fields. Alert-style: `rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger`. Content: "Error de conexion. Intentalo de nuevo.". No field-level styling changes.

### 2.4 Validation Rules (Client-Side)

| Field    | Rule                | When Checked  | Behavior                                                             |
| -------- | ------------------- | ------------- | -------------------------------------------------------------------- |
| email    | Non-empty string    | Before submit | `required` attribute on `<input>`                                    |
| email    | Matches email regex | Before submit | Browser-native `type="email"` validation                             |
| password | Non-empty string    | Before submit | `required` attribute on `<input>`                                    |
| all      | N/A                 | Submit button | `disabled={isLoading}` on button (no JS disabled gating beyond that) |

The v1 form does NOT gate the submit button on `!email || !password` -- it relies on HTML5 `required`. The ARIA version follows the same pattern.

### 2.5 Submit Flow

```
handleSubmit(e)
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    const response = await login({ email, password })
    persistToken(response.accessToken)
    onAuthSuccess()
  } catch (err) {
    if err instanceof Error && err.message.includes('Invalid')
      -> setError('invalid_credentials')
    else
      -> setError('network')
  } finally {
    setIsLoading(false)
  }
```

**Key detail**: `onAuthSuccess()` is called AFTER `persistToken()`. The caller (AuthCard) uses this callback to `router.push('/')`. This means the success redirect happens immediately after token storage, NOT after SubmitButton's 2-second success animation. The SubmitButton `isSuccess` prop is NOT used in LoginForm -- the form navigates away before the success state would render.

### 2.6 Loading State

- All inputs get `disabled={isLoading}` prop
- SubmitButton receives `isLoading={isLoading}` which shows the spinner + "Verificando..." label
- The eye toggle button should NOT be disabled (UX: user may want to verify password before submit finishes)

### 2.7 Error State Matrix

| `error` value           | Visual Effect                                                            | Recovery                          |
| ----------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| `null`                  | Normal form, no error UI                                                 | --                                |
| `'invalid_credentials'` | Password Input shows red ring + "Credenciales invalidas" error text      | User edits any field or resubmits |
| `'network'`             | Banner at top of form: "Error de conexion. Intentalo de nuevo."          | User retries submit               |
| `'network'`             | No field-level error showed -- banner is exclusive to other error states | --                                |

Error resets to `null` on each new submit attempt (line 72 in v1).

### 2.8 Empty/Initial State

- All fields empty
- showPassword = false
- rememberMe = false
- isLoading = false
- error = null
- No error banner visible
- SubmitButton shows "Iniciar sesion" with ArrowRightIcon

### 2.9 Eye Toggle (rightSlot)

The eye toggle button is passed as `rightSlot` to the password Input:

```tsx
const eyeToggle = (
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="text-muted hover:text-foreground"
    tabIndex={-1}
    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
  >
    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
  </button>
);
```

The icons are imported from `@/components/aria/icons` (not inlined).

### 2.10 Footer Link

```tsx
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
```

### 2.11 Imports (Full List)

```typescript
'use client';
import { useState } from 'react';
import { Input } from '@/components/aria/Input';
import { SubmitButton } from '@/components/aria/SubmitButton';
import { login, persistToken } from '@/lib/auth';
import { EnvelopeIcon, LockIcon, EyeOpenIcon, EyeClosedIcon } from '@/components/aria/icons';
```

## 3. Edge Cases

| Scenario                     | Handling                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Empty email submitted        | Browser blocks via `required` + `type="email"` -- native validation tooltip      |
| Empty password submitted     | Browser blocks via `required`                                                    |
| Network timeout              | `apiFetch` throws -> catch block -> `setError('network')`                        |
| Server 500                   | `apiFetch` throws (message won't include 'Invalid') -> `setError('network')`     |
| Wrong password               | `apiFetch` throws with 'Invalid' in message -> `setError('invalid_credentials')` |
| Double-click submit          | `isLoading` is `true` -> button is `disabled` -> no second call                  |
| Rapid form edits during load | Inputs are `disabled={isLoading}` -- no changes accepted                         |
| Remember me checked          | State exists but NOT sent to `login()` -- `LoginInput` type lacks the field      |

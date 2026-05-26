# RegisterForm -- Detailed Spec

**File**: `apps/frontend/src/components/aria/RegisterForm.tsx`
**Status**: NEW

---

## 1. TypeScript Types

```typescript
type RegisterError = 'email_in_use' | 'network' | null;

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

interface RegisterFormProps {
  onAuthSuccess: () => void;
  onSwitchToLogin: () => void;
}
```

## 2. Component Contract

### 2.1 Internal State

| State           | Type            | Initial | Description                               |
| --------------- | --------------- | ------- | ----------------------------------------- |
| `firstName`     | `string`        | `''`    | Controlled first name input value         |
| `lastName`      | `string`        | `''`    | Controlled last name input value          |
| `email`         | `string`        | `''`    | Controlled email input value              |
| `password`      | `string`        | `''`    | Controlled password input value           |
| `showPassword`  | `boolean`       | `false` | Toggles password input type text/password |
| `acceptedTerms` | `boolean`       | `false` | Terms checkbox state                      |
| `isLoading`     | `boolean`       | `false` | Busy state during submit                  |
| `error`         | `RegisterError` | `null`  | Error discriminator; drives UI rendering  |

### 2.2 Rendering Structure

```
<form className="flex flex-col gap-4">
  [network error banner]         // only shown when error === 'network'
  <Input                         // firstName field
    label="NOMBRE"
    type="text"
    placeholder="Nombre"
    icon={<UserIcon />}
    autoComplete="given-name"
  />
  <Input                         // lastName field
    label="APELLIDO"
    type="text"
    placeholder="Apellido"
    icon={<UserIcon />}
    autoComplete="family-name"
  />
  <Input                         // email field
    label="EMAIL"
    type="email"
    placeholder="correo@ejemplo.com"
    icon={<EnvelopeIcon />}
    autoComplete="email"
    error={error === 'email_in_use' ? 'Ese email ya esta en uso' : undefined}
  />
  <Input                         // password field
    label="CONTRASENA"
    type={showPassword ? 'text' : 'password'}
    placeholder="••••••••"
    icon={<LockIcon />}
    rightSlot={<eye toggle button />}
    autoComplete="new-password"
  />
  <PasswordMeter password={password} />
  <div>                          // terms checkbox row
    <input type="checkbox" id="terms" />
    <label htmlFor="terms">
      Acepto los <a href="#">Terminos y Condiciones</a> y <a href="#">Politica de Privacidad</a>
    </label>
  </div>
  <SubmitButton                  // submit
    isLoading={isLoading}
    disabled={isDisabled}        // gated on all fields + terms
  >
    Crear cuenta
  </SubmitButton>
  <p>                            // footer switch link
    Ya tenes cuenta?
    <button onClick={onSwitchToLogin}>Iniciar sesion</button>
  </p>
</form>
```

### 2.3 Field-Level Error Handling

- **Email field**: When `error === 'email_in_use'`, the `error` prop is passed to the email `Input`. This triggers the red ring and error text: "Ese email ya esta en uso".
- **First name, last name, password** fields: Show NO field-level error for any error state.
- **Network error**: Banner at the top, inside the `<form>`, ABOVE all fields. Same style as LoginForm: `rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger`. Content: "Error de conexion. Intentalo de nuevo."
- **Error exclusivity**: `'email_in_use'` and `'network'` are mutually exclusive. Setting one clears the other (via `setError(null)` at submit start).

### 2.4 Validation Rules (Client-Side)

| Field         | Rule                  | When Checked  | Behavior                                                      |
| ------------- | --------------------- | ------------- | ------------------------------------------------------------- |
| firstName     | Non-empty string      | Submit button | Submit button `disabled` via `!firstName` in isDisabled check |
| lastName      | Non-empty string      | Submit button | Submit button `disabled` via `!lastName` in isDisabled check  |
| email         | Non-empty string      | Submit button | Submit button `disabled` via `!email` in isDisabled check     |
| email         | Email regex (browser) | Submit button | Browser-native `type="email"` validation                      |
| password      | Non-empty string      | Submit button | Submit button `disabled` via `!password` in isDisabled check  |
| acceptedTerms | `true`                | Submit button | Submit button `disabled` via `!acceptedTerms` check           |

**Disabled gate** (derived state):

```typescript
const isDisabled = !firstName || !lastName || !email || !password || !acceptedTerms || isLoading;
```

### 2.5 Submit Flow

```
handleSubmit(e)
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    const response = await register({ firstName, lastName, email, password })
    persistToken(response.accessToken)
    onAuthSuccess()
  } catch (err) {
    if err instanceof Error && err.message.includes('already in use')
      -> setError('email_in_use')
    else
      -> setError('network')
  } finally {
    setIsLoading(false)
  }
```

**Same pattern as LoginForm**: `onAuthSuccess()` called AFTER `persistToken()`. The SubmitButton `isSuccess` prop is NOT used -- form navigates before success animation completes.

### 2.6 Loading State

- All inputs get `disabled={isLoading}` prop
- SubmitButton receives `isLoading={isLoading}` which shows the spinner + "Verificando..." label
- Password meter and eye toggle remain interactive (visual-only, no backend impact)

### 2.7 Error State Matrix

| `error` value    | Visual Effect                                                      | Recovery                      |
| ---------------- | ------------------------------------------------------------------ | ----------------------------- |
| `null`           | Normal form, no error UI                                           | --                            |
| `'email_in_use'` | Email Input shows red ring + "Ese email ya esta en uso" error text | User edits email or resubmits |
| `'network'`      | Banner at top of form: "Error de conexion. Intentalo de nuevo."    | User retries submit           |

Error reset: `setError(null)` called at the top of `handleSubmit`.

### 2.8 Empty/Initial State

- All fields empty
- showPassword = false
- acceptedTerms = false
- isLoading = false
- error = null
- No error banner visible
- SubmitButton is DISABLED (gated on all fields + terms)
- PasswordMeter is NOT rendered (password is empty)

### 2.9 Password Meter Integration

```tsx
<PasswordMeter password={password} />
```

Placed IMMEDIATELY after the password `<Input>`, inside the same gap group. The `PasswordMeter` component internally returns `null` when `password` is empty, so no empty visual space is taken in the initial state.

### 2.10 Terms Checkbox

Inline HTML (no ARIA checkbox atom exists yet):

```tsx
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
```

### 2.11 Eye Toggle (rightSlot)

Identical pattern to LoginForm. Uses `EyeOpenIcon` / `EyeClosedIcon` from `@/components/aria/icons`.

### 2.12 Footer Link

```tsx
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
```

### 2.13 Imports (Full List)

```typescript
'use client';
import { useState } from 'react';
import { Input } from '@/components/aria/Input';
import { SubmitButton } from '@/components/aria/SubmitButton';
import { PasswordMeter } from '@/components/aria/PasswordMeter';
import { register, persistToken } from '@/lib/auth';
import {
  EnvelopeIcon,
  LockIcon,
  UserIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@/components/aria/icons';
```

## 3. Edge Cases

| Scenario                      | Handling                                                               |
| ----------------------------- | ---------------------------------------------------------------------- |
| All fields empty              | Submit disabled (`isDisabled = true`)                                  |
| Only email filled             | Submit disabled                                                        |
| Terms unchecked               | Submit disabled                                                        |
| Weak password (empty fields)  | PasswordMeter returns `null` (renders nothing)                         |
| User types 1-char password    | PasswordMeter renders with score 0 -> still `null` (no segments shown) |
| Existing email on server      | `apiFetch` throws with 'already in use' -> `setError('email_in_use')`  |
| Network timeout               | `apiFetch` throws -> catch -> `setError('network')`                    |
| Server 500                    | `apiFetch` throws (generic message) -> `setError('network')`           |
| Double-click submit           | `isDisabled` is `true` -> button is `disabled` -> no second call       |
| Paste into disabled fields    | N/A -- fields are disabled, paste doesn't register                     |
| Terms links have no real href | Uses `href="#"` -- placeholder; follow-up to wire real URLs            |

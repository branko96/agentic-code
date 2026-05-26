# SDD Design -- ARIA Chunk 4b-ii: LoginForm + RegisterForm + AuthCard + delete v1 auth

**Change**: `claude-c7d6082b-59de-42e2-8506-4f97d11a748c`

---

## 1. Architecture: Controlled Composition

The architecture is **controlled composition**: `auth/page.tsx` owns the auth lifecycle (loading, success, token management) and passes callbacks + state DOWN into AuthCard and its children. This inverts the self-contained approach from the spec draft -- the page remains the single source of truth for auth state.

### Rationale

- **Page owns lifecycle** -- token existence check (`useEffect`), `login()`/`register()` calls, `persistToken()`, redirect. Forms are pure presentational shells that manage only field state and client validation.
- **AuthCard is a pure composition shell** -- receives callbacks+state from the page, passes them through to the active form. No router, no auth logic.
- **Testability** -- forms receive all dependencies as props (`onSubmit`, `loading`, `success`). No side-effect coupling to `lib/auth` or `next/navigation`.

### Deviation from spec files

The spec files under `openspec/changes/.../specs/` were generated from the proposal phase and define a self-contained AuthCard. The authoritative task spec (this document) requires controlled composition. All downstream implementation must follow this design, not the spec files.

---

## 2. Component Tree

```
auth/page.tsx                              ← owns: loading, success, onLogin, onRegister, token lifecycle
  └── Background
  └── TopBar
  └── StatusTicker
  └── main (3-column grid)
        ├── LeftPanel
        ├── AuthCard                      ← owns: tab state, glassmorphism styling
        │     ├── Corners                 ← decorative brackets (cyan #22d3ee)
        │     ├── BrandMark               ← kept from v1 (no ARIA equivalent)
        │     ├── Tabs (default export)   ← ARIA Tabs, TabId type, animated pill
        │     ├── LoginForm | RegisterForm← conditional render based on activeTab
        │     └── SocialRow               ← only rendered when LoginForm is active
        └── RightPanel
  └── Footer
```

---

## 3. Data Flow

```
auth/page.tsx
  │
  │  owns: loading (boolean), success (boolean)
  │  owns: onLogin(data) -> calls login() -> persistToken() -> setSuccess ->
  │         1500ms setTimeout -> router.push('/')
  │  owns: onRegister(data) -> calls register() -> persistToken() -> setSuccess ->
  │         1500ms setTimeout -> router.push('/')
  │
  │  passes:
  │    onLogin, onRegister   -> AuthCard -> LoginForm | RegisterForm
  │    loading               -> AuthCard -> LoginForm | RegisterForm -> SubmitButton
  │    success               -> AuthCard -> LoginForm | RegisterForm -> SubmitButton
  │
  ▼
AuthCard
  │
  │  owns: activeTab (TabId)
  │  owns: glassmorphism card styling
  │
  │  passes through:
  │    onSubmit={activeTab === 'login' ? onLogin : onRegister}
  │    loading
  │    success
  │
  ▼
LoginForm | RegisterForm
  │
  │  owns: field state (email, password, firstName, lastName, showPassword, remember/terms)
  │  owns: client-side validation state
  │  owns: error state (login: 'invalid_credentials'|'network'; register: 'email_in_use'|'network')
  │
  │  calls: onSubmit(data) on form submit (does NOT call lib/auth directly)
  │
  │  receives: loading -> disables inputs, shows SubmitButton spinner
  │  receives: success -> shows SubmitButton checkmark
```

---

## 4. Exact Prop Contracts

### 4.1 LoginForm

```tsx
type Props = {
  onSubmit: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
  loading: boolean;
  success: boolean;
};
```

- **Field state**: `email`, `password`, `showPassword`, `remember` -- all local `useState`
- **Error state**: `LoginError` = `'invalid_credentials' | 'network' | null` -- local
- **Client validation**: email regex (HTML `type="email"`), password non-empty (HTML `required`)
- **SocialRow**: Rendered below SubmitButton inside LoginForm (NOT in AuthCard)
- **Footer link**: "Sin cuenta? Crear una" -- calls `onSwitchToRegister` prop (received from AuthCard alongside onSubmit/loading/success)
- **Eye toggle**: `rightSlot` on password Input, uses `EyeOpenIcon`/`EyeClosedIcon` from `@/components/aria/icons`
- **Error model**:
  - `network` banner at top of form: "Error de conexion. Intentalo de nuevo."
  - `invalid_credentials` passed as `error` prop to password Input: red ring + "Credenciales invalidas"
  - Email Input stays neutral for both error types

### 4.2 RegisterForm

```tsx
type Props = {
  onSubmit: (data: { first: string; last: string; email: string; pass: string }) => Promise<void>;
  loading: boolean;
  success: boolean;
};
```

- **Field state**: `firstName`, `lastName`, `email`, `password`, `showPassword`, `acceptedTerms` -- all local `useState`
- **Error state**: `RegisterError` = `'email_in_use' | 'network' | null` -- local
- **Client validation**: CTA disabled unless all fields non-empty + terms checked:
  ```tsx
  const isDisabled = !firstName || !lastName || !email || !password || !acceptedTerms || loading;
  ```
- **PasswordMeter**: Below password Input, wired to `password` state
- **Terms checkbox**: Inline HTML `<input type="checkbox">` + `<label>` (no ARIA atom)
- **No SocialRow** -- only LoginForm shows SocialRow
- **Footer link**: "Ya tenes cuenta? Iniciar sesion" -- calls `onSwitchToLogin` prop
- **Eye toggle**: Same pattern as LoginForm
- **Error model**:
  - `network` banner at top
  - `email_in_use` passed as `error` prop to email Input: red ring + "Ese email ya esta en uso"

### 4.3 AuthCard

```tsx
type Props = {
  onLogin: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
  onRegister: (data: { first: string; last: string; email: string; pass: string }) => Promise<void>;
  loading: boolean;
  success: boolean;
};
```

- **Internal state**: `activeTab: TabId` = `'login'` -- local `useState`
- **Passes through** to the active form:
  - `onSubmit` = `props.onLogin` or `props.onRegister` depending on tab
  - `loading` = `props.loading`
  - `success` = `props.success`
- **Additionally passes** `onSwitchToRegister` (sets tab to `'register'`) and `onSwitchToLogin` (sets tab to `'login'`) to the respective forms
- **Renders**: Corners > BrandMark > Tabs > active form | SocialRow (login only) (all wrapped in glassmorphism card)

### 4.4 auth/page.tsx

```tsx
// Key state
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);

// Auth lifecycle
async function onLogin(data: { email: string; pass: string; remember: boolean }) {
  setLoading(true);
  setSuccess(false);
  try {
    const response = await login({ email: data.email, password: data.pass });
    persistToken(response.accessToken);
    setSuccess(true);
    setTimeout(() => router.push('/'), 1500);
  } catch (err) {
    /* error handled locally */
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
    /* error handled locally */
  } finally {
    setLoading(false);
  }
}
```

- **Token check**: `useEffect` with `readToken()` redirects to '/' if token exists
- **Grid**: `lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]`
- **Layout**: Background, TopBar, StatusTicker, LeftPanel, RightPanel, Footer all unchanged
- **Import**: Single `import AuthCard from '@/components/aria/AuthCard'` replaces all v1 auth imports

### 4.5 v1 deletion

| Action | File                                                      |
| ------ | --------------------------------------------------------- |
| DELETE | `apps/frontend/src/components/auth/login-form.tsx`        |
| DELETE | `apps/frontend/src/components/auth/register-form.tsx`     |
| DELETE | `apps/frontend/src/components/auth/password-strength.tsx` |
| DELETE | `apps/frontend/src/components/auth/tabs.tsx`              |
| KEEP   | `apps/frontend/src/components/auth/brand-mark.tsx`        |

---

## 5. State Ownership Matrix

| State                        | Owned by                     | Why                                                                  |
| ---------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `loading`                    | `auth/page.tsx`              | Single source of truth; SubmitButton in active form reads it as prop |
| `success`                    | `auth/page.tsx`              | Triggers redirect after 1500ms; SubmitButton reads it as prop        |
| `activeTab`                  | `AuthCard`                   | UI-only concern; no impact beyond which form renders                 |
| Field values                 | `LoginForm` / `RegisterForm` | Pure UI state; reset on tab switch via conditional mount/unmount     |
| `showPassword`               | `LoginForm` / `RegisterForm` | Visual toggle; local to each form                                    |
| `remember` / `acceptedTerms` | `LoginForm` / `RegisterForm` | UI-only checkbox state                                               |
| Error state                  | `LoginForm` / `RegisterForm` | Error discriminator drives local UI; page doesn't need to know       |
| Token                        | Browser localStorage         | `persistToken()` / `readToken()` from `@/lib/auth`                   |
| Auth API call                | `auth/page.tsx`              | Page orchestrates `login()`/`register()` and `persistToken()`        |
| Redirect                     | `auth/page.tsx`              | `router.push('/')` after success + timeout                           |

---

## 6. Styling Strategy

### 6.1 Glassmorphism Card (AuthCard)

Applied via inline `style` objects on the card wrapper:

```tsx
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(15, 23, 42, 0.6))',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(34, 211, 238, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(34, 211, 238, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
};
```

Tailwind classes for layout/spacing/typography:

- `rounded-xl`, `p-6`, `flex flex-col items-center gap-6` -- card inner layout
- `font-mono text-[10px] uppercase tracking-wider` -- label typography (handled by Field component)
- `text-white/70`, `text-white/90` -- text opacity for visual hierarchy
- `text-[#22d3ee]` -- cyan accent (aria-accent variable namespace)

### 6.2 Why inline style for glassmorphism?

The `backdropFilter`, `inset boxShadow`, and `linear-gradient` values are too complex for Tailwind arbitrary values and would make the JSX unreadable. Inline `style` keeps the Tailwind classes focused on layout and spacing.

### 6.3 Consistent Cyan Accent (#22d3ee)

- Corners: `color="#22d3ee"` (default)
- Field labels: `text-aria-accent` (maps to #22d3ee)
- Tab active indicator: `bg-surface-elevated` with `shadow-sm`
- SubmitButton: `shadow-[0_0_12px_rgba(34,211,238,0.3)]` cyan glow
- Glassmorphism card: cyan border, cyan gradient overlay, cyan inset shadow

---

## 7. Auth Lifecycle Detail

### 7.1 Login flow

```
User clicks "Iniciar sesion"
  -> handleSubmit(e)
  -> e.preventDefault()
  -> setError(null)
  -> onSubmit({ email, pass, remember })     // calls page's onLogin
  -> page: setLoading(true)
  -> page: const response = await login({ email, password: pass })
  -> page: persistToken(response.accessToken)
  -> page: setSuccess(true)
  -> page: setTimeout(() => router.push('/'), 1500)
  -> on API error:
       catch (err):
         if "Invalid" in message -> form catches "invalid_credentials"
         else -> form catches "network"
  -> finally: form's local loading NOT needed (page manages loading)
```

**Important distinction**: The `loading` and `success` props come from the PAGE. The form does NOT manage `isLoading` or `isSuccess` locally. The error catching happens in the form's `handleSubmit` via try/catch around `onSubmit()`. If the form needs to map API errors to UI states, it does so by catching errors thrown by `onSubmit`:

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  try {
    await onSubmit(data); // if this throws, the form catches it
  } catch (err) {
    if (err instanceof Error && err.message.includes('Invalid')) {
      setError('invalid_credentials');
    } else {
      setError('network');
    }
  }
}
```

This means `login()`/`register()` from `@/lib/auth` throws on error, the page does NOT catch it (lets it propagate to the form), and the form maps the error message to the right UI state. The page's `onLogin` does NOT use try/catch -- errors bubble up to the form's `handleSubmit`.

### 7.2 Register flow

Same pattern as login but with `register()` and `'email_in_use'` / `'network'` error mapping.

### 7.3 Success timeout

- `success = true` triggers SubmitButton's checkmark state ("Acceso concedido")
- `setTimeout(() => router.push('/'), 1500)` gives the user 1.5s to see the success animation
- During this time, `loading=false` but `success=true` -- SubmitButton shows checkmark
- After 1500ms, `router.push('/')` navigates away

---

## 8. Existing ARIA Component APIs (Reference)

### Input

```tsx
<Input
  label="EMAIL"
  type="email"
  placeholder="correo@ejemplo.com"
  icon={<EnvelopeIcon />}
  error={errorString}
  autoComplete="email"
/>
```

- Wraps Field internally
- `rightSlot` for eye toggle (ReactNode, rendered at right edge of input)
- `error` string renders XMarkIcon + error text below field

### SubmitButton

```tsx
<SubmitButton isLoading={loading} isSuccess={success}>
  Iniciar sesion
</SubmitButton>
```

- 3-state: default (children + ArrowRightIcon), loading (SpinnerIcon + "Verificando..."), success (CheckIcon + "Acceso concedido")
- `disabled` when `isLoading || isSuccess`

### Tabs (default export)

```tsx
import Tabs from '@/components/aria/Tabs';
import type { TabId } from '@/components/aria/Tabs';

<Tabs activeTab={activeTab} onChange={setActiveTab} />;
```

- `activeTab: TabId` = `'login' | 'register'`
- `onChange` callback (NOT `onTabChange` -- different from v1)
- Animated sliding pill indicator
- Default tabs: "Iniciar sesion" / "Crear cuenta"

### PasswordMeter

```tsx
<PasswordMeter password={password} />
```

- Returns `null` when password is empty
- 4 segments with color-coded labels: Debil, Media, Fuerte, Muy fuerte

### SocialRow

```tsx
<SocialRow providers={[...]} label="O continuar con" />
```

- Each provider: `{ name: string; onClick: () => void }`
- Rendered only in LoginForm, NOT in AuthCard

### Corners (default export)

```tsx
import Corners from '@/components/aria/Corners';

<Corners color="#22d3ee">...</Corners>;
```

- Decorative corner brackets around children
- Default color: `#22d3ee`

---

## 9. Key Deviations from Spec Files

The spec files in `openspec/changes/.../specs/` were generated from the proposal phase and differ from this design in several ways:

| Aspect                    | Spec files                                                                 | This design (authoritative)                                            |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AuthCard props            | None (self-contained)                                                      | `onLogin`, `onRegister`, `loading`, `success`                          |
| AuthCard owns `useRouter` | Yes                                                                        | No -- page owns it                                                     |
| AuthCard owns auth calls  | Yes (`login()`/`register()`)                                               | No -- page owns them                                                   |
| Form props                | `onAuthSuccess`, `onSwitchToRegister`/`onSwitchToLogin`                    | `onSubmit`, `loading`, `success` + switch callbacks                    |
| Form owns `isLoading`     | Yes                                                                        | No -- `loading` comes from page                                        |
| Auth lifecycle            | Inside form `handleSubmit`                                                 | Page orchestrates, form only catches errors                            |
| SocialRow location        | AuthCard (both tabs)                                                       | LoginForm only                                                         |
| Password field name       | `password`                                                                 | `pass` (in submit data)                                                |
| Remember field name       | `rememberMe`                                                               | `remember`                                                             |
| Register fields names     | `firstName`, `lastName`, `email`, `password`                               | `first`, `last`, `email`, `pass` (in submit data)                      |
| Card styling              | Tailwind classes (`bg-surface/50 backdrop-blur-xl border border-white/10`) | Inline style objects (gradient, blur(12px), cyan border, inner shadow) |

All downstream implementation MUST follow this design, not the spec files.

---

## 10. Edge Cases & Risks

| Scenario                                              | Handling                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Fast tab switching                                    | Conditional render unmounts old form, mounts new -- all local state reset (intentional) |
| Double-click submit                                   | `loading=true` -> SubmitButton disabled -> no duplicate call                            |
| Success + tab switch                                  | `success=true` renders checkmark; switching tabs unmounts form (no issue)               |
| Network timeout                                       | `onSubmit` throws -> form catches -> `setError('network')`                              |
| Server 500 (no "Invalid"/"already in use" in message) | Caught as `'network'`                                                                   |
| Wrong password                                        | `apiFetch` throws with 'Invalid' in message -> `setError('invalid_credentials')`        |
| Email already registered                              | `apiFetch` throws with 'already in use' -> `setError('email_in_use')`                   |
| Both error types simultaneously                       | Mutually exclusive -- `setError(null)` at submit start clears previous                  |
| Token exists on page mount                            | `useEffect` fires -> `router.push('/')` before AuthCard mounts                          |
| AuthCard not yet mounted during token check           | No issue -- token check is in `useEffect`, render always includes AuthCard              |

---

## 11. File Manifest

### New files (3)

| File                                                 | Purpose                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/frontend/src/components/aria/LoginForm.tsx`    | Login form with field state, validation, error handling, SocialRow           |
| `apps/frontend/src/components/aria/RegisterForm.tsx` | Register form with field state, validation, error handling, PasswordMeter    |
| `apps/frontend/src/components/aria/AuthCard.tsx`     | Composition shell: Corners, BrandMark, Tabs, active form, glassmorphism card |

### Modified files (1)

| File                                  | Purpose                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/frontend/src/app/auth/page.tsx` | Replace v1 auth imports with AuthCard; add loading/success state; own auth lifecycle |

### Deleted files (4)

| File                                                      | Replacement              |
| --------------------------------------------------------- | ------------------------ |
| `apps/frontend/src/components/auth/login-form.tsx`        | `aria/LoginForm.tsx`     |
| `apps/frontend/src/components/auth/register-form.tsx`     | `aria/RegisterForm.tsx`  |
| `apps/frontend/src/components/auth/password-strength.tsx` | `aria/PasswordMeter.tsx` |
| `apps/frontend/src/components/auth/tabs.tsx`              | `aria/Tabs.tsx`          |

### Kept files (1)

| File                                               | Reason                               |
| -------------------------------------------------- | ------------------------------------ |
| `apps/frontend/src/components/auth/brand-mark.tsx` | No ARIA equivalent; used by AuthCard |

---

## 12. Implementation Order

1. `LoginForm.tsx` -- local field state, `onSubmit`/`loading`/`success`/`onSwitchToRegister` props, error handling, SocialRow
2. `RegisterForm.tsx` -- local field state, `onSubmit`/`loading`/`success`/`onSwitchToLogin` props, error handling, PasswordMeter, terms checkbox
3. `AuthCard.tsx` -- glassmorphism card style, Corners, BrandMark, Tabs, conditional form render
4. `auth/page.tsx` -- add loading/success state, onLogin/onRegister async handlers, 1500ms redirect, swap imports
5. Delete v1 auth files (keep brand-mark.tsx)
6. Verify: `pnpm build` passes, no dangling imports

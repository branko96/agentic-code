# SDD Explore -- ARIA Chunk 4b-ii: LoginForm + RegisterForm + AuthCard + delete v1 auth

**Change**: `claude-c7d6082b-59de-42e2-8506-4f97d11a748c`

---

## 1. Existing ARIA Component APIs

### 1.1 Input (`apps/frontend/src/components/aria/Input.tsx`)

- **Export**: Named `Input` (via `React.forwardRef`)
- **Props**: `label`, `error?`, `hint?`, `icon?`, `rightSlot?`, plus all standard `InputHTMLAttributes` (except `size`)
- **Internal**: Wraps content in `<Field>` component. Renders a `<div className="relative">` with optional icon (left, `pointer-events-none`), the `<input>` element with cyan focus ring (`#22d3ee`), and optional `rightSlot` (right-aligned).
- **Styling**: `h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground text-sm`. Focus ring: `focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]`.
- **Error state**: Red ring (`ring-2 ring-red-400/30 border-red-400`).
- **Import path**: `@/components/aria/Input`
- **Gap**: No `showPassword`/toggle built-in. The `rightSlot` prop can accept a toggle button for password fields, but Input itself doesn't know about password semantics.

### 1.2 Field (`apps/frontend/src/components/aria/Field.tsx`)

- **Export**: Named `Field`
- **Props**: `label`, `children`, `error?`, `hint?`, `id?`, `className?`
- **Internal**: Renders a `<label htmlFor={id}>` wrapper. Shows label text (uppercase, mono, `text-[10px]` in cyan `text-aria-accent`). Below children: shows error with `XMarkIcon` and `role="alert"`, OR hint (if no error).
- **Color scheme**: Uses `text-aria-accent` for labels, `text-red-400` for errors -- this is the ARIA cyan aesthetic, NOT the design system tokens (`--primary`/`--danger`).
- **Import path**: `@/components/aria/Field`

### 1.3 SubmitButton (`apps/frontend/src/components/aria/SubmitButton.tsx`)

- **Export**: Named `SubmitButton` (via `React.forwardRef`)
- **Props**: `isLoading?`, `isSuccess?`, `loadingLabel?` (default `'Verificando'`), `children`, plus all `ButtonHTMLAttributes`
- **3-state machine**: Loading (SpinnerIcon + loading dots animation) -> Success (CheckIcon + "Acceso concedido") -> Default (children + ArrowRightIcon)
- **Styling**: `w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_12px_rgba(34,211,238,0.3)]`
- **Import path**: `@/components/aria/SubmitButton`
- **Gap**: The success label "Acceso concedido" is hardcoded (Spanish). The loading text has `loadingLabel` prop. The default state shows `children` + arrow -- login/register forms need to pass their own label text as children.

### 1.4 SocialRow (`apps/frontend/src/components/aria/SocialRow.tsx`)

- **Export**: Named `SocialRow`
- **Props**: `providers: { name: string; onClick: () => void }[]`, `label?` (default `'Or continue with'`), `className?`
- **Styling**: Rounded bordered surface container. Each provider is a full-width button.
- **Import path**: `@/components/aria/SocialRow`

### 1.5 PasswordMeter (`apps/frontend/src/components/aria/PasswordMeter.tsx`)

- **Export**: Named `PasswordMeter` + named `strengthOf` utility function
- **Props**: `password: string`
- **Internal**: Returns `null` when password empty. Computes score (0-4) via `strengthOf()`. Renders 4 segments with dynamic colors (`#f87171`, `#fbbf24`, `#34d399`, `#22d3ee`). Label: `"Debil"`, `"Media"`, `"Fuerte"`, `"Muy fuerte"`.
- **Colors**: Uses hex values directly (not CSS variables). The v1 `password-strength.tsx` uses the design system's `danger`/`warning`/`success` tokens.
- **Styling**: `h-1` segments (v1 uses `h-[3px]`). Label in `text-aria-accent/50` mono.
- **Import path**: `@/components/aria/PasswordMeter`
- **Gap**: Label color and overall styling follow ARIA aesthetic, not the design system tokens used in v1.

### 1.6 Tabs (`apps/frontend/src/components/aria/Tabs.tsx`)

- **Export**: Default export
- **Props**: `activeTab: TabId` (`'login' | 'register'`), `onChange: (tab: TabId) => void`, `tabs?` (defaults to login/register)
- **Internal**: Animated sliding indicator (`transform: translateX`). Uses `bg-surface-elevated` for the sliding pill.
- **Button event**: `onChange` (note: v1 auth tabs uses `onTabChange`).
- **Import path**: Not directly exported -- this is the default export from `@/components/aria/Tabs`

### 1.7 Corners (`apps/frontend/src/components/aria/Corners.tsx`)

- **Export**: Default `Corners`
- **Props**: `color?` (default `'#22d3ee'`), `children`
- **Internal**: Renders decorative corner brackets around children (4 corner divs with border lines, inset absolutely).
- **Styling**: `w-3 h-3` corner brackets, custom border color via `style`.
- **Import path**: `@/components/aria/Corners`

### 1.8 Icons (`apps/frontend/src/components/aria/icons.tsx`)

**Available named exports**: `EyeOpenIcon`, `EyeClosedIcon`, `SpinnerIcon`, `CheckIcon`, `XMarkIcon`, `EnvelopeIcon`, `LockIcon`, `UserIcon`, `KeyIcon`, `ArrowRightIcon`, `FingerprintIcon`

All are 16x16 SVG components with `aria-hidden="true"`. Relevant for auth: `EyeOpenIcon`, `EyeClosedIcon` (password toggle), `EnvelopeIcon`, `LockIcon`, `UserIcon`.

**Import path**: `@/components/aria/icons`

---

## 2. Existing V1 Auth Components (to be replaced/deleted)

All located at `apps/frontend/src/components/auth/`:

| File                    | Size       | Status                                                |
| ----------------------- | ---------- | ----------------------------------------------------- |
| `login-form.tsx`        | 5381 bytes | **To replace** with aria-based version                |
| `register-form.tsx`     | 7221 bytes | **To replace** with aria-based version                |
| `tabs.tsx`              | 998 bytes  | **To replace** with `@/components/aria/Tabs`          |
| `brand-mark.tsx`        | 802 bytes  | **To keep?** (no aria equivalent exists yet)          |
| `password-strength.tsx` | 1143 bytes | **To replace** with `@/components/aria/PasswordMeter` |

### V1 LoginForm (`login-form.tsx`)

- **State**: `email`, `password`, `showPassword`, `isLoading`, `error` (type `LoginError = 'invalid_credentials' | 'network' | null`)
- **Props**: `onAuthSuccess`, `onSwitchToRegister`
- **Error handling**: Catches error messages from `apiFetch` (string matching, no HTTP status codes). 401 -> invalid_credentials. Other -> network.
- **UI**: Inline SVGs for eye icons and spinner. Error banner at top for network errors. Inline error on password field for 401. Bottom link: "Sin cuenta? Crear una".
- **API**: Calls `login()` from `@/lib/auth`, then `persistToken()`.
- **Styling**: Uses design system tokens (`bg-surface`, `text-muted`, `danger`, `primary`). No ARIA styling.

### V1 RegisterForm (`register-form.tsx`)

- **State**: `firstName`, `lastName`, `email`, `password`, `showPassword`, `acceptedTerms`, `isLoading`, `error` (type `RegisterError = 'email_in_use' | 'network' | null`)
- **Props**: `onAuthSuccess`, `onSwitchToLogin`
- **Fields**: firstName, lastName, email, password (with show/hide), terms checkbox.
- **Validation**: CTA disabled unless all fields filled AND terms checked.
- **Error handling**: 409 -> email_in_use inline error. Other -> network banner.
- **Password meter**: Uses `PasswordStrength` from `@/components/auth/password-strength`.
- **API**: Calls `register()` from `@/lib/auth`, then `persistToken()`.
- **Bottom link**: "Ya tenes cuenta? Iniciar sesion".
- **Styling**: Design system tokens (same as v1 LoginForm).

---

## 3. Existing Auth Page (`apps/frontend/src/app/auth/page.tsx`)

**Current state** (already enriched with ARIA HUD from chunk 2/4):

- Imports: `Background`, `TopBar`, `StatusTicker`, `Footer` from `@/components/aria/`; `LeftPanel`, `RightPanel` from `@/components/aria/SidePanels`; v1 auth components.
- Layout: Full HUD chrome (Background, TopBar, StatusTicker, main + side panels, Footer).
- Card: `max-w-[420px]`, `bg-surface border border-surface-border rounded-xl shadow-lg p-6`.
- Uses v1 auth imports: `BrandMark` from `@/components/auth/brand-mark`, `Tabs` from `@/components/auth/tabs`, `LoginForm` from `@/components/auth/login-form`, `RegisterForm` from `@/components/auth/register-form`.

---

## 4. Auth Library (`apps/frontend/src/lib/auth.ts`)

- **Functions**: `readToken()`, `persistToken()`, `clearToken()`, `register()`, `login()`, `getMe()`, `getConfig()`
- **Token storage**: `localStorage` key `'accessToken'`
- **API**: Uses `apiFetch` which throws `Error` with server message strings (no HTTP status code enumeration available). The error message matching approach is fragile.
- **Types**: `AuthResponse` (has `accessToken`), `AuthUser`, `LoginInput`, `RegisterInput`, `NavbarConfig`

---

## 5. Design Image Analysis

The design image at `/home/branko/workspaces/claudeclaw-sdd-engram/panel/.data/uploads/.../8ab1a256-4fb8-43e9-859e-52fefabe06bf.png` (1378x850, 134KB) appears to be a mostly transparent/empty canvas. No visual design reference could be extracted. The design intent should be inferred from:

- The existing v1 auth page layout (references documented in the design docs for `claude-8553af7a`)
- The ARIA design aesthetic (cyan-on-dark, terminal/HUD style) visible in the implemented ARIA components
- The existing design spec (`openspec/specs/claude-8553af7a-ee97-4094-af85-355a427b2323/`)

---

## 6. Identified Gaps & Decisions Required

### API mismatch between ARIA components and v1 auth

| Aspect               | V1 auth (design system tokens) | ARIA components (aria-\* tokens)            |
| -------------------- | ------------------------------ | ------------------------------------------- |
| Label color          | `text-muted` (gray)            | `text-aria-accent` (cyan)                   |
| Error color          | `text-danger` (red CSS var)    | `text-red-400` (hardcoded)                  |
| Focus ring           | `focus:ring-primary/30`        | `focus:ring-[#22d3ee]/30`                   |
| Font                 | System sans-serif              | `font-mono` on labels                       |
| Input height         | `h-10 sm:h-11`                 | `h-10 sm:h-11` (same)                       |
| Password meter label | `text-xs text-muted`           | `font-mono text-[10px] text-aria-accent/50` |

The v1 forms use the design system tokens (`--primary`, `--muted`, `--danger`, `--success`, `--warning`) defined in `globals.css` and mapped in `tailwind.config.ts`. The ARIA components use dedicated `aria-*` CSS variables (`--aria-accent`, etc.). These are separate token namespaces -- they happen to share the same hex values (e.g., `#22d3ee` for both `--primary` and `--aria-accent`) but are independent.

### Tasks to implement

1. **Create `AuthCard`** (`@/components/aria/AuthCard.tsx`): An orchestrator/wrapper component that composes `Tabs`, `LoginForm`, `RegisterForm`, and `BrandMark` into a single self-contained card. Props: `onAuthSuccess`, `onSwitchToRegister`, `onSwitchToLogin`.

2. **Create `LoginForm`** (`@/components/aria/LoginForm.tsx`): Use ARIA components (`Input`, `SubmitButton`). Password field uses `Input` with `rightSlot` for eye toggle icon from `icons.tsx`. No `Field` error states for 401 -- error banner at top instead (mutually exclusive). Submit calls `login()` from `@/lib/auth`.

3. **Create `RegisterForm`** (`@/components/aria/RegisterForm.tsx`): Similar to LoginForm but with firstName, lastName, email, password fields. Uses `PasswordMeter` from `@/components/aria/PasswordMeter`. Includes terms checkbox. Submit calls `register()` from `@/lib/auth`.

4. **Update `auth/page.tsx`**: Replace v1 auth imports with aria equivalents. Remove `BrandMark`, `Tabs`, `LoginForm`, `RegisterForm` from `@/components/auth/`. Import from `@/components/aria/` instead.

5. **Delete v1 auth components**: Remove the `@/components/auth/` directory files that have been replaced (login-form.tsx, register-form.tsx, password-strength.tsx, tabs.tsx). Keep `brand-mark.tsx` unless a replacement is built.

### Architectural notes

- The `Input` component already wraps `<Field>` so label/error/hint are handled -- LoginForm and RegisterForm should delegate error display to `Input`'s `error` prop rather than rendering their own error elements.
- The `SubmitButton` 3-state machine handles loading and success states -- forms don't need to manage spinner/check animation manually.
- Password toggle needs to go in `Input`'s `rightSlot` since `Input` uses the `Field` label pattern (which replaces the old explicit `<label>` elements).
- The terms checkbox is NOT covered by any existing ARIA component -- it will need inline HTML or a small helper component.
- The v1 `brand-mark.tsx` has no ARIA equivalent yet; either create one or keep it as is.

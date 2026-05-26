# SDD Proposal -- ARIA Chunk 4b-ii: LoginForm + RegisterForm + AuthCard + delete v1 auth

**Change**: `claude-c7d6082b-59de-42e2-8506-4f97d11a748c`

---

## Goal

Replace the remaining v1 auth components (login-form, register-form, password-strength, tabs) with ARIA atoms and composition-based forms, then delete the v1 `@/components/auth/` directory.

## What Exists (ARIA atoms already built)

| Component                  | Import                            | Role in this change                                                                    |
| -------------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| `Input`                    | `@/components/aria/Input`         | All form fields; wraps Field internally, accepts `label`, `error`, `icon`, `rightSlot` |
| `SubmitButton`             | `@/components/aria/SubmitButton`  | Submit button with built-in loading/spinner/success 3-state machine                    |
| `PasswordMeter`            | `@/components/aria/PasswordMeter` | Password strength indicator for register form                                          |
| `Tabs` (default export)    | `@/components/aria/Tabs`          | Login/register tab switcher in AuthCard                                                |
| `Corners` (default export) | `@/components/aria/Corners`       | Decorative corner brackets around AuthCard                                             |
| `SocialRow`                | `@/components/aria/SocialRow`     | Social login provider buttons                                                          |
| Icons                      | `@/components/aria/icons`         | `EyeOpenIcon`, `EyeClosedIcon`, `EnvelopeIcon`, `LockIcon`, `UserIcon`                 |
| `BrandMark`                | `@/components/auth/brand-mark`    | **Kept as-is** -- no ARIA equivalent yet                                               |

## What's New

### 1. `apps/frontend/src/components/aria/LoginForm.tsx`

- **Props**: `onAuthSuccess: () => void`, `onSwitchToRegister: () => void`
- **State**: email, password, showPassword, isLoading, error (`'invalid_credentials' | 'network' | null`)
- **Fields**: email (Input + EnvelopeIcon), password (Input + LockIcon + EyeOpen/EyeClosed via `rightSlot`)
- **Remember me**: checkbox below password field
- **Validation**: client-side email regex and non-empty password before submit
- **Error model**: network banner at top (Input field remains neutral), invalid_credentials shown as inline `error` prop on password Input
- **Submit**: calls `login()` from `@/lib/auth`, then `persistToken()`, then `onAuthSuccess()`. Error falls through to catch.
- **Footer link**: "Sin cuenta? Crear una" triggers `onSwitchToRegister`

### 2. `apps/frontend/src/components/aria/RegisterForm.tsx`

- **Props**: `onAuthSuccess: () => void`, `onSwitchToLogin: () => void`
- **State**: firstName, lastName, email, password, showPassword, acceptedTerms, isLoading, error (`'email_in_use' | 'network' | null`)
- **Fields**: firstName (Input + UserIcon), lastName (Input + UserIcon), email (Input + EnvelopeIcon), password (Input + LockIcon + eye toggle via `rightSlot`)
- **PasswordMeter**: below password field, wired to `strengthOf`
- **Terms checkbox**: inline HTML checkbox with label linking to Terms/Privacy (no ARIA atom exists for this)
- **Validation**: CTA disabled unless all fields non-empty + terms checked
- **Submit**: calls `register()` from `@/lib/auth`, then `persistToken()`, then `onAuthSuccess()`
- **Footer link**: "Ya tenes cuenta? Iniciar sesion" triggers `onSwitchToLogin`

### 3. `apps/frontend/src/components/aria/AuthCard.tsx`

- **Props**: none (self-contained; manages activeTab state internally)
- **Layout**: Corners wrapper -> BrandMark -> Tabs (login/register) -> active form (LoginForm or RegisterForm) -> SocialRow
- **Internal logic**: manages `activeTab` state, passes `onAuthSuccess` and `onSwitchToLogin`/`onSwitchToRegister` to the active form
- **Styling**: glassmorphism card (`bg-surface/50 backdrop-blur-xl border border-white/10`) matching the ARIA aesthetic

### 4. `apps/frontend/src/app/auth/page.tsx` (modify)

- **Remove imports**: `@/components/auth/brand-mark`, `@/components/auth/tabs`, `@/components/auth/login-form`, `@/components/auth/register-form`
- **Add import**: `AuthCard` from `@/components/aria/AuthCard`
- **Replace**: the BrandMark/Tabs/LoginForm/RegisterForm composition with `<AuthCard />`
- **No other layout changes**: Background, TopBar, StatusTicker, SidePanels, Footer remain untouched
- **Callback**: AuthCard's internal `onAuthSuccess` calls `router.push('/')` (same as current)

### 5. `apps/frontend/src/components/auth/` (delete)

- **Remove**: `login-form.tsx`, `register-form.tsx`, `password-strength.tsx`, `tabs.tsx`
- **Keep**: `brand-mark.tsx` (no ARIA replacement exists; still imported by AuthCard)

## Architectural Decisions

1. **AuthCard owns the compose, not the page**. By making AuthCard self-contained (manages its own tab state, owns the Corners/BrandMark/Tabs/Forms/SocialRow composition), the auth page becomes a thin shell. This also makes AuthCard reusable -- it could be mounted in a modal, a settings page, etc.

2. **Error propagation from lib/auth**. Currently `apiFetch` throws `Error(message)` with no `.status` or `.code` property. The v1 forms use string matching (`message.includes('Invalid')`, `message.includes('already in use')`). This proposal keeps the same pattern (string matching on the error message) for now, with a recommendation to add HTTP status propagation to `apiFetch` in a follow-up. This is the lowest-risk path.

3. **Password toggle via Input's rightSlot**. The `Input` component accepts a `rightSlot` render prop. The eye toggle button is passed as `rightSlot` -- it controls local `showPassword` state in LoginForm/RegisterForm and changes the input's `type` between `"text"` and `"password"`.

4. **BrandMark kept in v1 directory**. Creating an ARIA-style BrandMark is out of scope for this chunk. The existing component works fine and is small (802 bytes). AuthCard imports it directly from `@/components/auth/brand-mark`.

5. **Terms checkbox is inline**. No existing ARIA atom handles a labeled checkbox. Rather than over-engineer, use a plain `<input type="checkbox">` + `<label>` with ARIA-compatible styling. This can be extracted into a `Checkbox` atom in a future chunk.

## Risks

| Risk                                                                                     | Impact                                                | Mitigation                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tabs` is a **default export** from `@/components/aria/Tabs`; v1 used default export too | Low -- same import pattern                            | Verify import in AuthCard: `import Tabs from '@/components/aria/Tabs'`                                                                                                                                                                                                                                                                        |
| `Tabs` uses `onChange` callback; v1 used `onTabChange`                                   | Medium -- API mismatch                                | AuthCard passes `onChange={setActiveTab}` to Tabs                                                                                                                                                                                                                                                                                             |
| `SubmitButton` success label "Acceso concedido" is hardcoded                             | Low -- shows briefly, Spanish UI is consistent        | No action needed; matches existing locale                                                                                                                                                                                                                                                                                                     |
| `SubmitButton` success duration is ~2s before reverting to default state                 | Medium -- forms need to redirect after success        | AuthCard's `onAuthSuccess` callback fires after `persistToken()`, which happens in the form BEFORE SubmitButton's success animation starts. Either: (a) skip `isSuccess` state and let the v1 pattern (redirect in form catch) drive it, or (b) use a brief `setTimeout` to show success before redirect. Recommend (a) for v1 compatibility. |
| `apiFetch` errors carry no `.status` field; string matching is fragile                   | Low for now -- matches what v1 does                   | Recommendation: add `error.status: number` to `apiFetch` thrown errors in a follow-up chunk                                                                                                                                                                                                                                                   |
| `rememberMe` in LoginForm: `LoginInput` type doesn't include it                          | Low -- checkbox is UI-only unless backend supports it | Add a `rememberMe` field to `LoginInput` AND `register()` in `@/lib/auth.ts` only if the backend accepts it. Otherwise keep it purely as UI state.                                                                                                                                                                                            |
| AuthCard brings both `login()` and `register()` imports; one always unused per render    | Negligible -- tree-shaken                             | No action needed                                                                                                                                                                                                                                                                                                                              |
| `BrandMark` lives in `@/components/auth/` which is being deleted                         | Blocker -- AuthCard needs it                          | Keep the directory with ONLY `brand-mark.tsx`. Do NOT delete the directory entirely; delete only the 4 files listed above.                                                                                                                                                                                                                    |

## Dependency Graph

```
AuthCard
  ├── Corners (decorative)
  ├── BrandMark (kept from v1)
  ├── Tabs (existing ARIA atom)
  ├── LoginForm (NEW)
  │   ├── Input (existing)
  │   ├── SubmitButton (existing)
  │   └── icons (existing)
  ├── RegisterForm (NEW)
  │   ├── Input (existing)
  │   ├── SubmitButton (existing)
  │   ├── PasswordMeter (existing)
  │   └── icons (existing)
  └── SocialRow (existing)
```

## Implementation Order

1. Create `LoginForm.tsx`
2. Create `RegisterForm.tsx`
3. Create `AuthCard.tsx`
4. Modify `auth/page.tsx` to use AuthCard
5. Delete v1 auth files (keep brand-mark.tsx)
6. If needed: add `rememberMe` to `LoginInput` and `register()` in `@/lib/auth.ts`

## Test plan

- Build succeeds with no type errors
- LoginForm: email validation catches bad format, empty password is blocked, valid credentials submit, invalid credentials show inline error, network error shows banner
- RegisterForm: empty fields disabled, terms unchecked disabled, valid submit works, email_in_use shows inline error
- AuthCard: tab switching works, form switch links work, success redirects to `/`
- v1 auth imports are gone; `@/components/auth/` contains only `brand-mark.tsx`

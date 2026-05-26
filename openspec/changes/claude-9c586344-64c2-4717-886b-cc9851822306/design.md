# ARIA Chunk 4a — Form Atoms: Design Document

## Overview

This document captures the architectural decisions for five new atomic ARIA presentation
components: `icons.tsx`, `Field.tsx`, `Input.tsx`, `Tabs.tsx`, and `PasswordMeter.tsx`.
These extract inline SVGs and duplicated form patterns from `login-form.tsx` and
`register-form.tsx` into reusable, presentational-only atoms under
`apps/frontend/src/components/aria/`.

---

## 1. Component Tree / Composition Hierarchy

```
page.tsx (auth)
  +-- Tabs                          ← segmented control (login/register switcher)
  +-- Field (via Input)             ← label + children + error/hint
  |     +-- Input                   ← styled <input> with icon slots, forwardRef
  |           +-- icons (left slot) ← EnvelopeIcon, LockIcon, UserIcon
  |           +-- rightSlot         ← password toggle (EyeOpenIcon / EyeClosedIcon)
  +-- PasswordMeter                 ← standalone, sibling to Input in register form
  |     +-- (no children)           ← renders 4-segment bar + label
```

**Key relationships:**

- `Field` wraps `Input`, but `Input` composes `Field` internally (not the other way
  around). Consumers render `<Input>` and get Field's label/error/hint automatically.
- `PasswordMeter` is a standalone sibling — it receives the raw `password` string as a
  prop and sits below the password `Input` in the consumer's template.
- `icons.tsx` is a leaf module — its components are imported by `Field` (XMarkIcon for
  error state), `Input` consumers (EnvelopeIcon, LockIcon, UserIcon as left icons),
  and form consumers (EyeOpenIcon/EyeClosedIcon as password toggle, SpinnerIcon for
  submit button).
- These atoms slot into the existing layout from chunk 3:
  ```
  3-column grid: [LeftPanel] [form card: BrandMark + Tabs + LoginForm/RegisterForm] [RightPanel]
  ```
  The form card renders inside the center column (max-w-[420px]). The Tabs replace the
  current `components/auth/tabs.tsx`, and form bodies replace `login-form.tsx` /
  `register-form.tsx` during chunk 4b.

---

## 2. Props Design Rationale

### icons.tsx — zero-props stateless SVGs

Each icon is `() => JSX.Element`. No props, no configuration. Rationale:

- Icons are fixed at 16x16 — the consuming parent controls size via `font-size` or
  wrapper `<span>`.
- `currentColor` stroke/fill means the parent controls colour via CSS `color`.
- `aria-hidden="true"` is hardcoded — icons are always decorative in this auth context.
- No size variants, no colour variants, no state. If a future consumer needs a different
  size, they wrap the icon in a sized container: `<span className="h-5 w-5"><EyeOpenIcon /></span>`.

### Field.tsx — single-responsibility wrapper

| Prop        | Why                                                            |
| ----------- | -------------------------------------------------------------- |
| `label`     | Always string. No ReactNode — keeps rendering predictable.     |
| `children`  | Single slot — always the input/control.                        |
| `error`     | Takes precedence over `hint`. Never co-exist in DOM.           |
| `hint`      | Hidden when `error` is set. Conditional render (not just CSS). |
| `id`        | Maps to `htmlFor` on `<label>`. Required for accessibility.    |
| `className` | Appended to wrapper for consumer-level overrides.              |

No state ownership. Field is a pure rendering function of its props. The consumer
manages error/hint state and passes it down.

### Input.tsx — forwarded ref, composable slots

| Prop        | Why                                                                                |
| ----------- | ---------------------------------------------------------------------------------- |
| `label`     | Passed through to Field.                                                           |
| `error`     | Passed through to Field (error ring + message).                                    |
| `hint`      | Passed through to Field.                                                           |
| `icon`      | ReactNode slot — left-aligned, pointer-events-none.                                |
| `rightSlot` | ReactNode slot — right-aligned, pointer-events enabled.                            |
| `className` | Merged onto the `<input>` element.                                                 |
| (spread)    | All native `<input>` attributes (type, placeholder, autoComplete, etc.) forwarded. |

`forwardRef` is mandatory for form library compatibility (react-hook-form's
`register()` passes a ref). The `id` prop is required — keeps Input server-component
compatible (avoids `useId()` and the `'use client'` directive).

### Tabs.tsx — fully controlled

| Prop        | Why                                            |
| ----------- | ---------------------------------------------- |
| `activeTab` | Controlled from parent — no internal state.    |
| `onChange`  | Callback when user clicks a tab.               |
| `tabs`      | Optional override. Defaults to Spanish labels. |

Pure controlled component — no `useState`, no `'use client'`. The parent owns the
state, Tabs only renders and fires `onChange`.

### PasswordMeter.tsx — single prop, pure render

| Prop       | Why                                                           |
| ---------- | ------------------------------------------------------------- |
| `password` | The raw password string. Component returns `null` when falsy. |

Single-prop means zero configuration. The scoring function is a separate named export
(`strengthOf()`) for testability and reuse.

---

## 3. Styling Strategy — Inline Styles vs Tailwind

The codebase uses Tailwind CSS with custom ARIA colour tokens defined in
`globals.css` and mapped in `tailwind.config.ts`:

- `aria-accent`: `#22d3ee` (cyan)
- `aria-bg`: `#09090b` (near-black)
- `aria-accent-soft`: `rgba(34, 211, 238, 0.12)`
- `success` / `danger` / `warning`: standard semantic colours

**Decision: Tailwind for static styles, inline `style={{}}` for dynamic/calculated
values.**

Examples:

| Component      | Tailwind classes                                 | Inline style                  | Why                           |
| -------------- | ------------------------------------------------ | ----------------------------- | ----------------------------- |
| All icons      | `aria-hidden="true"`                             | —                             | Static attributes             |
| Field label    | `font-mono text-[10px] uppercase tracking-wider` | —                             | Static                        |
| Input focus    | `focus:ring-2 focus:ring-[#22d3ee]/30`           | —                             | Static via Tailwind arbitrary |
| Tabs indicator | `transition-transform duration-200 ease-out`     | `transform: translateX(...)`  | Dynamic based on `activeTab`  |
| PasswordMeter  | `h-1 flex-1 rounded-full transition-colors`      | `backgroundColor` per segment | Dynamic based on `score`      |

**Why inline styles for dynamic values:**

- Tailwind does not support dynamic class construction at runtime (`bg-[${color}]` is
  not valid Tailwind — the JIT engine doesn't see interpolated strings).
- For PasswordMeter, segment colours are calculated per-render based on score. Using
  inline `style={{ backgroundColor }}` is the correct approach.
- For Tabs indicator, `translateX` needs to respond to `activeTab` — inline style is
  necessary and GPU-accelerated via CSS `transform`.
- The focus glow uses the exact cyan hex (`#22d3ee`) via Tailwind's arbitrary value
  syntax (`focus:ring-[#22d3ee]/30`), which IS valid because it's a static string.

**Glow effects:**

- Input focus glow: Tailwind `focus:ring-2 focus:ring-[#22d3ee]/30` + arbitrary border
  colour. This avoids inline styles for the glow while keeping the colour consistent
  with the ARIA accent token.
- PasswordMeter segments: inline style only for the filled colour. Empty segments use
  `rgba(255,255,255,0.1)` as an inline style.
- Submit button glow (in chunk 4b form integration): `shadow-[0_0_20px_rgba(34,211,238,0.3)]`
  — this is a static value and can be a Tailwind arbitrary shadow.

**Conditional class merging:**

The spec references `cn()` (a `clsx` + `tailwind-merge` utility pattern). However, the
current project has zero class-merging utilities installed. Decision: use simple
**template literal string concatenation** for conditional classes:

```tsx
// Instead of: cn('base', icon && 'pl-9', error && 'ring-2 ring-red-400/30')
className={`base-classes ${icon ? 'pl-9' : 'pl-3'} ${error ? 'ring-2 ring-red-400/30 border-red-400' : ''}`}
```

This avoids adding a dependency (`clsx` / `tailwind-merge`) for only two components
that need conditional classes. If the pattern grows to 5+ components, add `clsx`
as a lightweight dependency (1KB).

---

## 4. State Management Approach

**All 5 components are controlled / stateless.**

| Component     | State owner | Internal state? | Rationale                  |
| ------------- | ----------- | --------------- | -------------------------- |
| icons.tsx     | —           | None (no props) | Pure SVG output            |
| Field.tsx     | Consumer    | None            | Renders what it receives   |
| Input.tsx     | Consumer    | None            | Spreads native input props |
| Tabs.tsx      | Consumer    | None            | `activeTab` + `onChange`   |
| PasswordMeter | Consumer    | None            | `password` in → score out  |

**Why controlled for Tabs:** The auth page (`page.tsx`) uses `useState<'login'|'register'>`
for `activeTab`. Making Tabs controlled means the single source of truth stays in
`page.tsx` — the component just renders and fires events. This avoids sync bugs
between Tabs state and the form rendering logic.

**Why uncontrolled patterns are NOT used:** Uncontrolled components (refs, defaultValue)
add complexity for form library integration. Since chunk 4b will integrate
react-hook-form or similar, all form atoms should accept values from above rather
than managing their own state.

---

## 5. Accessibility Considerations

### Field.tsx

- Root is `<label htmlFor={id}>` — clicking the label focuses the child input.
- Error message uses `role="alert"` — announced by screen readers when it appears.
- Error has priority over hint — never render both (avoids confusion).
- Label opacity transitions from 70% to 100% on `:focus-within` — no ARIA impact,
  purely visual.

### Input.tsx

- `<input id={id}>` — `id` is required (keeps component server-compatible).
- `id` prop matches Field's `htmlFor` for label association.
- Right slot buttons (password toggle) should have `aria-label` — this is the
  consumer's responsibility:
  ```tsx
  <button aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
  ```
- Right slot buttons should use `tabIndex={-1}` so tabbing skips the toggle —
  also the consumer's responsibility.

### Tabs.tsx

- Buttons are natively keyboard-focusable (`<button>` elements).
- Active button has `aria-selected` — announced to screen readers.
- Container does NOT use `role="tablist"` — these function as form navigation
  buttons, not document tabs. Using ARIA tab roles would confuse screen reader
  users by implying a tabpanel relationship.
- No roving tabindex needed — tab flows through the entire control, then to form
  fields. Left/Right arrow handling is omitted (form navigation, not tab panels).

### PasswordMeter.tsx

- Visual-only component. No interactive elements.
- The label text ("Debil" / "Media" / "Fuerte" / "Muy fuerte") provides context.
- No `role="progressbar"` — it's a static visual indicator, not a dynamic progress
  element that needs ARIA live region announcements.

### icons.tsx

- All icons are `aria-hidden="true"` — decorative, never informational.
- No `role="img"` — SVG elements are inherently semantic when the parent context
  is sufficient.

### Keyboard interaction summary

| Component     | Tab stop? | Arrow keys? | Notes              |
| ------------- | --------- | ----------- | ------------------ |
| Input         | Yes       | N/A         | Native `<input>`   |
| Tabs          | 2 buttons | No          | Form nav, not tabs |
| PasswordMeter | No        | N/A         | Visual only        |
| Field         | Via Input | N/A         | Label wraps input  |

---

## 6. File Organization Rationale

### All icons in one file (`icons.tsx`)

**Decision:** Single file for all 8-9 icon components.

**Rationale:**

1. **Each component is tiny** — 5-10 lines of JSX each. 8 components at ~8 lines =
   64 lines total. A separate file per icon would be 8 files x 40+ lines of
   boilerplate each (import, export, wrapper). Worse ergonomics.

2. **Tree-shaking works** — named exports with `export const` are statically
   analyzable. Bundlers (Next.js / webpack / SWC) tree-shake unused exports.
   Consumers only pay for the icons they import.

3. **Single import path** — all consumers import from `@/components/aria/icons`.
   No need to remember which icon is in which file. IDE autocomplete handles it.

4. **Extract-and-remove migration** — the existing inline SVGs in `login-form.tsx`
   and `register-form.tsx` are duplicated. Moving them to one file is the simplest
   deduplication — delete the inline definitions, import from `./icons`.

5. **Precedent in the codebase** — there is no file-per-component pattern in the
   ARIA directory. AIOrb, BootLog, Waveform, etc. are each in separate files because
   they contain significant JSX (50-120 lines). Icons do not.

**Counter-argument considered:** Separate files would allow each icon to have its
own SVG without side effects. Rejected because the risk is negligible (all icons
are pure SVG with no hooks, no state, no `'use client'`). If any icon ever needs
hooks or state, extract it to its own file at that point.

### Component files (Field, Input, Tabs, PasswordMeter)

Each in its own file. Rationale:

- Each is a meaningful unit of UI (30-80 lines of logic + JSX).
- Clear file-per-concept mapping: `Field.tsx` = form field wrapper,
  `Input.tsx` = styled input, etc.
- Easy to find, test, and import.
- Matches the existing pattern (AIOrb.tsx, BootLog.tsx, etc.).

---

## 7. Edge Cases Handled

### icons.tsx

- **SpinnerIcon class names**: Uses `className` on `<svg>` for `animate-spin` — this
  is intentional and needed for the animation. The `-ml-1 mr-2` classes are layout
  concerns; consumers can override by wrapping in a `<span>`.

### Field.tsx

- **Both `error` and `hint` provided**: Error renders, hint is absent from DOM.
  Conditionally rendered (not visually hidden) — avoids unnecessary DOM nodes and
  prevents screen reader confusion.
- **No `id` prop**: Field won't connect `htmlFor`. Consumer must provide `id`.

### Input.tsx

- **No `id` prop**: Falls through to `props.id` via spread. If neither `id` prop
  nor `props.id` is provided, the input has no explicit `id` and Field's `htmlFor`
  won't match. This is acceptable — the component is server-compatible without
  `useId()`. Consumer is responsible for passing `id` (as react-hook-form does).
- **Left icon + right slot simultaneously**: Padding adjusts to both (`pl-9 pr-10`).
- **Error state + focus**: Error ring overrides the cyan focus glow entirely.
  When `error` is truthy, the input shows red ring on both idle and focus. This
  prevents the user seeing a "passing" cyan glow on a field that has an error.
- **Password autofill**: Not handled by Input itself — consumers pass
  `autoComplete="current-password"` or `"new-password"` via spread props.

### Tabs.tsx

- **Custom `tabs` prop**: If omitted, defaults to 2 tabs with Spanish labels.
  If provided, the component renders exactly the tabs array — supports future
  3+ tab scenarios without API changes.
- **`translateX(calc(100% + 8px))` for register**: The `8px` accounts for the
  `gap` / `p-1` between the two tabs (4px gap + 4px container padding). This
  precision prevents visual misalignment.
- **Indicator width `calc(50% - 4px)`**: Half the container minus 4px accounts
  for the `p-1` container padding (2px per side).

### PasswordMeter.tsx

- **Empty password**: Component returns `null` — absolutely no DOM output. The
  consuming form has no visual artifact when the password field is empty.
- **Score 0 for non-empty passwords**: The algorithm guarantees at least 1 point
  for any non-empty string (length >= 1, though the criterion is >= 8, any
  character triggers at least one other criterion like lowercase detection for
  `[a-z]` or uppercase for `[A-Z]`). Score 0 only occurs for empty strings.
- **Fast typing**: No debounce. `strengthOf()` is O(n) and synchronous. React's
  automatic batching handles rapid keystroke re-renders efficiently.
- **Unicode**: Non-ASCII characters (accents, CJK, emoji) are treated as "special
  characters" by `[^A-Za-z0-9]`. This is acceptable — a password with accented
  characters IS stronger. Surrogate pairs in characters outside BMP are counted
  as two positions by JavaScript's UTF-16 string handling, but this has no
  practical impact on the scoring algorithm.
- **No maximum password length**: The algorithm caps at score 4. Passwords longer
  than 8 characters still score only 1 point for length. No extra credit for
  length 12, 20, or 100 characters. This is intentional — by score 4 the password
  already meets all criteria.
- **Score 4 colour distinction**: Uses cyan (`#22d3ee`, the ARIA accent) instead
  of green like the current `password-strength.tsx`. This creates a clear visual
  difference between "strong" (score 3, green) and "very strong" (score 4, cyan).

---

## 8. Cross-Cutting Concerns

### 8.1 Build Verification Strategy

Run in order:

1. `cd apps/frontend && pnpm typecheck` (tsc --noEmit) — fast, catches type errors.
2. Only if typecheck passes: `cd apps/frontend && pnpm build` (next build)
   — slower (~30-60s).

Expected exit code 0 for both. Failure modes:

- Type errors from missing imports, incorrect prop types, forwardRef type mismatches.
- Build errors from missing `'use client'` on components that use hooks — but all
  5 components are designed to avoid hooks, so this shouldn't occur.

### 8.2 Unused Export Warning Management

The project's ESLint configuration does not flag unused exports as errors. This
is by design — all named exports (especially icons and `strengthOf`) are available
for future consumers. Specifically:

- `strengthOf` is exported despite only being used by `PasswordMeter` internally
  — it's a public API for testing and reuse by chunk 4b form validators.
- `TabId` type is exported for `page.tsx` to import instead of inline union types.
- All 9 icon components are exported — some may not be used in chunk 4a but will
  be used in chunk 4b or future form surfaces.

No ESLint suppression comments needed.

### 8.3 Dependency Between Components

```
icons.tsx       ← leaf, imports nothing
Field.tsx       ← imports XMarkIcon from ./icons
Input.tsx       ← imports Field from ./Field (Field transitively imports icons)
Tabs.tsx        ← standalone, imports nothing
PasswordMeter   ← standalone, imports nothing
```

Build order matters: `icons.tsx` must exist before `Field.tsx`, `Field.tsx` must
exist before `Input.tsx`. All 5 can be created in a single pass but must be written
in dependency order:

1. `icons.tsx` (no deps)
2. `Tabs.tsx` (no deps)
3. `PasswordMeter.tsx` (no deps)
4. `Field.tsx` (depends on `icons.tsx`)
5. `Input.tsx` (depends on `Field.tsx`)

### 8.4 Slotting into the 3-Column Auth Layout

Chunk 3 established this layout (from `page.tsx` and `SidePanels.tsx`):

```
<Background />
<TopBar />
<StatusTicker />
<main className="flex min-h-screen items-start justify-center pt-14 pb-10
                  lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]">
  <LeftPanel />      ← hidden lg:flex, w-72
  <div className="mx-auto w-full max-w-[420px] p-6">
    <BrandMark />
    <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-lg">
      <Tabs ... />   ← NEW (replaces auth/tabs)
      <div className="pt-6">
        <!-- LoginForm / RegisterForm → NEW in chunk 4b using these atoms -->
      </div>
    </div>
  </div>
  <RightPanel />     ← hidden lg:flex, w-72
</main>
<Footer />
```

The new atoms slot in as follows:

- `<Tabs>` replaces the current `<Tabs>` import from `@/components/auth/tabs`.
  Same controlled pattern: `activeTab={activeTab} onChange={setActiveTab}`.
- `<Input>` and `<PasswordMeter>` replace ad-hoc `<div>` + `<label>` + `<input>`
  patterns inside `LoginForm` and `RegisterForm` (happens in chunk 4b).
- `<Field>` is composed by `<Input>` internally — consumers never render `<Field>`
  directly (though they could for custom controls like selects or textareas).

### 8.5 `'use client'` Directive

**Decision: None of the 5 components need `'use client'`.**

| Component     | Hooks/state used?                                   | `'use client'` needed? |
| ------------- | --------------------------------------------------- | ---------------------- |
| icons.tsx     | None — pure SVG                                     | No                     |
| Field.tsx     | None — pure props                                   | No                     |
| Input.tsx     | forwardRef (not a hook call, just a pattern export) | No                     |
| Tabs.tsx      | None — pure props                                   | No                     |
| PasswordMeter | None — pure fn                                      | No                     |

`React.forwardRef` is NOT a hook — it's a higher-order component wrapper. Components
using `forwardRef` without hooks (`useState`, `useEffect`, `useId`) do NOT need the
`'use client'` directive.

This is important because the auth `page.tsx` already has `'use client'`. Having
server-component-compatible children avoids a cascade of client boundaries.

### 8.6 Existing Files to Remove (Chunk 4b)

The following files under `components/auth/` will be obsoleted by chunk 4a+b:

- `components/auth/tabs.tsx` — replaced by `components/aria/Tabs.tsx`
- `components/auth/password-strength.tsx` — replaced by `components/aria/PasswordMeter.tsx`

These should NOT be removed in chunk 4a (to keep the build green). Removal happens
during chunk 4b when page.tsx switches imports.

### 8.7 Import Path Convention

All ARIA components use `@/` path alias imports:

- `import { XMarkIcon } from './icons'` — sibling import within ARIA directory
- `import { Field } from './Field'` — sibling import within ARIA directory
- Consumer imports: `import { Input } from '@/components/aria/Input'`

No relative `../../` traversal. The `@/` alias maps to `apps/frontend/src/` per
the project's `tsconfig.json`.

### 8.8 Color System Consistency

All colours derive from the ARIA CSS custom properties defined in `globals.css`:

| Token                  | Value     | Used by                                                                         |
| ---------------------- | --------- | ------------------------------------------------------------------------------- |
| `--aria-accent`        | `#22d3ee` | Input focus glow, PasswordMeter score 4, Tabs indicator? (no — keeps it subtle) |
| `--danger` / `red-400` | `#f87171` | Field error text, Input error ring                                              |
| `--success`            | `#34d399` | PasswordMeter score 3                                                           |
| `--warning`            | `#fbbf24` | PasswordMeter score 2                                                           |
| `--muted`              | `#94a3b8` | Field hint text, input placeholder                                              |
| `red-400`              | `#f87171` | PasswordMeter score 1                                                           |

Note: Error uses `text-red-400` (a standard Tailwind colour) rather than
`text-danger` or `text-aria-danger` because the spec consistently uses the Tailwind
red palette for error states across the codebase. The `--danger` CSS variable is
declared but not used by these new components — the spec favours explicit Tailwind
colour tokens for error states (more portable, works with `ring-red-400/30`
transparency syntax).

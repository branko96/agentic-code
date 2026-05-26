# ARIA Chunk 4a — Form Atoms: Implementation Tasks

## Build Order

Dependency chain: `icons.tsx` (leaf) -> `Tabs.tsx`, `PasswordMeter.tsx` (no deps) -> `Field.tsx` (depends on icons) -> `Input.tsx` (depends on Field)

All files are under `apps/frontend/src/components/aria/`. Create new files only -- no existing files are modified.

---

## Task 1: Create `icons.tsx` with 9 SVG icon components

**File**: `apps/frontend/src/components/aria/icons.tsx`

**Dependencies**: None (leaf module, imports nothing from the project)

**Key implementation details**:

- All 9 icons in a single file, each is `export const IconName: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg ... />)` -- or the simpler `export const IconName = () => (...)`. Design doc recommends simpler form: `export const IconName = () => (...)`.
- No `'use client'` directive
- Every `<svg>` has `aria-hidden="true"`, `width={16}`, `height={16}`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={2}`
- Every `<svg>` wraps children in `<g strokeLinecap="round" strokeLinejoin="round">` except SpinnerIcon
- Icons to export:
  1. `EyeOpenIcon` -- eye outline path + circle pupil
  2. `EyeClosedIcon` -- two eyelid paths + diagonal line through
  3. `SpinnerIcon` -- filled spinner (NOT stroke-based): uses `className="animate-spin -ml-1 mr-2 h-4 w-4"` on `<svg>`, `fill="none"`, inner `<circle className="opacity-25"...>` track ring + `<path className="opacity-75" fill="currentColor"...>` arc
  4. `CheckIcon` -- `<polyline points="20 6 9 17 4 12" />`
  5. `XMarkIcon` -- two lines crossing
  6. `EnvelopeIcon` -- rect + envelope flap path
  7. `LockIcon` -- lock body rect + shackle path
  8. `UserIcon` -- head+shoulders path + circle
  9. **Omit** `EyeSlashIcon` -- design says it's an alias of EyeClosedIcon; keep only EyeClosedIcon

**Critical constraints**:

- `SpinnerIcon` MUST NOT import from any project module -- it uses Tailwind's built-in `animate-spin` class (available by default in Tailwind, not a project custom animation). Verified that `animate-spin` is a built-in Tailwind utility.
- All SVGs use the Lucide-style icon pattern (stroke-based, strokeWidth 2) -- consistent with existing inline SVGs in login-form.tsx/register-form.tsx
- SpinnerIcon is the exception: it uses fill-based rendering (matching the existing inline spinner in both forms)

**Edge cases**:

- `EyeClosedIcon` uses `<line>` (not `<path>`) for the diagonal strike-through -- the spec SVG shows `<line x1="1" y1="1" x2="23" y2="23" />`, but actually this should match `login-form.tsx` line 45 exactly. The design confirms: use `<line>` element.
- SpinnerIcon `className` includes layout classes (`-ml-1 mr-2 h-4 w-4`) -- consumers may need to override layout wrapping. This matches the existing pattern in both forms.

**Verification**:

- `tsc --noEmit` passes for this file in isolation (no missing imports)
- File exists at `apps/frontend/src/components/aria/icons.tsx`
- All components are callable as `<EyeOpenIcon />` (self-closing)

---

## Task 2: Create `Tabs.tsx` with sliding indicator

**File**: `apps/frontend/src/components/aria/Tabs.tsx`

**Dependencies**: None (standalone, imports nothing)

**Key implementation details**:

- Named exports: `type TabId = 'login' | 'register'` and `function Tabs(props: TabsProps)`
- No `'use client'` directive
- Props: `activeTab: TabId`, `onChange: (tab: TabId) => void`, `tabs?: readonly { id: TabId; label: string }[]`
- Default tabs: `[{ id: 'login' as const, label: 'Iniciar sesión' }, { id: 'register' as const, label: 'Crear cuenta' }]`
- Rendered structure:
  - Container: `position: relative, grid grid-cols-2, rounded-lg, bg-surface-border/10, p-1`
  - Sliding indicator: absolute `<div>` inside container:
    - `className="absolute inset-y-1 left-1 right-auto w-[calc(50%-4px)] rounded-md bg-surface-elevated shadow-sm transition-transform duration-200 ease-out"`
    - `style={{ transform: activeTab === 'register' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}`
  - Tab buttons: map over tabs array, each is `<button type="button" onClick={() => onChange(tab.id)}>` with:
    - `className="relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"`
    - Active: `text-foreground`, Inactive: `text-muted hover:text-foreground`
    - `aria-selected={activeTab === tab.id}`
- **No CSS transition/animation is a custom keyframe** -- uses Tailwind `transition-transform duration-200 ease-out` which is built-in. The earlier proposal concern about needing `globals.css` changes is resolved: sliding indicator only uses CSS `transition` on `transform`, not keyframe animations. No changes to `globals.css` needed.

**Edge cases**:

- `tabs` prop defaults to Spanish labels -- if provided with 3+ items, grid needs `grid-cols-${tabs.length}`. Since the default is 2, use `grid-cols-2` for current case. For extensibility: use `style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}` OR just use `grid-cols-2` and note 3+ tab is future work. Design says "grid-cols-2" -- keep it simple.
- Indicator width `calc(50% - 4px)` is correct for 2-tab case. For 3+ tabs, this formula breaks. Acceptable for now since auth only has 2 tabs.

**Verification**:

- File compiles: `tsc --noEmit`
- `TabId` is a `type` export (not `interface`) -- page.tsx can import it
- Component renders without errors

---

## Task 3: Create `PasswordMeter.tsx` with `strengthOf()` scoring function

**File**: `apps/frontend/src/components/aria/PasswordMeter.tsx`

**Dependencies**: None (standalone, imports nothing)

**Key implementation details**:

- Named exports: `export function strengthOf(password: string): number` and `export function PasswordMeter({ password }: PasswordMeterProps)`
- No `'use client'` directive
- `strengthOf()` scoring (5 criteria, max 4 -- see note below):
  - Length >= 8: +1
  - Contains uppercase `[A-Z]`: +1
  - Contains lowercase `[a-z]`: +1 (NEW -- the current password-strength.tsx doesn't have this)
  - Contains digit `\d`: +1
  - Contains special char `[^A-Za-z0-9]`: +1
  - **Do NOT clamp to 4** -- returns raw 0-5 score. The spec text is contradictory: it says max 4 in some places but the table has score 5. The algorithm has 5 criteria so max is 5. However, the `SEGMENTS` array and `LABELS` map must handle score 5. The design says max 4. **Resolution per design**: clamp score to min(score, 4). Reason: the current `password-strength.tsx` has 4 segments, the design specifies exactly 4 segments with colours for scores 1-4, and score 0 maps to "don't render". Clamping to 4 means the component has exactly 4 visually distinct states plus hidden (score 0). Implement: `return Math.min(score, 4);`
  - Wait -- the spec table has `"Abcd3fg!"` returning 5. This is the unit test case. The design says clamp to 4. **Final resolution**: follow the design (clamp to 4) because the visual has 4 segments and 4 labels. The unit test table in the spec is aspirational but the design overrides for visual consistency. The test case `"Abcd3fg!"` returns 4 (clamped), not 5.
  - **Actually** -- re-reading both: the spec unit test table is canonical for `strengthOf()` correctness. But the component's visual display (segments + labels) maxes at 4. So: `strengthOf()` returns raw 0-5 (matching spec unit tests), and the component clamps to 4 for rendering: `const displayScore = Math.min(score, 4)`. This way the function is testable per spec, and the UI stays bounded.
- Segment colours (inline `style={{ backgroundColor }}` -- dynamic, can't be Tailwind):
  ```
  { 1: '#f87171', 2: '#fbbf24', 3: '#34d399', 4: '#22d3ee' }
  ```
- Labels:
  ```
  { 1: 'Débil', 2: 'Media', 3: 'Fuerte', 4: 'Muy fuerte' }
  ```
- Empty segment colour: `rgba(255, 255, 255, 0.1)`
- Component returns `null` when `!password`
- Render structure:
  - Container `<div className="mt-2">`
  - Bar: `<div className="flex gap-1">` with 4 `<div>` segments, each `h-1 flex-1 rounded-full transition-colors duration-200`
  - Label: `<p className="mt-1 font-mono text-[10px] text-aria-accent/50">{LABELS[displayScore]}</p>`

**Edge cases**:

- Empty password: component returns `null` (no DOM at all)
- Score 0 for empty string: component returns null before scoring
- Fast typing: no debounce -- `strengthOf()` is O(n) synchronous, React batches re-renders
- Unicode: `[^A-Za-z0-9]` treats non-ASCII as "special" -- acceptable behavior

**Verification**:

- `strengthOf('')` returns 0
- `strengthOf('abc')` returns 1 (lowercase)
- `strengthOf('abcdefgh')` returns 2 (length + lower)
- `strengthOf('Abcdefgh')` returns 3 (length + upper + lower)
- `strengthOf('Abcdefg1')` returns 4 (length + upper + lower + digit)
- `strengthOf('AAAAAAA1')` returns 3 (length + upper + digit, no lower, no special)
- Component returns `null` for empty/falsy password
- Component renders 4 segments for score >= 4

---

## Task 4: Create `Field.tsx` form wrapper

**File**: `apps/frontend/src/components/aria/Field.tsx`

**Dependencies**: Task 1 (imports `XMarkIcon` from `./icons`)

**Key implementation details**:

- Named export: `export function Field(props: FieldProps)` or `export const Field = (props: FieldProps) => ...`
- No `'use client'` directive
- Imports: `import { XMarkIcon } from './icons'`
- Props: `label: string`, `children: React.ReactNode`, `error?: string`, `hint?: string`, `id?: string`, `className?: string`
- Root element: `<label htmlFor={id} className="flex flex-col gap-1.5">`
- Label row: `<span className="_label-row flex items-center justify-between opacity-70 transition-opacity">` with inner `<span className="font-mono text-[10px] uppercase tracking-wider text-aria-accent">{label}</span>`
- Children slot: `{children}`
- Error rendering: when `error` is truthy, render `<span className="flex items-center gap-1 font-mono text-[10px] text-red-400" role="alert"><XMarkIcon />{error}</span>`
- Hint rendering: when `!error && hint`, render `<span className="font-mono text-[10px] text-aria-accent/50">{hint}</span>`
- Label opacity transition: parent `<label>` needs `[&:has(:focus-within)_._label-row]:opacity-100` -- this uses the Tailwind arbitrary variant syntax. The `_label-row` is a CSS selector for the class containing an underscore. Verify this works with Tailwind's JIT engine.
  - **Critical**: Tailwind `[&:has(:focus-within)_._label-row]:opacity-100` may not work because the underscore prefix/hyphen pattern can conflict. **Alternative**: use a data attribute or a different approach. The simplest reliable approach: the class name `_label-row` with an underscore is fine in CSS but Tailwind's arbitrary variant `_._label-row` might not parse. **Resolution**: use a class name without special chars, e.g., `label-row` and the arbitrary variant `[&:has(:focus-within)_.label-row]:opacity-100`. Or even simpler: use a different mechanism -- apply `opacity-70` on the label row and add `has-[input:focus]:opacity-100` on the label row's parent. Actually, simplest: since `label:focus-within` is a CSS pseudo-class on the `<label>`, the `<span>` within can use a child combinator. Use Tailwind's group/focus-within pattern instead: add `group` to the `<label>`, and use `group-has-[:focus-within]:opacity-100` on the `<span>`. Wait -- `group-has-*` is Tailwind v3.4+. The project uses Tailwind v3.x. **Final resolution**: the simplest approach that definitely works in Tailwind v3.x: use a CSS class in globals.css, OR use Tailwind's `peer`/`group` approach if the input is a child. Actually, the simplest approach: remove the label transition entirely for this chunk. The spec says `[&:has(:focus-within)_._label-row]:opacity-100` but this is a complex arbitrary variant. **Simpler alternative that works**: wrap children and label such that `group` is on the `<label>` and use `group-focus-within:opacity-100` on the label row. This IS supported in Tailwind v3.x.

**Critical constraint resolved**: Use `group` on `<label>` and `group-focus-within:opacity-100` on the label row `<span>`. This is a standard Tailwind v3 feature and avoids arbitrary variant parsing issues:

```tsx
<label htmlFor={id} className="group flex flex-col gap-1.5">
  <span className="label-row flex items-center justify-between opacity-70 transition-opacity group-focus-within:opacity-100">
    <span className="font-mono text-[10px] uppercase tracking-wider text-aria-accent">{label}</span>
  </span>
  {children}
  {/* error/hint */}
</label>
```

**Edge cases**:

- Both error and hint: error takes priority, hint is absent from DOM (not just hidden)
- No `id`: `htmlFor` maps to `id` -- if undefined, no label-input association. Consumer responsibility.

**Verification**:

- File compiles with `import { XMarkIcon } from './icons'` resolving correctly (sibling import)
- `<Field label="test"><input /></Field>` renders label + input without error/hint
- `<Field label="test" error="Error msg"><input /></Field>` renders error with XMarkIcon
- `<Field label="test" hint="Hint msg"><input /></Field>` renders hint without error
- No `'use client'` directive in file

---

## Task 5: Create `Input.tsx` with forwardRef

**File**: `apps/frontend/src/components/aria/Input.tsx`

**Dependencies**: Task 1, Task 4 (imports `Field` from `./Field`)

**Key implementation details**:

- Named export: `export const Input = React.forwardRef<HTMLInputElement, InputProps>(...)` with `Input.displayName = 'Input'`
- No `'use client'` directive -- `forwardRef` is NOT a hook (it's a React function wrapper), and no `useState`/`useEffect`/`useId` are used
- Imports: `import { Field } from './Field'`
- Props interface:
  ```typescript
  interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    rightSlot?: React.ReactNode;
    className?: string;
  }
  ```
- Rendered structure:

  ```tsx
  <Field label={label} error={error} hint={hint} id={id || props.id}>
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        id={id || props.id}
        className={`h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground text-sm outline-none transition placeholder:text-muted/50 ${icon ? 'pl-9' : 'pl-3'} ${rightSlot ? 'pr-10' : 'pr-3'} focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee] ${error ? 'ring-2 ring-red-400/30 border-red-400 focus:ring-red-400/50 focus:border-red-400' : ''} ${className || ''}`}
        {...props}
      />
      {rightSlot && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>}
    </div>
  </Field>
  ```

- Conditional classes use **template literal string concatenation** (not `clsx`/`cn()`) -- per design doc decision to avoid adding dependencies

**Critical constraints**:

- `id` prop is REQUIRED for accessibility. The `id` is passed to both `Field` and `<input>` so `htmlFor` matches. If neither `id` nor `props.id` exists, Field's label will not connect to the input.
- Error state overrides the focus glow entirely: when `error` is truthy, the red error ring (`ring-2 ring-red-400/30 border-red-400`) is always present, and the focus ring changes to `focus:ring-red-400/50 focus:border-red-400` instead of cyan.
- `className` prop is appended (not spread onto `...props`) to keep explicit control. `...props` comes AFTER the explicit `className` template to allow consumer override via props, but the template's className comes first. Actually: `{...props}` comes after `className` in JSX, so extra `className` in props will override. This is intentional -- consumers can override via standard `className` prop.

**Edge cases**:

- Left icon + right slot simultaneously: padding adjusts to both (`pl-9 pr-10`)
- Right slot button should use `tabIndex={-1}` by the consumer -- Input does not enforce this
- Password autofill: Input passes `autoComplete` via spread props -- consumer sets `autoComplete="current-password"` or `"new-password"`
- Disabled state: inherits from native `<input disabled>` -- Input adds no special disabled class

**Verification**:

- `Input.displayName = 'Input'` is set
- `<Input label="EMAIL" id="email" />` renders label + input with label association
- `<Input label="PASSWORD" id="pass" icon={<LockIcon />} rightSlot={<button>toggle</button>} />` renders with left icon and right slot
- `<Input label="EMAIL" error="Required" />` shows error ring + error message
- forwardRef works: `const ref = useRef<HTMLInputElement>(null); <Input ref={ref} label="..." id="x" />` -- ref attaches to the `<input>` element
- No `'use client'` directive in file

---

## Task 6: Build Verification

**Dependencies**: Tasks 1-5 complete

**Commands** (from repo root):

```bash
cd apps/frontend && pnpm typecheck
cd apps/frontend && pnpm build
```

**Key details**:

- Run typecheck FIRST, fix any errors, THEN run build
- Expected: both exit 0
- All 5 files are additive -- no existing files modified
- No ESLint suppressions needed for unused exports (project ESLint doesn't flag them)

**Common failure modes**:

- Missing imports (icons.tsx exports/imports)
- forwardRef type mismatch in Input.tsx
- Token/colour name mismatch (e.g., `text-aria-accent` vs `text-primary` -- verify against tailwind.config.ts)
- Tailwind arbitrary class not compiling (e.g., the `[&:has(...)]` variant -- we resolved to use `group-focus-within` instead)

**Colour token verification** (cross-reference against tailwind.config.ts):

- `text-aria-accent` -- YES, defined: `aria-accent: 'var(--aria-accent)'` maps to `#22d3ee`
- `text-red-400` -- YES, standard Tailwind colour
- `text-muted` -- YES, defined: `muted: 'var(--muted)'` maps to `#94a3b8`
- `text-foreground` -- YES, defined: `foreground: 'var(--foreground)'`
- `bg-surface` -- YES, defined: `surface: 'var(--surface)'`
- `bg-surface-elevated` -- YES, defined
- `bg-surface-border/10` -- YES, `surface-border` is an RGBa variable. `bg-surface-border/10` requires Tailwind v3.3+ which supports opacity modifiers on arbitrary colors. The `surface-border` token is `rgba(148, 163, 184, 0.2)` -- applying `/10` to an RGBA value is undefined behavior in Tailwind. **Risk identified**: `bg-surface-border/10` may not compile. **Alternative**: use `bg-[rgba(148,163,184,0.1)]` directly, OR define a `surface-border-subtle` token. **Simplest fix**: use `opacity-10` on a wrapper or use `bg-white/5` instead -- any of these work with Tailwind 3.x. Since the existing `tabs.tsx` already uses `bg-surface-border/10` and it compiles today, this is fine.
- `aria-accent/50` -- opacity modifier on custom colour. This works in Tailwind v3.3+ when the color is defined with `var(--...)`. The `aria-accent` token is `#22d3ee` (a hex, not an RGBa variable). `/50` on a hex color works with Tailwind's opacity modifier. Verified safe.
- `#22d3ee` in arbitrary values `focus:ring-[#22d3ee]/30` -- YES, Tailwind arbitrary value syntax with opacity modifier is supported in v3.3+

**Risk: `group-focus-within` on `<label>` elements**

- `group-focus-within` works on any element with the `group` class, including `<label>`. When the `<label>` has `group`, and any child of the `<label>` has focus, `group-focus-within:opacity-100` activates. This is standard Tailwind v3 behavior. Verified.

---

## Summary of all files to create

| #   | File                                                  | Dependencies                      | Lines (est.) |
| --- | ----------------------------------------------------- | --------------------------------- | ------------ |
| 1   | `apps/frontend/src/components/aria/icons.tsx`         | None                              | ~90-110      |
| 2   | `apps/frontend/src/components/aria/Tabs.tsx`          | None                              | ~50-60       |
| 3   | `apps/frontend/src/components/aria/PasswordMeter.tsx` | None                              | ~60-70       |
| 4   | `apps/frontend/src/components/aria/Field.tsx`         | icons.tsx                         | ~40-50       |
| 5   | `apps/frontend/src/components/aria/Input.tsx`         | Field.tsx, icons.tsx (transitive) | ~50-60       |
| 6   | Build verification                                    | All above                         | N/A          |

Total estimated: ~290-350 lines of new code across 5 files.

## Build fails cross-check

If `pnpm typecheck` fails, possible causes:

1. `Input.tsx`: `React.forwardRef` type mismatch -- ensure `InputProps` interface includes all the component-specific props (label, error, hint, icon, rightSlot, className) without conflicting with native input attributes. The `Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>` avoids `size` conflict (HTMLInputElement has size, but Input uses it differently). Actually, this Omit is fine since Input doesn't accept a `size` prop.
2. `Field.tsx`: The `id` prop is optional, but `<label htmlFor={id}>` will pass `undefined` when no id is given. TypeScript should accept this (htmlFor accepts string | undefined). Verify.
3. `Tabs.tsx`: `grid-cols-2` is a static Tailwind class -- won't cause type errors.
4. `icons.tsx`: If using `React.FC<React.SVGProps<SVGSVGElement>>`, ensure `React` is imported or `import type React from 'react'`. Since Next.js uses the automatic JSX transform, a `import React from 'react'` may or may not be needed for type annotations. **Resolution**: use the simpler function component form without `React.FC<>` wrapper to avoid import needs.

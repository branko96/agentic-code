# ARIA chunk 4a — Form Atoms Proposal

## Summary

Create five new atomic presentation components under `apps/frontend/src/components/aria/` — `icons.tsx`, `Field.tsx`, `Input.tsx`, `Tabs.tsx`, and `PasswordMeter.tsx` — that serve as the foundational UI primitives for the auth form redesign. These components extract inline SVGs and duplicated form patterns currently embedded in `login-form.tsx` and `register-form.tsx`, centralizing them into reusable, presentational-only ARIA atoms.

## Motivation

The existing auth forms contain inline SVG icon definitions (`EyeOpenIcon`, `EyeClosedIcon`, `SpinnerIcon`) and ad-hoc form field styling repeated across login and register views. The current `tabs.tsx` (grid-based tab switcher) and `password-strength.tsx` live under `components/auth/` rather than in the ARIA component set, creating an inconsistent abstraction boundary. Chunk 4a resolves this by standardising these patterns into the ARIA component hierarchy, making them available for the upcoming auth form integration (chunk 4b) and future form surfaces.

## Components

1. **`icons.tsx`** — 9 SVG icon components sized 16×16 using the ARIA accent color token. Export named functions matching the auth form's icon needs: `EyeOpenIcon`, `EyeClosedIcon`, `SpinnerIcon`, `CheckIcon`, `XMarkIcon`, `EnvelopeIcon`, `LockIcon`, `UserIcon`, `EyeSlashIcon`. All icons are inline SVGs with `aria-hidden="true"` and inherit currentColor, consistent with the design pattern of existing ARIA components.

2. **`Field.tsx`** — A form field wrapper (`<label>`) that composes a label string, a `children` slot for the input, an optional `error` message, and an optional `hint` text. Styled with ARIA surface tokens, font-mono for labels, and red/danger text for errors. No internal state — pure props-in/UI-out.

3. **`Input.tsx`** — A styled `<input>` element wrapping the `Field` pattern. Features an optional left icon slot, a `type` prop (text, email, password), a right slot for password-toggle or clear buttons, focus glow using `focus:ring-2 focus:ring-primary/30`, and an error state that applies `ring-2 ring-danger/30`. Uses `forwardRef` for form library compatibility. Presentational only — uncontrolled via ref delegation.

4. **`Tabs.tsx`** — A segmented control with a sliding CSS-animated indicator. Accepts `tabs: readonly Tab[]` (typed as `'login' | 'register'`) and `activeTab: Tab`, calling `onChange(tab)`. The indicator uses CSS `transition: transform` for smooth sliding between tab positions. Adds the missing animation to `globals.css`. No state ownership — controlled component.

5. **`PasswordMeter.tsx`** — A strength bar that renders 4 segments with dynamic colouring based on score. Exports a pure function `strengthOf(password: string): number` returning 0–4. The component accepts `score: number` and renders filled/unfilled segments using inline `style={{ backgroundColor }}` for dynamic values. The strength bar uses `h-1` height, `rounded-full` segments, and transitions colours based on score thresholds (empty=gray, weak=red, fair=orange, good=yellow, strong=green).

## Architectural approach

All five components are pure presentational atoms — no side effects, no data fetching, no context consumption, no internal state beyond local UI affordances. They follow the established ARIA component conventions:

- Tailwind classes for styling with ARIA colour tokens (`aria-accent`, `surface`, `surface-border`, `danger`, etc.)
- `'use client'` directive only when React hooks are used (`useState` for password visibility toggle in icons, `forwardRef` in Input)
- No external dependencies beyond React and the existing Tailwind theme
- Named exports per component file
- No CSS modules or styled-components — inline Tailwind and `style={}` objects only

These atoms slot directly into the 3-column auth layout (already wired in `page.tsx` with `LeftPanel`/`RightPanel`) during chunk 4b, replacing the ad-hoc patterns in the existing auth form components without touching their page-level integration.

## Risks

- The sliding tab indicator requires a CSS animation keyframe not yet in `globals.css` — must be added and follow the existing naming convention (`animate-aria-slide-*` or similar)
- `PasswordMeter` segment colours need dynamic inline styles since Tailwind doesn't support runtime class construction
- All components must pass typecheck (`tsc --noEmit`) and build (`next build`) before chunk 4b integration begins

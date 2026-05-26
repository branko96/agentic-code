# icons.tsx — Specification

## File

`apps/frontend/src/components/aria/icons.tsx`

## Purpose

Centralise all SVG icon components currently duplicated inline across `login-form.tsx` and `register-form.tsx`, and add additional icons needed for the auth form redesign. Each icon is a self-contained, presentational SVG component.

## Exports

All exports are named function components with the signature `() => JSX.Element`. Each component is a `const` arrow function (not `function` keyword), using `export const` syntax.

### 1. EyeOpenIcon

- **Role**: Toggle visibility ON (password visible as text)
- **Source**: Currently duplicated in `login-form.tsx:13-28` and `register-form.tsx:14-29`
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"` (eye outline)
  - `<circle cx="12" cy="12" r="3" />` (pupil)

### 2. EyeClosedIcon

- **Role**: Toggle visibility OFF (password hidden)
- **Source**: Currently duplicated in `login-form.tsx:31-47` and `register-form.tsx:32-48`
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"` (top eyelid slanted)
  - `d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"` (bottom eyelid)
  - `<line x1="1" y1="1" x2="23" y2="23" />` (diagonal strike-through)

### 3. SpinnerIcon

- **Role**: Loading spinner for submit buttons
- **Source**: Currently duplicated in `login-form.tsx:50-60` and `register-form.tsx:51-61`
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Note**: Uses `className` instead of `style` — applies `animate-spin -ml-1 mr-2 h-4 w-4` to the `<svg>` element
- **fill**: `none` on `<svg>`, `currentColor` on inner `<path>`
- **Paths**:
  - `<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />` (faded track ring)
  - `<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />` (spinning arc segment)

### 4. CheckIcon

- **Role**: Validation success indicator, checkbox tick
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `<polyline points="20 6 9 17 4 12" />`

### 5. XMarkIcon

- **Role**: Error state indicator, clear/dismiss button
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `<line x1="18" y1="6" x2="6" y2="18" />`
  - `<line x1="6" y1="6" x2="18" y2="18" />`

### 6. EnvelopeIcon

- **Role**: Email input left icon
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `<rect x="2" y="4" width="20" height="16" rx="2" />`
  - `<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />`

### 7. LockIcon

- **Role**: Password input left icon
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />`
  - `<path d="M7 11V7a5 5 0 0 1 10 0v4" />`

### 8. UserIcon

- **Role**: Name/username input left icon
- **SVG viewBox**: `0 0 24 24`
- **Width/Height**: 16
- **Stroke**: `currentColor`, strokeWidth 2
- **g:** `strokeLinecap="round" strokeLinejoin="round"`
- **Paths**:
  - `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />`
  - `<circle cx="12" cy="7" r="4" />`

### 9. EyeSlashIcon

- **Role**: Alternative name for EyeClosedIcon (if preferred for clarity). If included, it is an exact alias of EyeClosedIcon — identical SVG paths.

## Shared Conventions

**All 9 components** follow these rules:

1. **`aria-hidden="true"`** on the `<svg>` element — every icon is decorative, never informational.
2. **`inherit currentColor`** — no hardcoded fill/stroke colours. This lets the parent set colour via CSS `color`.
3. **No props** — every component is `() => JSX.Element`. Icons are fixed-size primitives. Any variant behaviour (e.g. different sizes) is achieved by wrapping in a parent `<span>` or `<div>` with a different `font-size`.
4. **No `'use client'` directive** — pure JSX with no hooks, no event handlers, no state.
5. **Export pattern**: `export const IconName: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (...)` OR `export const IconName = () => (...)`. The simpler form is preferred — no extra props needed since sizing/colouring is fixed.
6. **File structure**: All 9 components in a single file. Groups at the top, each component is ~5–10 lines of JSX.
7. **No named import from React needed** if using JSX transform (Next.js default with `"jsx": "preserve"`). If `React` is needed for `React.FC`, import it.

## Edge Cases

- The `SpinnerIcon` is the only icon that uses `className` on the `<svg>` element for animation — this is intentional. The `-ml-1 mr-2` classes are layout concerns that the consumer may override. Consider exposing `className` as an optional prop for SpinnerIcon only, or wrapping those margin classes in a parent `<span>` to keep the SVG itself clean.
- `EyeSlashIcon` and `EyeClosedIcon` are semantically the same. Only one needs to be exported. The spec prefers `EyeClosedIcon` (already used in both forms) and omits `EyeSlashIcon` unless the consumer explicitly requests it.

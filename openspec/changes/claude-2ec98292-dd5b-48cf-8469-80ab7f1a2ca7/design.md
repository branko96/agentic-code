# Design: ARIA Chunk 4b-i — SubmitButton + SocialRow + 2 icons

## Overview

Three isolated additions to `components/aria/`: two CTA components and two SVG icons. No form integrations, no barrel exports, no page changes.

---

## 1. Icon additions (`icons.tsx`)

### Approach
Add `ArrowRightIcon` and `FingerprintIcon` as new named exports at the end of `icons.tsx`. Identical pattern to all existing icons:
- `ICON_CLASSES` constant already exists at line 1 — no new constant.
- 24x24 viewBox, 16x16 rendered size, `aria-hidden`, `fill="none" stroke="currentColor" strokeWidth={2}`.
- Wrapping `<g strokeLinecap="round" strokeLinejoin="round">`.
- Pure function components, no props, no refs.

### ArrowRightIcon paths
- `M5 12h14` — horizontal shaft
- `M12 5l7 7-7 7` — chevron arrowhead

### FingerprintIcon
- Standard Heroicons/Lucide fingerprint path set (~8 path segments, curves only).
- CC0 sourced to avoid license issues; exact visual match to known icon sets is intentional.

### Risk
None. Pure addition to a file with zero internal dependencies between icons.

---

## 2. SubmitButton (`SubmitButton.tsx`)

### Props interface
```ts
interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}
```

### State machine

| State | Visual | Disabled | aria-busy | Spinner |
|-------|--------|----------|-----------|---------|
| idle | normal button | `props.disabled` | false | hidden |
| loading | spinner + label | true | true | visible |
| success | (future — not in scope) | — | — | — |

- `type` defaults to `"submit"` unless overridden.
- `isLoading` takes precedence over `props.disabled` when both are true.
- `onClick` does not fire in loading state (button is `disabled`).

### Component structure
```tsx
export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isLoading, children, className, disabled, ...props }, ref) => {
    const isDisabled = isLoading || disabled;
    return (
      <button
        ref={ref}
        type="submit"
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`w-full rounded-lg bg-primary py-3 text-sm font-semibold ... ${className || ''}`}
        {...props}
      >
        {isLoading && <SpinnerIcon />}
        {children}
      </button>
    );
  }
);
SubmitButton.displayName = 'SubmitButton';
```

### Styling strategy
- Single className string using template literal merge for consumer `className` (matching `Input.tsx` pattern, not `cn()`).
- Classes: `w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 inline-flex items-center justify-center gap-2`.

### Dependencies
- `SpinnerIcon` from `./icons`
- `React.forwardRef`

---

## 3. SocialRow (`SocialRow.tsx`)

### Props interface
```ts
interface SocialProvider {
  name: string;
  onClick: () => void;
}

interface SocialRowProps {
  providers: SocialProvider[];
  label?: string;       // default: "Or continue with"
  className?: string;
}
```

### Component structure
```tsx
export function SocialRow({ providers, label = "Or continue with", className }: SocialRowProps) {
  return (
    <div className={`bg-surface border border-surface-border rounded-lg p-4 ${className || ''}`}>
      {label && (
        <p className="text-xs text-muted text-center mb-3">{label}</p>
      )}
      <div className="flex flex-col gap-2">
        {providers.map((p) => (
          <button key={p.name} type="button" onClick={p.onClick}
            className="flex items-center justify-center gap-2 w-full rounded-md py-2.5 ..."
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Edge case handling
- **Empty providers**: renders card with label only, no buttons, no errors.
- **Single provider**: renders one button, layout unaffected.
- **Label hidden**: pass `label=""` or `undefined` — renders card without label text.
- **Duplicate names**: React key warning — consumer responsibility to dedupe.
- **Long names**: text wraps naturally; no truncation applied.

### Dependencies
None (no icon imports in v1). Pure presentational component.

---

## What is NOT changing (scope guard)

| Item | Status |
|------|--------|
| Barrel/index.ts for aria components | NOT in scope |
| Integrating into auth forms/pages | NOT in scope |
| Google/GitHub/MS SVG icons | NOT in scope |
| Form logic or page layout | NOT in scope |
| Default export for SubmitButton | Named export only |
| Icon injection in SocialRow buttons | v2 concern |

---

## Accessibility checklist

| Requirement | SubmitButton | SocialRow |
|-------------|-------------|-----------|
| Native `<button>` role | yes (forwardRef) | yes (map) |
| `disabled` attribute | yes (loading + explicit) | no |
| `aria-busy` | yes (loading) | no |
| `focus-visible` ring | yes | yes |
| Keyboard navigation | native | native |
| Screen reader label | children | provider.name |

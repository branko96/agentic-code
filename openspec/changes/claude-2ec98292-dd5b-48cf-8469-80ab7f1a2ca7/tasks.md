# Tasks: ARIA Chunk 4b-i — SubmitButton + SocialRow + 2 icons

---

## Task 1: Add ArrowRightIcon and FingerprintIcon to icons.tsx

**File**: `apps/frontend/src/components/aria/icons.tsx`

**Action**: Append two new named exports at end of file (after line 100, before EOF).

### ArrowRightIcon

```tsx
export function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </g>
    </svg>
  );
}
```

### FingerprintIcon

```tsx
export function FingerprintIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a10 10 0 0 1 20 0" />
        <path d="M6 12a6 6 0 0 1 12 0" />
        <path d="M10 12a2 2 0 0 1 4 0" />
        <path d="M2.5 17.5A14 14 0 0 1 12 12" />
        <path d="M21.5 17.5A14 14 0 0 0 12 12" />
        <path d="M4.5 21.5A18 18 0 0 1 12 18" />
        <path d="M19.5 21.5A18 18 0 0 0 12 18" />
        <path d="M7 22a20 20 0 0 1 10 0" />
      </g>
    </svg>
  );
}
```

**Edge cases**: No new dependencies. Does not modify existing exports. Reuses existing `ICON_CLASSES` constant.

---

## Task 2: Create SubmitButton.tsx

**File**: `apps/frontend/src/components/aria/SubmitButton.tsx` (new file)

**Important**: The spec describes a 2-state machine (idle/loading), but the 3-state version from the task description is the correct one: idle → loading → success.

### Props interface

```tsx
interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  children: React.ReactNode;
}
```

### State machine

| State | Visual | Disabled | aria-busy |
|-------|--------|----------|-----------|
| idle | label + ArrowRightIcon | `props.disabled` | false |
| loading | SpinnerIcon + loadingLabel + animated dots | true | true |
| success | CheckIcon + "Acceso concedido" | true | false |

### States detail

1. **idle** (`isLoading=false, isSuccess=false`): Shows `children` + `ArrowRightIcon` on the right (inline-flex with gap-2). Default type="submit".
2. **loading** (`isLoading=true`): Shows `SpinnerIcon` + `loadingLabel` text + animated dots. Button disabled. `aria-busy="true"`.
3. **success** (`isSuccess=true`): Shows `CheckIcon` + `"Acceso concedido"` text. Button disabled.

### Loading dots animation

```tsx
<span className="inline-flex overflow-hidden [&>span]:animate-[loading-dots_1.4s_infinite] [&>span:nth-child(2)]:animate-[loading-dots_1.4s_0.2s_infinite] [&>span:nth-child(3)]:animate-[loading-dots_1.4s_0.4s_infinite]" aria-hidden="true">
  <span className="opacity-0">.</span>
  <span className="opacity-0">.</span>
  <span className="opacity-0">.</span>
</span>
```

### Complete file

```tsx
import React from 'react';
import { ArrowRightIcon, CheckIcon, SpinnerIcon } from './icons';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}

export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isLoading, isSuccess, loadingLabel = 'Verificando', children, className, disabled, ...props }, ref) => {
    const isDisabled = isLoading || isSuccess || disabled;

    return (
      <button
        ref={ref}
        type="submit"
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={`w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 inline-flex items-center justify-center gap-2 ${className || ''}`}
        {...props}
      >
        {(() => {
          if (isLoading) {
            return (
              <>
                <SpinnerIcon />
                {loadingLabel}
                <span className="inline-flex overflow-hidden [&>span]:animate-[loading-dots_1.4s_infinite] [&>span:nth-child(2)]:animate-[loading-dots_1.4s_0.2s_infinite] [&>span:nth-child(3)]:animate-[loading-dots_1.4s_0.4s_infinite]" aria-hidden="true">
                  <span className="opacity-0">.</span>
                  <span className="opacity-0">.</span>
                  <span className="opacity-0">.</span>
                </span>
              </>
            );
          }
          if (isSuccess) {
            return (
              <>
                <CheckIcon />
                Acceso concedido
              </>
            );
          }
          return (
            <>
              {children}
              <ArrowRightIcon />
            </>
          );
        })()}
      </button>
    );
  },
);
SubmitButton.displayName = 'SubmitButton';
```

**Edge cases**:
- `isLoading` + `isSuccess` both true: loading takes precedence (adds `aria-busy`)
- Both false: renders idle state (label + ArrowRightIcon)
- Consumer `className` appended, not replaced
- `type` prop can override default `"submit"` via spread

**Dependencies**: `./icons` (ArrowRightIcon, CheckIcon, SpinnerIcon).

---

## Task 3: Create SocialRow.tsx

**File**: `apps/frontend/src/components/aria/SocialRow.tsx` (new file)

### Props interface

```tsx
interface SocialProvider {
  name: string;
  onClick: () => void;
}

interface SocialRowProps {
  providers: SocialProvider[];
  label?: string;
  className?: string;
}
```

### Complete file

```tsx
interface SocialProvider {
  name: string;
  onClick: () => void;
}

interface SocialRowProps {
  providers: SocialProvider[];
  label?: string;
  className?: string;
}

export function SocialRow({ providers, label = 'Or continue with', className }: SocialRowProps) {
  return (
    <div className={`bg-surface border border-surface-border rounded-lg p-4 ${className || ''}`}>
      {label && (
        <p className="text-xs text-muted text-center mb-3">{label}</p>
      )}
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={provider.onClick}
            className="flex items-center justify-center gap-2 w-full rounded-md py-2.5 text-sm font-medium bg-surface-elevated hover:bg-surface-border text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {provider.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Edge cases**:
- Empty `providers`: renders card with label only, no buttons, no errors
- Single provider: renders one button, layout unaffected
- Label hidden: pass `label=""` or `undefined`
- Duplicate `name` values: React key warning — consumer responsibility
- Consumer `className` appended, not replaced

**Dependencies**: None (pure presentational component, no icon imports).

---

## Task 4: Verify implementation

Run verification commands:

```bash
cd apps/frontend
grep -c "export function ArrowRightIcon\|export function FingerprintIcon" src/components/aria/icons.tsx
test -f src/components/aria/SubmitButton.tsx
test -f src/components/aria/SocialRow.tsx
pnpm typecheck && pnpm build
```

Expected results:
- `grep` command: output "2" (both new icons exported from icons.tsx)
- Both file existence tests: exit code 0
- `pnpm typecheck && pnpm build`: exit code 0 (no TypeScript errors, no build failures)

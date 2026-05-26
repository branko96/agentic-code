# Proposal: ARIA Chunk 4b-i — SubmitButton + SocialRow + 2 icons

## Summary

Build two reusable CTA components (SubmitButton, SocialRow) for the aria component family and add the missing ArrowRight + Fingerprint icons. No form or page integrations — just the building blocks.

## What We're Building

### 1. SubmitButton (`apps/frontend/src/components/aria/SubmitButton.tsx`)

A `<button>` wrapper that encodes the submit-button pattern currently duplicated inline in both login and register forms.

**Props:**
- `isLoading?: boolean` — shows SpinnerIcon, disables button
- `children: React.ReactNode` — button label text
- Standard `ButtonHTMLAttributes<HTMLButtonElement>` — allow `type`, `disabled`, `onClick`, etc.

**Styling (matches existing inline buttons):**
- `w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground`
- Glow: `shadow-[0_0_20px_rgba(34,211,238,0.3)]`
- Loading state: inline `SpinnerIcon` before children, `disabled:opacity-50 disabled:cursor-not-allowed`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary/50`
- Transition: `transition-all duration-200`

### 2. SocialRow (`apps/frontend/src/components/aria/SocialRow.tsx`)

A row of social provider buttons. Since no provider SVGs exist yet, render provider slots as icon-free buttons with the provider name, ready for icon injection later.

**Props:**
- `providers: Array<{ name: string; onClick: () => void }>` — configurable list
- `label?: string` — optional heading (default: "Or continue with")

**Styling:**
- Themed border card (`bg-surface border border-surface-border rounded-lg p-4`)
- Buttons: `flex items-center justify-center gap-2 w-full rounded-md py-2.5 text-sm font-medium bg-surface-elevated hover:bg-surface-border text-foreground transition-colors`
- Top label: `text-xs text-muted text-center mb-3`

**Design choice:** Accept an array of providers rather than hardcoding Google/GitHub/MS. The consumer controls which providers appear and what onClick does. Adding icons later is a pure addition — the component contract doesn't change.

### 3. Two new icons in `icons.tsx`

- **ArrowRightIcon**: `d="M5 12h14M12 5l7 7-7 7"` — standard arrow-right path
- **FingerprintIcon**: standard fingerprint SVG path (round lines, moderate complexity)

Both follow the exact existing pattern: `ICON_CLASSES`, `aria-hidden`, 24x24 viewBox, `fill="none" stroke="currentColor" strokeWidth={2}`, `<g strokeLinecap="round" strokeLinejoin="round">`.

## Non-goals (explicitly out of scope)

- Barrel/index.ts for aria components
- Integrating SubmitButton/SocialRow into auth forms or pages
- Sourcing or building Google/GitHub/Microsoft SVG icons
- Any form logic or page layout changes

## Files changed

| File | Action |
|------|--------|
| `apps/frontend/src/components/aria/icons.tsx` | Modify — add ArrowRightIcon + FingerprintIcon |
| `apps/frontend/src/components/aria/SubmitButton.tsx` | Create |
| `apps/frontend/src/components/aria/SocialRow.tsx` | Create |

## Acceptance criteria

1. SubmitButton renders a `<button>` with the correct styling, `isLoading` shows SpinnerIcon + disables, forwards ref, forwards extra HTML button props
2. SocialRow renders provider buttons from the `providers` array, fires `onClick` on click, shows label only when `label` is provided
3. ArrowRightIcon and FingerprintIcon render valid SVGs matching the existing icon convention
4. All components compile with no TypeScript errors (strict mode)
5. No regressions: existing icon exports unchanged, no form/page imports broken

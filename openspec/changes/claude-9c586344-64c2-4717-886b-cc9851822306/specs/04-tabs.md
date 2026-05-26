# Tabs.tsx — Specification

## File

`apps/frontend/src/components/aria/Tabs.tsx`

## Purpose

A segmented tab control with a sliding CSS-animated indicator. Replaces the current grid-based tab switcher in `components/auth/tabs.tsx` with an ARIA-styled version. The sliding indicator adds the visual polish missing from the current static implementation. Controlled component — no state ownership.

## Props Interface

```typescript
export type TabId = 'login' | 'register';

interface TabsProps {
  /** Currently active tab ID. Controlled from parent — no internal state. */
  activeTab: TabId;

  /** Called when user clicks a tab. Consumer updates state. */
  onChange: (tab: TabId) => void;

  /** Optional: custom tab labels. Defaults to { login: 'Iniciar sesión', register: 'Crear cuenta' } */
  tabs?: readonly { id: TabId; label: string }[];
}
```

## TabId Type Match

The `TabId` type MUST be a `type` (not `interface`) export from this file so that `page.tsx` can import it:

```typescript
// In apps/frontend/src/app/auth/page.tsx
import { TabId } from '@/components/aria/Tabs';
// Instead of inline: useState<'login' | 'register'>('login')
const [activeTab, setActiveTab] = useState<TabId>('login');
```

This ensures a single source of truth for tab identities across the auth surface.

## Rendered Structure

```tsx
<div className="relative grid grid-cols-2 rounded-lg bg-surface-border/10 p-1">
  {/* Sliding indicator */}
  <div
    className="absolute inset-y-1 left-1 right-auto w-[calc(50%-4px)] rounded-md bg-surface-elevated shadow-sm transition-transform duration-200 ease-out"
    style={{
      transform: activeTab === 'register' ? 'translateX(calc(100% + 8px))' : 'translateX(0)',
    }}
  />

  {/* Tab buttons */}
  {tabs.map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => onChange(tab.id)}
      className={cn(
        'relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200',
        activeTab === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground'
      )}
    >
      {tab.label}
    </button>
  ))}
</div>
```

## Sliding Indicator Implementation

### Approach: CSS Transform on absolute-positioned element

The indicator is an absolutely positioned `<div>` inside the container. Its position is driven by CSS `transform: translateX()`:

| activeTab  | transform value                | position  |
| ---------- | ------------------------------ | --------- |
| `login`    | `translateX(0)`                | Left tab  |
| `register` | `translateX(calc(100% + 8px))` | Right tab |

**Width calculation**: The indicator width is `calc(50% - 4px)` — half the container minus the 4px gap (1px padding on each side of the container + 1px gap between tabs).

**Why CSS transform instead of left/right**: `transform` is GPU-accelerated and avoids layout recalculations. The transition is cheaper and smoother.

### Transition

- Property: `transform`
- Duration: `duration-200` (200ms)
- Timing: `ease-out`
- Tailwind: `transition-transform duration-200 ease-out`

### Shadow / Glow on Indicator

- `shadow-sm` (subtle elevation shadow)
- `bg-surface-elevated` (slightly brighter background than the container)
- The indicator should NOT have a cyan glow here — that would compete with the submit button's glow. Keep it subtle.

### Tab Button Z-Index

- Buttons have `relative z-10` so they render above the sliding indicator
- Text colour: active = `text-foreground`, inactive = `text-muted hover:text-foreground`

### Container Background

- `bg-surface-border/10` — very subtle dark background for the tab group
- `rounded-lg p-1` — rounded corners with 4px padding
- `grid grid-cols-2` — two equal columns

## Default Labels

When `tabs` prop is not provided, default to:

```typescript
const DEFAULT_TABS = [
  { id: 'login' as const, label: 'Iniciar sesión' },
  { id: 'register' as const, label: 'Crear cuenta' },
] as const;
```

## CSS Animation (no new keyframes needed)

The sliding indicator uses CSS `transition` on `transform`, which is already available in Tailwind. The existing `animate-aria-*` keyframes in `globals.css` are NOT needed — this is a transition, not an animation.

**No new `globals.css` additions required** for the sliding indicator itself — it's entirely driven by Tailwind utility classes and inline `style={{ transform }}`.

## Accessibility

1. **`role="tablist"`** on the container — but the current pattern uses semantic `<button>` elements inside a controlled form. Adding `role="tablist"` is optional since these function as form navigation, not document tabs.
2. **`aria-selected`** — the active button should have `aria-selected={activeTab === tab.id}`.
3. **Keyboard navigation**: Buttons are natively keyboard-focusable. Left/Right arrow handling is NOT required (form navigation tabs don't need roving tabindex — tab flows through the whole control, then to the form fields).
4. **Disabled tabs**: Not a concern — both tabs are always enabled in the auth flow.

## States

| activeTab  | Indicator position | Button styles                   |
| ---------- | ------------------ | ------------------------------- |
| `login`    | Left               | Login=active, Register=inactive |
| `register` | Right              | Login=inactive, Register=active |

There is no loading or disabled state for individual tabs. The entire form is disabled during submission (handled by form-level loading state), but the tabs remain clickable.

## Export

Named export: `export function Tabs(...)` or `export const Tabs = (...) => ...`. Not default export.

The `TabId` type is also a named export: `export type TabId = 'login' | 'register'`.

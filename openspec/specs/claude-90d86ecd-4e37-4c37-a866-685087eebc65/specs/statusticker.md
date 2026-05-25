# Spec: StatusTicker Component

**File**: `apps/frontend/src/components/aria/StatusTicker.tsx` (CREATE)
**Type**: Client component (`'use client'` -- recommended for animation hydration consistency)
**Estimated lines**: ~30

---

## Purpose

A horizontal scrolling marquee strip positioned between the TopBar and the main content area. Displays hardcoded system status messages in a continuous loop. Purely decorative, no interactivity.

---

## Props

None.

```tsx
'use client';

export default function StatusTicker() {
  return ( /* ... */ );
}
```

---

## Behavior

The marquee loop is achieved via pure CSS animation (`animate-aria-marquee` from chunk 1) combined with triple-rendering the items array. The animation translates the inner container by `-100%` of its own width over 20 seconds, linear, infinite. Because the content is triplicated, as one copy scrolls out of view on the left, the next copy is already entering from the right, creating a seamless loop.

---

## Data

Hardcoded `ITEMS` array defined outside the component (module scope, not recreated on every render):

```tsx
const ITEMS = [
  'MONITOREO ACTIVO',
  'NUCLEO CUANTICO · NOMINAL',
  'LATENCIA · 4.2 MS',
  'UPTIME · 127H 33M',
  'ENLACE ESTABLECIDO',
  'Q-STATE · VERDE',
] as const;
```

Triple render: `[...ITEMS, ...ITEMS, ...ITEMS]` mapped to produce the seamless loop.

---

## Structure

```tsx
<div className="overflow-hidden whitespace-nowrap border-b border-t border-aria-accent/15 bg-aria-accent-soft/70 py-1">
  <div className="animate-aria-marquee inline-flex gap-6">
    {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
      <span key={i} className="font-mono text-xs text-aria-accent/70">
        {item}
      </span>
    ))}
  </div>
</div>
```

- **Outer container**:
  - `overflow-hidden` -- clips content that extends beyond the viewport width
  - `whitespace-nowrap` -- prevents line wrapping; all items stay on one line
  - `border-b border-t border-aria-accent/15` -- subtle cyan top and bottom borders
  - `bg-aria-accent-soft/70` -- semi-transparent cyan tinted background
  - `py-1` -- 4px vertical padding (compact)
- **Inner scrolling container**:
  - `animate-aria-marquee` -- applies the `aria-marquee` keyframe animation (~20s, linear, infinite, translateX(0) to translateX(-100%))
  - `inline-flex gap-6` -- items flow in a single horizontal row with 24px gaps between them
- **Each item**:
  - `font-mono text-xs text-aria-accent/70` -- monospace, small, muted cyan text

---

## Triple-Rendering Rationale

The `aria-marquee` animation moves the inner container from `translateX(0)` to `translateX(-100%)`. With a single copy, the content would scroll off-screen and leave a gap before the next loop begins. By rendering three copies, at any given moment:

1. Copy 1 is visible on screen (partially or fully)
2. As Copy 1 scrolls left, Copy 2 enters from the right
3. When the animation resets (back to `translateX(0)`), Copy 2 is in the same visual position that Copy 1 was at the start, creating a perception of continuous motion

The `overflow-hidden` on the outer container ensures no horizontal scrollbar appears.

---

## Integration Points

### Keyframe Animations Used

- `animate-aria-marquee` (from chunk 1, `aria-marquee` keyframes: `translateX(0)` to `translateX(-100%)` over 20s, linear, infinite)

### CSS Custom Properties / Tailwind Tokens Used

- `aria-accent` -- text color (at 70% opacity)
- `aria-accent-soft` -- background color (at 70% opacity)
- `font-mono` -- text font

### React State

None. The animation is entirely CSS-driven. The `'use client'` directive is present only to prevent SSR hydration mismatches with the animated element.

### No Dependencies On

- Any props or parent context
- Any child components
- Any external libraries

---

## Testable Assertions

1. **Outer container has overflow-hidden**: The outermost `<div>` has class `overflow-hidden` and `whitespace-nowrap`
2. **Marquee animation class is present**: The inner scrolling `<div>` has class `animate-aria-marquee`
3. **Items are triple-rendered**: The array spread produces `ITEMS.length * 3` span elements
4. **Items have correct styling**: Each `<span>` has classes `font-mono text-xs text-aria-accent/70`
5. **Background and borders**: Outer container has `bg-aria-accent-soft/70 border-b border-t border-aria-accent/15`
6. **No horizontal scrollbar**: `overflow-hidden` prevents any scrollbar from appearing
7. **Fixed items array**: The `ITEMS` array contains exactly 6 hardcoded strings
8. **No state or effects**: The component has no `useState`, `useEffect`, or other hooks
9. **`'use client'` directive**: The file starts with `'use client'` (for animation hydration consistency)

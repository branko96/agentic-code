# Spec: Footer Component

**File**: `apps/frontend/src/components/aria/Footer.tsx` (CREATE)
**Type**: Server component (no `'use client'`, no state, no interactivity)
**Estimated lines**: ~40

---

## Purpose

A fixed-position footer bar at the bottom of the viewport displaying copyright, compliance badges, and system status indicator dots. Always visible, pinned below all content.

---

## Props

None. All content is hardcoded.

```tsx
export default function Footer() {
  return ( /* ... */ );
}
```

---

## Structure

The component renders a single `<footer>` element with three internal sections laid out horizontally:

```
┌───────────────────────────────────────────────────────────────────┐
│ © COPYRIGHT      [ISO 27001 · SOC 2 Type II · GDPR]    [STATUS]  │
└───────────────────────────────────────────────────────────────────┘
```

### Outer Container

```tsx
<footer className="fixed bottom-0 left-0 right-0 z-50 flex h-8 items-center justify-between border-t border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6">
```

- **Positioning**: `fixed bottom-0 left-0 right-0 z-50` -- pinned to bottom, above all content (z-50)
- **Height**: `h-8` (32px)
- **Layout**: `flex items-center justify-between` -- single row, equal spacing
- **Border**: `border-t border-aria-accent/20` -- subtle cyan top border
- **Background**: `bg-aria-bg/80 backdrop-blur-sm` -- dark semi-transparent with backdrop blur
- **Padding**: `px-4 sm:px-6` -- responsive horizontal padding

---

## Section 1: Copyright (left-aligned)

```tsx
<span className="font-mono text-[10px] text-aria-accent/30">
  &copy; 2026 ARIA SYSTEMS &middot; TODOS LOS DERECHOS RESERVADOS
</span>
```

- **Text**: "© 2026 ARIA SYSTEMS · TODOS LOS DERECHOS RESERVADOS"
- **Styling**: `font-mono text-[10px] text-aria-accent/30` -- very small, muted, monospace
- **Always visible**: No responsive hiding

---

## Section 2: Compliance Badges (center)

```tsx
<div className="hidden items-center gap-3 sm:flex">
  <span className="font-mono text-[10px] text-aria-accent/40">ISO 27001</span>
  <span className="font-mono text-[10px] text-aria-accent/20">&middot;</span>
  <span className="font-mono text-[10px] text-aria-accent/40">SOC 2 Type II</span>
  <span className="font-mono text-[10px] text-aria-accent/20">&middot;</span>
  <span className="font-mono text-[10px] text-aria-accent/40">GDPR</span>
</div>
```

- **Badges**: "ISO 27001", "SOC 2 Type II", "GDPR"
- **Separators**: Middle dot (`·`) between each badge, even more muted (`text-aria-accent/20`)
- **Styling**: Each badge is `font-mono text-[10px] text-aria-accent/40`
- **Responsive**: `hidden sm:flex` -- hidden on screens < 640px, visible as flex row on sm+

---

## Section 3: Status Dots (right-aligned)

```tsx
<div className="flex items-center gap-3">
  {/* NUCLEO */}
  <div className="flex items-center gap-1">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-accent animate-aria-pulse-dot" />
    <span className="font-mono text-[10px] text-aria-accent/40">NUCLEO</span>
  </div>

  {/* RED */}
  <div className="flex items-center gap-1">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-success animate-aria-pulse-dot" />
    <span className="font-mono text-[10px] text-aria-accent/40">RED</span>
  </div>

  {/* ENLACE */}
  <div className="flex items-center gap-1">
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-warning animate-aria-pulse-dot" />
    <span className="font-mono text-[10px] text-aria-accent/40">ENLACE</span>
  </div>
</div>
```

- **Three indicators**:
  1. **NUCLEO** (Core) -- `bg-aria-accent` dot (cyan) -- core system
  2. **RED** (Network) -- `bg-aria-success` dot (green) -- network link
  3. **ENLACE** (Link) -- `bg-aria-warning` dot (amber) -- external link
- **Dot styling**: `h-1.5 w-1.5 rounded-full` (6px circle) with `animate-aria-pulse-dot`
  - Keyframes: `aria-pulse-dot` -- scale(1)/opacity(1) to scale(1.3)/opacity(0.5), 1.5s, cubic-bezier(0, 0, 0.2, 1), infinite
- **Label styling**: `font-mono text-[10px] text-aria-accent/40`
- **Gap between groups**: `gap-3` (12px); **gap within group**: `gap-1` (4px)
- **No responsive hiding**: Status dots are always visible

---

## Integration Points

### Keyframe Animations Used

- `animate-aria-pulse-dot` (from chunk 1, `aria-pulse-dot` keyframes) -- applied 3 times (NUCLEO, RED, ENLACE)

### CSS Custom Properties / Tailwind Tokens Used

- `aria-bg` -- footer background
- `aria-accent` -- text colors at various opacities, NUCLEO dot
- `aria-success` -- RED dot
- `aria-warning` -- ENLACE dot
- `font-mono` -- all text uses monospace

### React State

None. The component is a pure server component with no interactivity.

### No Dependencies On

- Any props or parent context
- Any child components
- Any external libraries

---

## Testable Assertions

1. **Fixed positioning**: The `<footer>` has class `fixed bottom-0 left-0 right-0 z-50`
2. **Height**: The `<footer>` has class `h-8` (32px tall)
3. **Background**: The `<footer>` has classes `bg-aria-bg/80 backdrop-blur-sm`
4. **Border**: The `<footer>` has class `border-t border-aria-accent/20`
5. **Copyright text**: Contains "© 2026 ARIA SYSTEMS" in `font-mono text-[10px] text-aria-accent/30`
6. **Compliance badges**: Container has class `hidden sm:flex` and contains "ISO 27001", "SOC 2 Type II", "GDPR"
7. **Three status dots**: Three `span` elements with `animate-aria-pulse-dot`, each with different background: `bg-aria-accent`, `bg-aria-success`, `bg-aria-warning`
8. **Dot size**: Each dot has `h-1.5 w-1.5 rounded-full` (6px circle)
9. **Status labels**: Labels "NUCLEO", "RED", "ENLACE" in `font-mono text-[10px] text-aria-accent/40`
10. **No `'use client'` directive**: Component does NOT start with `'use client'` (it is a server component)
11. **All content hardcoded**: No props, no state, no context

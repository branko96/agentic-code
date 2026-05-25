# Spec: Background Component

**File**: `apps/frontend/src/components/aria/Background.tsx` (CREATE)
**Type**: Server component (no `'use client'`, no state, no interactivity)
**Estimated lines**: ~50

---

## Purpose

A four-layer atmospheric backdrop rendered behind all page content via `position: fixed` with negative `z-index`. Purely decorative, no interactivity or state.

---

## Props

None. The component renders a standalone visual backdrop.

```tsx
export default function Background() {
  return ( /* ... */ );
}
```

---

## Layer 1: Base Radial Gradient

A full-viewport `<div>` with a centered cyan glow fading to dark:

```tsx
<div
  className="fixed inset-0 -z-50"
  style={{
    background:
      'radial-gradient(ellipse at 50% 0%, rgba(var(--aria-accent-rgb), 0.15) 0%, transparent 70%)',
  }}
/>
```

- **Positioning**: `fixed inset-0 -z-50` -- fills viewport, sits behind everything
- **Gradient**: radial ellipse centered at top-middle (50% 0%), cyan at center fading to transparent
- **Color**: uses `--aria-accent-rgb` so the alpha channel is controllable via `rgba()`
- **No animation** on this layer -- static gradient

---

## Layer 2: Grid Overlay

A fine repeating dot/cross grid pattern overlaid above the radial gradient:

```tsx
<div
  className="fixed inset-0 -z-40 pointer-events-none"
  style={{
    backgroundImage: `
      linear-gradient(rgba(var(--aria-accent-rgb), 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--aria-accent-rgb), 0.06) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)',
    WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)',
  }}
/>
```

- **z-index**: `-z-40` -- above the radial gradient (-z-50) but still behind content
- **Pattern**: two intersecting `linear-gradient` lines, every 48px, semi-transparent cyan (0.06 alpha)
- **Edge fade**: `maskImage` + `WebkitMaskImage` with a radial gradient that fades edges to transparent (the `WebkitMaskImage` fallback ensures Safari support)
- **Interaction passthrough**: `pointer-events-none` so it never blocks clicks on content above

---

## Layer 3: Sweep Line

An animated gradient strip that scans horizontally across the viewport:

```tsx
<div
  className="fixed inset-0 -z-30 pointer-events-none animate-aria-sweep opacity-20"
  style={{
    background:
      'linear-gradient(90deg, transparent 0%, rgba(var(--aria-accent-rgb), 0.3) 50%, transparent 100%)',
    backgroundSize: '200% 200%',
  }}
/>
```

- **Animation class**: `animate-aria-sweep` (defined in chunk 1 globals.css)
  - Keyframes: `aria-sweep` -- shifts `background-position` from `0% 50%` to `200% 50%` over 3s, linear, infinite
  - CSS rule also sets `background-size: 200% 200%` (the class already includes this)
- **Visual**: a horizontal gradient strip that sweeps left-to-right, creating a subtle "scan line" effect
- **Opacity**: `opacity-20` to keep it subtle
- **Non-blocking**: `pointer-events-none`

---

## Layer 4: Noise SVG

An inline `<svg>` element with `<feTurbulence>` producing a fine grain texture:

```tsx
<div className="fixed inset-0 -z-20 pointer-events-none opacity-[0.04]">
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="aria-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#aria-noise)" />
  </svg>
</div>
```

- **Texture type**: `fractalNoise` with high baseFrequency (0.65) for fine grain
- **Grayscale**: `feColorMatrix type="saturate" values="0"` removes all color, leaving pure noise
- **Opacity**: `opacity-[0.04]` -- extremely faint (visible but not distracting)
- **z-index**: `-z-20` -- topmost background layer, just below content
- **No interaction**: `pointer-events-none`

---

## Integration Points

### Keyframe Animations Used

- `animate-aria-sweep` (from chunk 1, globals.css line defining `aria-sweep` keyframes)

### CSS Custom Properties Used

- `--aria-accent-rgb` (defined in chunk 1, globals.css)

### No Dependencies On

- Any React state or hooks
- Any props or parent context
- Any child components

---

## Testable Assertions

1. **Renders without errors**: Component mounts and renders 4 div elements inside a fragment (or wrapper)
2. **All layers are fixed**: Each layer div uses `fixed inset-0` positioning
3. **z-index layering order**: Radial (-z-50) < Grid (-z-40) < Sweep (-z-30) < Noise (-z-20) -- all below default stacking context
4. **No interaction blocking**: Grid, Sweep, and Noise layers all have `pointer-events-none`
5. **Sweep line animates**: The sweep layer has class `animate-aria-sweep`
6. **Noise SVG renders**: The SVG element contains a `<filter>` with `<feTurbulence>` and a full-size `<rect>`
7. **Browser compatibility**: Both `maskImage` and `WebkitMaskImage` are set on the grid layer
8. **No `'use client'` directive**: Component is a server component (pure presentation)

# Spec: TopBar Component

**File**: `apps/frontend/src/components/aria/TopBar.tsx` (CREATE)
**Type**: Client component (`'use client'` -- live clock via `setInterval`)
**Estimated lines**: ~60

---

## Purpose

A fixed-position header bar at the top of the viewport displaying ARIA branding, system status indicators, and a live clock. Always visible, pinned above all content.

---

## Props

None. All content is hardcoded.

```tsx
'use client';

export default function TopBar() {
  return ( /* ... */ );
}
```

---

## Structure

The component renders a single `<header>` element with three internal sections laid out horizontally:

```
┌─────────────────────────────────────────────────────────────────┐
│ [BRAND]          [STATUS INDICATORS]              [LIVE CLOCK]  │
└─────────────────────────────────────────────────────────────────┘
```

### Outer Container

```tsx
<header className="fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-between border-b border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6">
```

- **Positioning**: `fixed top-0 left-0 right-0 z-50` -- pinned to top, above all content (z-50)
- **Height**: `h-10` (40px)
- **Layout**: `flex items-center justify-between` -- single row, equal spacing
- **Border**: `border-b border-aria-accent/20` -- subtle cyan bottom border
- **Background**: `bg-aria-bg/80 backdrop-blur-sm` -- dark semi-transparent with backdrop blur
- **Padding**: `px-4 sm:px-6` -- responsive horizontal padding

---

## Section 1: Brand (left-aligned)

```tsx
<div className="flex items-center gap-2">
  {/* Brand icon */}
  <svg
    className="h-4 w-4 text-aria-accent"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>

  {/* Text label */}
  <span className="font-mono text-xs font-semibold tracking-wider text-aria-accent">
    ARIA · Admin Console
  </span>

  {/* Version -- hidden on small screens */}
  <span className="hidden font-mono text-[10px] text-aria-accent/40 sm:inline">
    v2.4.1 · build 2847
  </span>
</div>
```

- **Icon**: 4 small filled rects forming a 2x2 grid (simplified "AC" BrandMark), cyan colored (`text-aria-accent`), `h-4 w-4`
- **Label**: `ARIA · Admin Console` in `font-mono text-xs font-semibold tracking-wider text-aria-accent`
- **Version**: `v2.4.1 · build 2847` in `font-mono text-[10px] text-aria-accent/40`
  - Wrapped in `hidden sm:inline` -- hidden on screens < 640px

---

## Section 2: Status Indicators (center-right)

```tsx
<div className="flex items-center gap-3">
  {/* Online status */}
  <div className="flex items-center gap-1.5">
    <span className="inline-block h-2 w-2 rounded-full bg-aria-success animate-aria-pulse-dot" />
    <span className="font-mono text-[10px] text-aria-accent/60">Sistema en linea</span>
  </div>

  {/* Connection badge */}
  <span className="hidden font-mono text-[10px] text-aria-accent/30 sm:inline">
    Conexion cifrada · TLS 1.3
  </span>
</div>
```

- **Online dot**: `h-2 w-2 rounded-full bg-aria-success` with `animate-aria-pulse-dot` class
  - Keyframes: `aria-pulse-dot` -- cycles between scale(1)/opacity(1) and scale(1.3)/opacity(0.5) over 1.5s, cubic-bezier(0, 0, 0.2, 1) easing, infinite
- **Online label**: `Sistema en linea` in `font-mono text-[10px] text-aria-accent/60`
- **Connection badge**: `Conexion cifrada · TLS 1.3` in `font-mono text-[10px] text-aria-accent/30`
  - Wrapped in `hidden sm:inline` -- hidden on screens < 640px

---

## Section 3: Live Clock (right-aligned)

```tsx
function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }
    tick(); // immediate first render (no blank frame)
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null; // SSR guard: render nothing on server

  return <span className="font-mono text-xs tabular-nums text-aria-accent">{time}</span>;
}
```

- **Format**: `HH:MM:SS` (24-hour, `hour12: false`)
- **Locale**: `es-AR` (matches the site language)
- **Styling**: `font-mono text-xs tabular-nums text-aria-accent` -- cyan, monospace, fixed-width digits (no layout shift on digit transitions)
- **Update interval**: 1000ms via `setInterval`
- **Cleanup**: `clearInterval` in the `useEffect` return function (prevents memory leaks on unmount)
- **SSR safety**: Returns `null` until the first `tick()` call produces a time string, preventing hydration mismatch
- **First render**: `tick()` is called synchronously inside the effect before `setInterval`, so the clock shows the current time immediately (no one-second blank)

---

## Integration Points

### Keyframe Animations Used

- `animate-aria-pulse-dot` (from chunk 1, `aria-pulse-dot` keyframes)

### CSS Custom Properties / Tailwind Tokens Used

- `aria-bg` -- header background
- `aria-accent` -- brand text, clock text, active elements
- `aria-success` -- green online status dot
- `font-mono` -- all text uses monospace

### React State

- `useState<string>` for clock time string
- `useEffect` for interval lifecycle

### No Dependencies On

- Any external libraries (no date formatting libs -- uses native `Date.toLocaleTimeString`)
- Any parent props or context
- Any child components

---

## Testable Assertions

1. **Fixed positioning**: The `<header>` has class `fixed top-0 left-0 right-0 z-50`
2. **Height**: The `<header>` has class `h-10` (40px tall)
3. **Background**: The `<header>` has classes `bg-aria-bg/80 backdrop-blur-sm`
4. **Border**: The `<header>` has class `border-b border-aria-accent/20`
5. **Brand section renders**: Contains SVG icon (`h-4 w-4 text-aria-accent`) and text "ARIA · Admin Console"
6. **Version string**: Contains "v2.4.1 · build 2847" with class `hidden sm:inline`
7. **Status dot uses `animate-aria-pulse-dot`**: Green dot span has class `animate-aria-pulse-dot`
8. **Connection badge**: Contains "TLS 1.3" with class `hidden sm:inline`
9. **Clock updates every second**: The `LiveClock` sub-component uses `setInterval(tick, 1000)` and `clearInterval` on cleanup
10. **Clock format**: Uses `toLocaleTimeString('es-AR', { hour12: false })` producing HH:MM:SS
11. **Clock digits are tabular**: The clock `span` has class `tabular-nums`
12. **SSR safety**: If `time` state is empty string, returns `null` (no clock rendered server-side)
13. **`'use client'` directive**: The file starts with `'use client'`

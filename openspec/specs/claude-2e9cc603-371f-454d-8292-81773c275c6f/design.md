# ARIA chunk 3/4 -- Side Panels Design

## Architecture Overview

The auth page transforms from a 1-column centered layout to a 3-column grid at `lg:` breakpoint (1024px). Two new panels flank the existing auth card: a left panel (AIOrb + metric cards) and a right panel (BootLog + Waveform + telemetry). All new components are purely presentational -- no state, no data fetching, no props beyond `loading` (forwarded for future use).

### Component Tree

```
page.tsx (AuthPage)
├── Background          (existing -- unchanged)
├── TopBar              (existing -- unchanged)
├── StatusTicker        (existing -- unchanged)
├── <main>              (CHANGED: flex → lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr])
│   ├── LeftPanel       (NEW -- hidden lg:block, w-72)
│   │   ├── AIOrb       (NEW -- 5 SVG/CSS layers, loading prop)
│   │   └── Metric Cards (NEW -- 3 cards in grid, each wrapped with Corners)
│   │       ├── OPERADORES card (Corners)
│   │       ├── UPTIME card     (Corners)
│   │       └── NODOS card      (Corners)
│   ├── Auth Card       (EXISTING -- unchanged DOM/structure)
│   │   ├── BrandMark
│   │   ├── Tabs
│   │   └── LoginForm / RegisterForm
│   └── RightPanel      (NEW -- hidden lg:block, w-72)
│       ├── BootLog     (NEW -- 5 hardcoded lines, blinking cursor)
│       ├── Waveform    (NEW -- 40 bars, staggered animation)
│       ├── Telemetry Grid (NEW -- 3 metric cards with Corners)
│       └── Security Disclaimer (NEW -- small text)
└── Footer              (existing -- unchanged)
```

### Data Flow

No data flows at all. Every component is static/cosmetic:

- **AIOrb**: Accepts `{ loading?: boolean }` prop forwarded from SidePanels. All visual layers are pure SVG/CSS. No external data.
- **BootLog**: No props. Five hardcoded log entries as an array constant.
- **Waveform**: No props. Forty hardcoded height values as an array constant.
- **Corners**: Accepts `{ color?: string; children: React.ReactNode }`. Pure CSS decoration.
- **SidePanels**: Accepts `{ loading?: boolean }`. Forwards `loading` to LeftPanel/AIOrb. No other state.

The `loading` prop chain: `page.tsx` → `SidePanels` → `LeftPanel` → `AIOrb`. It's hardcoded to `false` in page.tsx until chunk 4.

### page.tsx Integration

Current `<main>`:

```tsx
<main className="flex min-h-screen items-center justify-center pt-14 pb-10">
  <div className="mx-auto w-full max-w-[420px] p-6">{/* auth card */}</div>
</main>
```

New `<main>`:

```tsx
<main className="flex min-h-screen items-start justify-center pt-14 pb-10 lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]">
  <LeftPanel loading={false} />
  <div className="mx-auto w-full max-w-[420px] p-6">{/* auth card -- NO CHANGES */}</div>
  <RightPanel />
</main>
```

Key points:

- `flex` + `justify-center` remains for `< lg:` (single-column centering)
- `lg:grid` overrides to 3-column layout at 1024px+
- `items-start` keeps panels aligned at top
- Center div receives EXACTLY the same children as before
- LeftPanel/RightPanel are hidden below `lg:` via `hidden lg:block`

---

## Component Design

### AIOrb.tsx

**File:** `apps/frontend/src/components/aria/AIOrb.tsx`

**Props:**

```tsx
interface AIOrbProps {
  loading?: boolean;
}
```

**Structure -- 5 SVG layers, abspos within relative container (w-44 h-44):**

1. **Outer Ring** (SVG, viewBox 0 0 200 200):
   - 60 tick marks radiating from center
   - Every 5th tick extends further (12px vs 6px)
   - `animate-aria-spin-slow` class (4s linear, clockwise)
   - Each tick: line from inner radius to outer radius, rotated by `(i * 6)deg`
   - CSS `transform-origin: center` set on the group for rotation

2. **Mid Ring** (SVG, viewBox 0 0 200 200):
   - Smaller diameter than outer ring (~80% scale)
   - Fewer tick marks (30), every 3rd extends
   - `animate-aria-spin-rev` class (4s linear, counter-clockwise)

3. **Core** (div + SVG elements):
   - `radialGradient` from center-cyan to edge-transparent
   - Circle element filled with gradient
   - Ellipse highlight (white/cyan at ~20% opacity) offset to top-left for specular effect
   - Optional: box-shadow glow via Tailwind `shadow-cyan-400/20`

4. **Equator Ring** (SVG ellipse):
   - Ellipse at center of orb
   - Stroke: cyan-400 at ~40% opacity
   - CSS: `transform: rotate(-12deg)`

5. **Satellites** (3-4 small circles):
   - Positioned on circular orbit paths
   - Each satellite has its own CSS transform for orbit position
   - When `loading={true}`: `animate-aria-spin-fast` (1s, fast orbit)
   - When `loading={false}`: `animate-aria-spin-slow` (4s, slow orbit)
   - Each satellite: small circle (r=3) filled cyan-400, with a glow dot

**Static data -- metric cards below the orb:**
Three metric cards rendered in a 2x2 grid (first cell spans 2 columns for the orb label):

| Metric     | Label      | Value     |
| ---------- | ---------- | --------- |
| OPERADORES | OPERADORES | 4 ACTIVE  |
| UPTIME     | UPTIME     | 127H      |
| NODOS      | NODOS      | 12 ONLINE |

Each card uses `Corners` for the sci-fi framing effect.

---

### BootLog.tsx

**File:** `apps/frontend/src/components/aria/BootLog.tsx`

**Props:** None

**Content -- hardcoded array of 5 log entries:**

```tsx
const LOG_LINES = [
  { status: 'OK', message: 'System initialized', highlight: false },
  { status: 'OK', message: 'Memory check passed', highlight: false },
  { status: 'OK', message: 'Network link established', highlight: false },
  { status: 'OK', message: 'Security handshake complete', highlight: false },
  { status: '>>', message: 'Awaiting authentication...', highlight: true },
] as const;
```

**Rendering per line:**

- `[ OK ]` prefix: `text-green-400` (`#34d399`)
- `[ >> ]` prefix: `text-cyan-400` (`#22d3ee`)
- Message text: `text-white/80` (or `text-cyan-400` for highlight line)
- Font: `font-mono text-xs`
- Last line appends a blinking cursor span: `<span className="animate-aria-blink text-cyan-400">_</span>`

**Container:**

- Dark translucent background: `bg-surface/80` or `bg-black/30`
- Rounded corners, padding, border matching ARIA HUD aesthetic
- Uses `border border-aria-accent/10` for subtle frame

---

### Waveform.tsx

**File:** `apps/frontend/src/components/aria/Waveform.tsx`

**Props:** None

**Structure:**

- 40 div bars in a flex container (`flex items-end gap-[1px]`)
- Container: fixed height (`h-12` or `h-16`)
- Each bar: `flex-1`, gradient background (`bg-gradient-to-t from-cyan-400 to-transparent` or similar)
- Animation: `animate-aria-wave` class
- Stagger: inline `style={{ animationDelay: ${i * 60}ms }}` for each bar

**Hardcoded heights -- seed array of 40 values:**
Waveform profile resembling an audio visualization (higher in middle, lower at edges):

```
[0.3, 0.5, 0.4, 0.6, 0.45, 0.7, 0.55, 0.8, 0.65, 0.85,
 0.7, 0.9, 0.75, 0.95, 0.8, 0.9, 0.75, 0.85, 0.7, 0.8,
 0.65, 0.9, 0.75, 1.0, 0.85, 1.0, 0.9, 0.85, 0.75, 0.8,
 0.7, 0.75, 0.6, 0.65, 0.55, 0.6, 0.5, 0.55, 0.45, 0.5]
```

Each value is a scale factor applied as `height: ${value * 100}%` on the bar.

**Container:**

- Dark background with subtle border (`border border-aria-accent/10 bg-black/30`)
- Label or small title text above ("WAVEFORM" or similar)
- Rounded container

---

### Corners.tsx

**File:** `apps/frontend/src/components/aria/Corners.tsx`

**Props:**

```tsx
interface CornersProps {
  color?: string;
  children: React.ReactNode;
}
```

**Structure:**

- Outer container: `relative`
- 4 corner divs, each `absolute` positioned at a container corner
- Each corner: 2 border lines forming an L-bracket
  - Top-left: `border-t` + `border-l`, positioned `top-[-1px] left-[-1px]` (1px overlap for clean join)
  - Top-right: `border-t` + `border-r`
  - Bottom-left: `border-b` + `border-l`
  - Bottom-right: `border-b` + `border-r`
- Line length: ~10-12px (using `w-3 h-3` or similar fixed dimensions)
- Line width: `border-[1px]` (thin)
- Color: `style={{ borderColor: color }}` with `#22d3ee` default

**Corner bracket implementation approach:**
Each corner is a single div with 2 borders creating the L-shape:

```tsx
<div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: color }} />
```

This gives a clean 10-12px L-bracket at each corner. The div dimensions control the line length.

---

### SidePanels.tsx

**File:** `apps/frontend/src/components/aria/SidePanels.tsx`

**Props:**

```tsx
interface SidePanelsProps {
  loading?: boolean;
}
```

**Structure -- two internal components exported together:**

```tsx
export function LeftPanel({ loading = false }: { loading?: boolean }) {
  // AIOrb centered in container
  // 3 metric cards below in a grid/flex layout
  // hidden lg:block, w-72
}

export function RightPanel() {
  // BootLog
  // Waveform
  // Telemetry grid (3 metric cards)
  // Security disclaimer
  // hidden lg:block, w-72
}
```

**LeftPanel layout:**

```
┌──────────────────────────┐
│                          │
│        AIOrb             │  ← centered (flex justify-center)
│        (w-44 h-44)       │
│                          │
│  ┌─────────┐ ┌─────────┐ │
│  │OPERADORES│ │ UPTIME  │ │  ← 2-column grid
│  │4 ACTIVE  │ │ 127H    │ │
│  └─────────┘ └─────────┘ │
│  ┌──────────────────────┐ │
│  │       NODOS          │ │  ← full-width card
│  │     12 ONLINE        │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

**RightPanel layout:**

```
┌──────────────────────────┐
│  BootLog                 │
│  ┌────────────────────┐  │
│  │ [OK] System init.. │  │
│  │ [OK] Memory check..│  │
│  │ [OK] Network link..│  │
│  │ [OK] Security hand.│  │
│  │ [>>] Awaiting auth_│  │  ← blinking cursor
│  └────────────────────┘  │
│                          │
│  Waveform                │
│  ▂▃▅▆▇█▇▆▅▃▂▁  ...       │  ← 40-bar visualization
│                          │
│  ┌──────┐ ┌──────┐ ┌───┐ │
│  │LATEN. │ │PAQ.  │ │SEG│ │  ← telemetry cards
│  │4.2MS  │ │12.4K │ │AES│ │
│  └──────┘ └──────┘ └───┘ │
│                          │
│  ENCRYPTED CHANNEL //    │
│  AES-256-GCM             │  ← security disclaimer
└──────────────────────────┘
```

**Visibility:**

- Each panel uses `hidden lg:block` -- invisible below 1024px, visible at 1024px+
- Fixed width: `w-72` (288px)
- Inner padding: `p-3` or `p-4`

**Metric Cards (used in both panels):**
Each metric card pattern:

```tsx
<Corners color="#22d3ee">
  <div className="bg-surface/50 p-2 text-center">
    <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
      {label}
    </div>
    <div className="font-mono text-sm text-cyan-400">{value}</div>
  </div>
</Corners>
```

---

## CSS Considerations

**No changes needed to `globals.css`.** All required animations are already defined:

| Animation Class          | Keyframe         | Duration | Behavior                               |
| ------------------------ | ---------------- | -------- | -------------------------------------- |
| `animate-aria-spin-slow` | `aria-spin-slow` | 4s       | Clockwise rotation                     |
| `animate-aria-spin-rev`  | `aria-spin-rev`  | 4s       | Counter-clockwise rotation             |
| `animate-aria-spin-fast` | `aria-spin-fast` | 1s       | Fast clockwise rotation                |
| `animate-aria-wave`      | `aria-wave`      | 2s       | Vertical scale oscillation (1 to 1.15) |
| `animate-aria-blink`     | `aria-blink`     | 1s       | Opacity toggle (steps, not smooth)     |
| `animate-aria-pulse`     | `aria-pulse`     | 2s       | Opacity fade                           |

**Design tokens available from `globals.css` CSS variables:**

- `--aria-accent`: `#22d3ee` (cyan-400)
- `--aria-accent-rgb`: `34, 211, 238`
- `--aria-accent-soft`: `rgba(34, 211, 238, 0.12)`
- `--aria-success`: `#34d399` (green-400)
- `--aria-success-rgb`: `52, 211, 153`
- `--surface`: `#0f172a`
- `--surface-border`: `rgba(148, 163, 184, 0.2)`

**Tailwind JIT will generate utility classes automatically** for inline `style` values and Tailwind class names used. Since we use standard Tailwind color classes (`cyan-400`, `green-400`) and the existing ARIA design tokens, no `tailwind.config.ts` changes are needed.

---

## File Structure After Changes

```
apps/frontend/src/
├── app/
│   ├── auth/
│   │   └── page.tsx              (MODIFIED -- adds LeftPanel + RightPanel imports and grid layout)
│   └── globals.css               (UNCHANGED)
└── components/
    └── aria/
        ├── AIOrb.tsx             (NEW)
        ├── Background.tsx        (existing)
        ├── BootLog.tsx           (NEW)
        ├── Corners.tsx           (NEW)
        ├── Footer.tsx            (existing)
        ├── SidePanels.tsx        (NEW -- exports LeftPanel and RightPanel)
        ├── StatusTicker.tsx      (existing)
        ├── TopBar.tsx            (existing)
        └── Waveform.tsx          (NEW)
```

---

## Edge Cases and States

### Viewport sizes

- **< 1024px (mobile/tablet):** Side panels hidden. Auth card centered. Same as chunk 2.
- **>= 1024px (desktop):** 3-column grid. Auth card in center column (420px-460px). Side panels at 288px each.
- **1024px-1380px:** Side panels + center card fit with minimal margins.
- **> 1380px:** Extra space distributes evenly in the `1fr` columns.

### Loading state

- `loading={false}` (current): All components render with slow animations.
- `loading={true}` (future): Only AIOrb satellites spin faster. All other components unchanged.

### Empty/temporal

- No data loading required. All content is static.
- No suspense boundaries needed.
- No error states possible (no data fetching).

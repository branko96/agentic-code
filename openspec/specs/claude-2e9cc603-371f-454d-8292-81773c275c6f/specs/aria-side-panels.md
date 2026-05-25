# ARIA Side Panels -- Spec Deltas

## Capability: Three-Column Desktop Layout

### ADDED: Three-column grid layout at `lg:` breakpoint

The auth page SHALL render a three-column layout when the viewport is at or above the `lg:` Tailwind breakpoint (1024px).

**Grid structure:**

- The `<main>` element SHALL use `lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]` to create three proportional columns.
- The left column (fraction `1fr`) SHALL contain the LeftPanel component.
- The center column (clamped between 420px and 460px) SHALL contain the existing auth card (`BrandMark`, `Tabs`, `LoginForm`/`RegisterForm`).
- The right column (fraction `1fr`) SHALL contain the RightPanel component.
- The `<main>` SHALL retain `flex`, `min-h-screen`, and `items-start` for stacking behavior; `justify-center` is replaced by the grid at `lg:` only.

**Center column preservation:**

- The center column SHALL render the exact same auth card DOM, styles, and interactive behavior as defined in chunk 2 (`BrandMark` + `Tabs` + forms inside a `rounded-xl border` card at `max-w-[420px]`).
- No visual regression: all form inputs, validation, tab switching, and auth flow remain unchanged.

**Visibility below `lg:`:**

- The left and right panels SHALL be hidden below `lg:` via `hidden lg:block` (or equivalent Tailwind utility).
- On viewports narrower than 1024px, the page SHALL render identically to the chunk 2 single-column layout.
- The auth card SHALL remain usable at all viewport widths.

**Existing chrome:**

- `Background`, `TopBar`, `StatusTicker`, and `Footer` SHALL continue to render unconditionally above and below the `<main>` grid, exactly as in chunk 2.

**GIVEN** the viewport is at or above 1024px width
**WHEN** the auth page loads
**THEN** three columns display: left panel, center auth card, right panel
**AND** the auth card is unchanged from chunk 2

**GIVEN** the viewport is below 1024px width
**WHEN** the auth page loads
**THEN** only the centered auth card displays
**AND** the side panels are not visible
**AND** the page layout matches chunk 2 exactly

---

## Capability: AIOrb Visual Component

### ADDED: AIOrb animated visualization

The AIOrb component SHALL render a cyan-themed animated orb composed of concentric SVG and CSS layers.

**Component signature:**

```tsx
interface AIOrbProps {
  loading?: boolean;
}
```

- `loading` defaults to `false` when omitted.
- The component exports as a named export: `export function AIOrb({ loading = false }: AIOrbProps)`.

**Visual layers (bottom to top):**

1. **Outer ring** -- An SVG `<circle>` or ring with 60 tick marks rendered at equal angular intervals. Every 5th tick is longer (e.g., 6px vs 3px). The entire outer ring rotates using `animate-aria-spin-slow` (4s linear infinite, from Tailwind config).

2. **Mid ring** -- An SVG ring slightly smaller than the outer ring, rotating in the opposite direction using `animate-aria-spin-rev` (4s linear infinite, reverse direction).

3. **Core** -- A circular element with a `radial-gradient` background (center cyan, edge transparent/dark). Contains an inner sphere and a highlight glow (smaller white/cyan ellipse offset toward top-left to simulate specular light).

4. **Equator ring** -- An elliptical ring tilted at approximately -12 degrees, rendered as a thin cyan border/outline at the horizontal midline of the orb.

5. **Satellites** -- Small cyan dots orbiting around the orb. When `loading={true}`, satellites use `animate-aria-spin-fast` (1s). When `loading={false}`, satellites use `animate-aria-spin-slow` (4s). There are at least 2 visible satellites.

**Color contract:**

- All colors SHALL be hardcoded to Tailwind's `cyan-400` (`#22d3ee`).
- No `accent` prop -- the component does not accept a color parameter.
- Opacity variations (e.g., `cyan-400/40`, `cyan-400/20`) are permitted for depth effects.

**Sizing:**

- The orb SHALL fit within a container of approximately `w-44 h-44` (176px) or similar.
- It SHALL be centered within its parent using flexbox or grid centering.

**GIVEN** the AIOrb component renders with `loading={false}`
**WHEN** the page is displayed
**THEN** all 5 visual layers are visible
**AND** outer ring spins slowly clockwise
**AND** mid ring spins slowly counter-clockwise
**AND** satellites orbit at slow speed
**AND** all colors are cyan (#22d3ee)

**GIVEN** the AIOrb component renders with `loading={true}`
**WHEN** the page is displayed
**THEN** satellites spin at fast speed (`animate-aria-spin-fast`)
**AND** all other layers render identically

---

## Capability: BootLog Visual Component

### ADDED: BootLog terminal-style display

The BootLog component SHALL render a terminal-style log with hardcoded boot lines.

**Component signature:**

```tsx
export function BootLog() {}
```

- No props accepted. The component is purely cosmetic.

**Content (5 hardcoded lines):**

1. `[ OK ]` -- System initialized (green checkmark, white text)
2. `[ OK ]` -- Memory check passed (green checkmark, white text)
3. `[ OK ]` -- Network link established (green checkmark, white text)
4. `[ OK ]` -- Security handshake complete (green checkmark, white text)
5. `[ >> ]` -- Awaiting authentication... (cyan status indicator, cyan text, blinking cursor)

**Visual styling:**

- Each line SHALL use `font-mono` (JetBrains Mono from the project font config).
- Checkmark indicators `[ OK ]` SHALL render in green (Tailwind green-400 or the `aria-success` token).
- The last line's prefix `[ >> ]` and its text SHALL render in cyan (cyan-400, #22d3ee).
- The last line SHALL display a blinking cursor (`▌` or `_` character) using the `animate-aria-blink` CSS animation (1s steps(1) infinite, opacity toggle).
- Text size SHALL be `text-xs` or `text-sm`.
- The container SHALL use a dark/translucent background consistent with the ARIA HUD aesthetic.

**Data contract:**

- All log lines are hardcoded static strings. No data connection, no WebSocket, no state management.
- The component does not accept a `messages` prop.

**GIVEN** the BootLog component renders
**WHEN** the page is displayed
**THEN** exactly 5 boot lines appear in monospace font
**AND** the first 4 lines show green checkmarks
**AND** the 5th line shows a cyan cursor that blinks using CSS animation
**AND** no data connection or WebSocket exists

---

## Capability: Waveform Visual Component

### ADDED: Waveform bar chart visualization

The Waveform component SHALL render an animated bar chart visualization with staggered animation delays.

**Component signature:**

```tsx
export function Waveform() {}
```

- No props accepted. The component is purely cosmetic.

**Bars:**

- The component SHALL render exactly 40 vertical bars.
- Each bar SHALL use a gradient background from cyan (`cyan-400` / `#22d3ee`) to transparent.
- Each bar SHALL animate using the `animate-aria-wave` CSS animation (2s ease-in-out infinite, vertical scale oscillation between 1 and 1.15).
- Animation delay SHALL stagger by 60ms per bar: bar 0 = 0ms, bar 1 = 60ms, bar 2 = 120ms, ..., bar 39 = 2340ms.

**Layout:**

- Bars SHALL be arranged horizontally in a single row.
- Container SHALL use `flex` with `items-end` so bars align at the bottom.
- Bar heights SHALL vary (random-looking seed values) to create a waveform silhouette.
- The container SHALL have a fixed height (e.g., `h-12` or `h-16`) with bars extending upward from the bottom.

**Data contract:**

- Bar heights are hardcoded static values. No audio connection, no real telemetry.

**GIVEN** the Waveform component renders
**WHEN** the page is displayed
**THEN** exactly 40 bars appear with cyan-to-transparent gradients
**AND** each bar animates with staggered 60ms delay intervals
**AND** bar heights form a visible waveform pattern
**AND** no audio or telemetry connection exists

---

## Capability: Corners Decorative Element

### ADDED: Corner bracket decorative component

The Corners component SHALL render four decorative corner brackets around its children.

**Component signature:**

```tsx
interface CornersProps {
  color?: string;
  children: React.ReactNode;
}
export function Corners({ color = '#22d3ee', children }: CornersProps) {}
```

- `color` SHALL accept a CSS color value (hex, rgb, Tailwind token). Defaults to `#22d3ee` (cyan-400).
- `children` SHALL be rendered as the component's inner content.

**Corner rendering:**

- Each corner (top-left, top-right, bottom-left, bottom-right) SHALL render as two 1px solid border lines forming an L-shaped bracket.
- Corner lines SHALL extend approximately 10-12px from the container edge.
- The lines SHALL use the `color` prop value for `border-color`.
- Corners SHALL be positioned absolutely relative to the container.

**Container:**

- The outer container SHALL have `position: relative` to anchor corner positions.
- Children render in the normal document flow inside the corners.

**GIVEN** the Corners component wraps content with `color="#ff0000"`
**WHEN** the page is displayed
**THEN** four red corner brackets appear at each corner
**AND** the child content renders inside the bracket frame

**GIVEN** the Corners component renders without a `color` prop
**WHEN** the page is displayed
**THEN** all corner brackets default to cyan (#22d3ee)

---

## Capability: SidePanels Wrapper

### ADDED: SidePanels layout wrapper

The SidePanels component SHALL compose LeftPanel and RightPanel with visibility control.

**Component signature:**

```tsx
interface SidePanelsProps {
  loading?: boolean;
}
export function SidePanels({ loading = false }: SidePanelsProps) {}
```

- `loading` defaults to `false`.
- The `loading` value SHALL be forwarded to the LeftPanel (which forwards it to AIOrb).

**LeftPanel (internal):**

- Wraps the AIOrb component centered in its container.
- Below the AIOrb, renders a 3-card metrics grid (2x2 grid with one cell merged or 3 items in flex/grid layout):
  1. **OPERADORES** -- Label + hardcoded value (e.g., "4 ACTIVE")
  2. **UPTIME** -- Label + hardcoded value (e.g., "127H")
  3. **NODOS** -- Label + hardcoded value (e.g., "12 ONLINE")
- Each metric card SHALL use the `Corners` component for its decorative border.
- The entire LeftPanel SHALL be `hidden lg:block` so it only appears at `lg:` and above.

**RightPanel (internal):**

- Wraps the BootLog component.
- Below the BootLog, renders the Waveform component.
- Below the Waveform, renders telemetry stats (2-3 metric cards similar to LeftPanel, e.g., "LATENCIA", "PAQUETES", "SEGURIDAD").
- Below the telemetry stats, renders a small security footer text (e.g., "ENCRYPTED CHANNEL // AES-256-GCM").
- All metric cards within RightPanel SHALL use the `Corners` component.
- The entire RightPanel SHALL be `hidden lg:block`.

**Visibility:**

- At viewports below `lg:`, both LeftPanel and RightPanel SHALL render nothing (hidden).
- At `lg:` and above, both panels SHALL display at their assigned grid positions.

**Width:**

- Both panels SHALL use `w-72` (288px) fixed width.
- Content SHALL be padded within the panel container (e.g., `p-3` or `p-4`).

**No data connection:**

- All metric values (operators, uptime, nodes, latency, packets, security) are hardcoded strings. No API calls, no WebSocket, no state management.

**GIVEN** the viewport is at or above `lg:` breakpoint
**WHEN** the auth page loads
**THEN** LeftPanel displays AIOrb + 3 metric cards (OPERADORES, UPTIME, NODOS)
**AND** RightPanel displays BootLog + Waveform + telemetry stats + security footer
**AND** both panels use `w-72` width

**GIVEN** the viewport is below `lg:` breakpoint
**WHEN** the auth page loads
**THEN** neither LeftPanel nor RightPanel renders visible content
**AND** the auth card fills the viewport

**GIVEN** `loading={true}` is passed to SidePanels
**WHEN** the page is displayed
**THEN** the AIOrb satellites spin at fast speed
**AND** all other static content renders identically

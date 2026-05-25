# ARIA chunk 3/4 -- Side Panels: Implementation Tasks

## Task 1: Create `Corners.tsx` decorative component

- **File:** `apps/frontend/src/components/aria/Corners.tsx` (NEW)
- **What:** 4 corner brackets with configurable color prop. Renders `children` inside a relative container with 4 absolutely-positioned L-bracket divs at each corner.
- **Verify:** Component renders 4 absolutely positioned spans with border styles, children render inside, default color is `#22d3ee`.
- **Dependencies:** None

---

## Task 2: Create `AIOrb.tsx` animated orb component

- **File:** `apps/frontend/src/components/aria/AIOrb.tsx` (NEW)
- **What:** 5-layer SVG orb with concentric rings, core, equator, and satellites. Accepts optional `loading` boolean prop.
  - Outer ring: 60 tick marks, every 5th longer, `animate-aria-spin-slow`
  - Mid ring: ~80% scale, 30 tick marks, every 3rd extends, `animate-aria-spin-rev`
  - Core: radial gradient from cyan center to transparent edge, specular ellipse highlight
  - Equator ring: elliptical ring tilted -12 degrees, thin cyan stroke
  - Satellites: 3-4 small cyan dots on orbit paths; `animate-aria-spin-fast` when `loading=true`, `animate-aria-spin-slow` when `loading=false`
- **Props:** `{ loading?: boolean }` (defaults `false`)
- **Verify:** SVG elements present, correct animation classes, cyan-400 (`#22d3ee`) colors hardcoded, no color prop, orb fits within ~`w-44 h-44` container.
- **Dependencies:** None (standalone component)

---

## Task 3: Create `BootLog.tsx` boot sequence display

- **File:** `apps/frontend/src/components/aria/BootLog.tsx` (NEW)
- **What:** 5 hardcoded boot log lines with colored status and blinking cursor. Renders a dark-background terminal-style box.
  - Lines 1-4: `[ OK ]` prefix in green-400 (`#34d399`), message in white/80
  - Line 5: `[ >> ]` prefix in cyan-400 (`#22d3ee`), message in cyan-400, cursor `_` with `animate-aria-blink`
- **Props:** None (purely cosmetic, no `messages` prop)
- **Verify:** Exactly 5 lines, green checkmarks on first 4, cyan cursor with `animate-aria-blink` on 5th, `font-mono text-xs`, dark translucent container with ARIA HUD border styling.
- **Dependencies:** None

---

## Task 4: Create `Waveform.tsx` audio visualization

- **File:** `apps/frontend/src/components/aria/Waveform.tsx` (NEW)
- **What:** 40 animated bars with staggered delays and gradient styling. Container uses `flex items-end` with fixed height (`h-12` or `h-16`). Each bar uses `bg-gradient-to-t from-cyan-400 to-transparent` and `animate-aria-wave`.
- **Props:** None (purely cosmetic)
- **Stagger:** Each bar has inline `style={{ animationDelay: '${i * 60}ms' }}` for staggered wave effect.
- **Heights:** hardcoded array of 40 scale values (0.3 to 1.0) forming a waveform profile.
- **Verify:** 40 bar elements, `animate-aria-wave` class applied, staggered `animationDelay` inline styles at 60ms intervals, gradient backgrounds, dark container with subtle border.
- **Dependencies:** None

---

## Task 5: Create `SidePanels.tsx` layout wrappers

- **File:** `apps/frontend/src/components/aria/SidePanels.tsx` (NEW)
- **What:** Exports `LeftPanel` and `RightPanel` as named exports. Each composes the visual components into a cohesive panel.
  - **LeftPanel** (`{ loading?: boolean }`): centered AIOrb + 3 metric cards (OPERADORES "4 ACTIVE", UPTIME "127H", NODOS "12 ONLINE") in a 2x2 grid, each card wrapped in `Corners`. `hidden lg:block w-72`.
  - **RightPanel** (no props): BootLog + Waveform + 3 telemetry cards (LATENCIA "4.2MS", PAQUETES "12.4K", SEGURIDAD "AES") + security disclaimer "ENCRYPTED CHANNEL // AES-256-GCM". `hidden lg:block w-72`.
- **Verify:** Imports all 4 new components (Corners, AIOrb, BootLog, Waveform), both panels have `hidden lg:block`, metric cards use `Corners`, correct static data values, correct widths (`w-72`/288px).
- **Dependencies:** Corners, AIOrb, BootLog, Waveform (Tasks 1-4)

---

## Task 6: Update `page.tsx` to 3-column layout

- **File:** `apps/frontend/src/app/auth/page.tsx` (MODIFY)
- **What:** Replace single-column flex layout with 3-column CSS grid at `lg:`. Import and mount `LeftPanel` and `RightPanel` from `SidePanels.tsx`.
  - `<main>` changes from `flex min-h-screen items-center justify-center` to `flex min-h-screen items-start justify-center pt-14 pb-10 lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]`
  - `LeftPanel` and `RightPanel` are placed as direct children of `<main>`, before and after the center auth card div respectively.
  - LeftPanel receives `loading={false}` (hardcoded until chunk 4).
  - The center auth card div (with existing `BrandMark`, `Tabs`, forms) is completely unchanged.
  - Existing chrome (Background, TopBar, StatusTicker, Footer) is completely unchanged.
- **Verify:** Grid layout at `lg:` breakpoint, side panels hidden below `lg:`, auth card renders identically in center column at `max-w-[420px]`. No visual regression in auth flow (tabs, forms, validation).
- **Dependencies:** SidePanels (Task 5)

---

## Task 7: Type-check, lint, and build

- **Commands:** `pnpm --filter frontend typecheck`, `pnpm --filter frontend lint`, `pnpm --filter frontend build`
- **What:** Verify all new and modified code compiles and passes linting.
- **Verify:** All three commands exit 0 with no errors.
- **Dependencies:** Tasks 1-6

---

## Review Workload Forecast

- **Total files changed:** 6 new + 1 modified = 7 files
- **Estimated lines:** ~250 lines total (Corners ~40, AIOrb ~100, BootLog ~35, Waveform ~35, SidePanels ~90, page.tsx diff ~15)
- **Chained PRs recommended:** No (single cohesive change under 400 lines)
- **400-line budget risk:** Low (~63% of budget)
- **Decision needed before apply:** No

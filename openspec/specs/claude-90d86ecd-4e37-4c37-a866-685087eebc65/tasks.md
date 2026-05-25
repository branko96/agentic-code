# Tasks: ARIA Chunk 2/4 — Atmosphere Layer

**Phase**: sdd-tasks
**Covers**: Background, TopBar, StatusTicker, Footer, and auth page wrapping

---

## Task Breakdown

All tasks are ordered and build on each other. Each task is independently verifiable.

---

### Task 1: Create `components/aria/Background.tsx`

**Type**: New file (server component)
**Est. lines**: ~50
**Files**: `apps/frontend/src/components/aria/Background.tsx` (CREATE)

**What to build:**

A server component (no `'use client'` directive) with four `<div>` layers inside a fragment:

1. **Layer 1 (Radial Gradient)**: `fixed inset-0 -z-50`, inline `radial-gradient` at `50% 0%`, cyan-to-transparent via `rgba(var(--aria-accent-rgb), 0.15)`
2. **Layer 2 (Grid Overlay)**: `fixed inset-0 -z-40 pointer-events-none`, dual `linear-gradient` lines every 48px, faded edges via `maskImage` + `WebkitMaskImage`
3. **Layer 3 (Sweep Line)**: `fixed inset-0 -z-30 pointer-events-none animate-aria-sweep opacity-20`, horizontal gradient stripe
4. **Layer 4 (Noise SVG)**: `fixed inset-0 -z-20 pointer-events-none opacity-[0.04]`, inline SVG with `<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3">` + `<feColorMatrix type="saturate">` + full-size `<rect>`

**Done when:**

- File is at `apps/frontend/src/components/aria/Background.tsx`
- Exports a default function `Background()` with no props
- Contains exactly 4 child divs (in order: radial, grid, sweep, noise)
- z-indexes are ordered: -z-50, -z-40, -z-30, -z-20
- Layers 2-4 have `pointer-events-none`
- Layer 3 has `animate-aria-sweep` class
- Layer 2 has both `maskImage` and `WebkitMaskImage` inline styles
- No `'use client'` directive
- TypeScript compiles without errors

**Exact spec reference**: `specs/background.md`

---

### Task 2: Create `components/aria/TopBar.tsx`

**Type**: New file (client component)
**Est. lines**: ~60
**Files**: `apps/frontend/src/components/aria/TopBar.tsx` (CREATE)

**What to build:**

A client component (`'use client'`) rendering a fixed `<header>` with three sections:

1. **Outer `<header>`**: `fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-between border-b border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6`
2. **Section 1 (Brand)**: SVG icon (4 small rects forming 2x2 grid, `h-4 w-4 text-aria-accent`) + "ARIA · Admin Console" label + version string "v2.4.1 · build 2847" (hidden on `sm:`)
3. **Section 2 (Status Indicators)**: Green pulsing dot (`animate-aria-pulse-dot`) + "Sistema en linea" + TLS 1.3 badge (hidden on `sm:`)
4. **Section 3 (`LiveClock` sub-component)**: Internal `useState<string>` + `useEffect` with `setInterval(1000)`, returns `null` when `time` is empty (SSR guard), renders time via `toLocaleTimeString('es-AR', { hour12: false })` in a `span` with `font-mono text-xs tabular-nums text-aria-accent`

**Done when:**

- File starts with `'use client'`
- Exports a default function `TopBar()` with no props
- `<header>` has `fixed top-0 left-0 right-0 z-50 h-10`
- Brand section contains SVG icon + "ARIA · Admin Console" text
- Version string uses `hidden sm:inline`
- Online status dot uses `animate-aria-pulse-dot`
- TLS badge uses `hidden sm:inline`
- `LiveClock` starts with `if (!time) return null` (SSR guard)
- `LiveClock` calls `tick()` immediately before `setInterval` (no blank frame)
- `LiveClock` uses `clearInterval` in effect cleanup
- Clock format is `toLocaleTimeString('es-AR', { hour12: false })`
- Clock span has `tabular-nums` class
- TypeScript compiles without errors

**Exact spec reference**: `specs/topbar.md`

---

### Task 3: Create `components/aria/StatusTicker.tsx`

**Type**: New file (client component, defensive)
**Est. lines**: ~30
**Files**: `apps/frontend/src/components/aria/StatusTicker.tsx` (CREATE)

**What to build:**

A client component (`'use client'`) with a CSS-driven marquee loop:

1. **Module-scope `ITEMS` array**: 6 hardcoded strings (MONITOREO ACTIVO, NUCLEO CUANTICO, LATENCIA, UPTIME, ENLACE ESTABLECIDO, Q-STATE)
2. **Outer `<div>`**: `overflow-hidden whitespace-nowrap border-b border-t border-aria-accent/15 bg-aria-accent-soft/70 py-1`
3. **Inner `<div>`**: `animate-aria-marquee inline-flex gap-6`
4. **Triple render**: `[...ITEMS, ...ITEMS, ...ITEMS].map(...)` producing `<span>` elements with `font-mono text-xs text-aria-accent/70`

**Done when:**

- File starts with `'use client'`
- Exports a default function `StatusTicker()` with no props
- `ITEMS` array is defined at module scope (outside component) with 6 strings
- Outer div has `overflow-hidden whitespace-nowrap`
- Inner div has `animate-aria-marquee inline-flex gap-6`
- Items are triple-rendered (spread 3 times in `.map()`)
- Each `<span>` has `font-mono text-xs text-aria-accent/70`
- No `useState` or `useEffect` hooks
- TypeScript compiles without errors

**Exact spec reference**: `specs/statusticker.md`

---

### Task 4: Create `components/aria/Footer.tsx`

**Type**: New file (server component)
**Est. lines**: ~40
**Files**: `apps/frontend/src/components/aria/Footer.tsx` (CREATE)

**What to build:**

A server component rendering a fixed `<footer>` with three sections:

1. **Outer `<footer>`**: `fixed bottom-0 left-0 right-0 z-50 flex h-8 items-center justify-between border-t border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6`
2. **Section 1 (Copyright)**: "&copy; 2026 ARIA SYSTEMS &middot; TODOS LOS DERECHOS RESERVADOS" in `font-mono text-[10px] text-aria-accent/30`
3. **Section 2 (Compliance)**: Three badges (ISO 27001, SOC 2 Type II, GDPR) separated by `·`, wrapped in `hidden sm:flex`
4. **Section 3 (Status Dots)**: Three indicator groups (NUCLEO/cyan, RED/green, ENLACE/amber), each with a pulsing dot (`h-1.5 w-1.5 animate-aria-pulse-dot`) + label

**Done when:**

- File does NOT start with `'use client'` (server component)
- Exports a default function `Footer()` with no props
- `<footer>` has `fixed bottom-0 left-0 right-0 z-50 h-8`
- Copyright text contains "2026 ARIA SYSTEMS"
- Compliance badges container has `hidden sm:flex`
- Three status dot groups exist, each with `animate-aria-pulse-dot`
- Dot colors: `bg-aria-accent` (NUCLEO), `bg-aria-success` (RED), `bg-aria-warning` (ENLACE)
- Labels are "NUCLEO", "RED", "ENLACE"
- Dot size is `h-1.5 w-1.5 rounded-full`
- TypeScript compiles without errors

**Exact spec reference**: `specs/footer.md`

---

### Task 5: Modify `apps/frontend/src/app/auth/page.tsx`

**Type**: Modify existing file
**Est. changes**: ~4 new import lines + ~5 lines changed
**Files**: `apps/frontend/src/app/auth/page.tsx` (MODIFY)

**What to change:**

Wrap the existing auth page with the four new HUD components:

1. **Add 4 import statements** after the existing `RegisterForm` import:
   ```tsx
   import Background from '@/components/aria/Background';
   import TopBar from '@/components/aria/TopBar';
   import StatusTicker from '@/components/aria/StatusTicker';
   import Footer from '@/components/aria/Footer';
   ```
2. **Wrap return value in fragment** (`<>...</>`)
3. **Insert components before `<main>`**: `<Background />`, `<TopBar />`, `<StatusTicker />`
4. **Add `pt-14 pb-10` to `<main>` className** (compensates for TopBar + StatusTicker + Footer height)
5. \*\*Insert `<Footer />` after `</main>` and before `</>`

**Done when:**

- All 4 imports are present
- Return value is wrapped in `<>...</>`
- Component order: Background, TopBar, StatusTicker, `<main>`, Footer
- `<main>` className includes `pt-14 pb-10`
- `<main>` retains `flex min-h-screen items-center justify-center`
- All card internals (lines 28-47) are byte-for-byte unchanged
- All existing imports and logic are unchanged
- TypeScript compiles without errors

**Exact spec reference**: `specs/auth-page.md`

---

### Task 6: Verify — typecheck, lint, build

**Type**: Verification
**Files**: All 5 files from tasks 1-5

**Commands to run (with pnpm):**

```bash
pnpm --filter frontend typecheck
pnpm --filter frontend lint
pnpm --filter frontend build
```

**Done when:**

- `typecheck` passes with zero errors
- `lint` passes with zero errors
- `build` completes successfully
- The `/auth` page renders with the full HUD chrome in dev server

---

## Dependency Graph

```
Task 1 (Background.tsx) ──┐
Task 2 (TopBar.tsx)     ──┤
Task 3 (StatusTicker)   ──┼── Task 5 (page.tsx) ── Task 6 (verify)
Task 4 (Footer.tsx)     ──┘
```

Tasks 1-4 are independent and can be implemented in parallel. Task 5 depends on all four component files existing. Task 6 is the final verification gate.

---

## Review Workload Forecast

| Metric                            | Value                                                                |
| --------------------------------- | -------------------------------------------------------------------- |
| **New files**                     | 4 (`Background.tsx`, `TopBar.tsx`, `StatusTicker.tsx`, `Footer.tsx`) |
| **Modified files**                | 1 (`page.tsx`)                                                       |
| **Estimated new lines**           | ~180 (50 + 60 + 30 + 40)                                             |
| **Estimated modified lines**      | ~9 (4 imports + 5 JSX changes)                                       |
| **Total estimated changed lines** | ~189                                                                 |
| **File count threshold**          | 5 files (well under the 10-file alert)                               |
| **Line budget (400)**             | 189 / 400 = 47% — well within budget                                 |
| **Chained PRs recommended**       | **No** — single PR, straightforward                                  |
| **Decision needed before apply**  | No                                                                   |

All components are zero-prop presentational layers with no shared state, no prop drilling, and no architectural complexity. The page modification is a simple fragment wrapper with padding. This chunk is a clean, self-contained implementation with no risky dependencies.

---

## Task Summary

| #   | What                        | File(s)            | Type            | Lines |
| --- | --------------------------- | ------------------ | --------------- | ----- |
| 1   | 4-layer animated background | `Background.tsx`   | CREATE (server) | ~50   |
| 2   | Fixed top bar + live clock  | `TopBar.tsx`       | CREATE (client) | ~60   |
| 3   | Scrolling marquee strip     | `StatusTicker.tsx` | CREATE (client) | ~30   |
| 4   | Fixed footer + status dots  | `Footer.tsx`       | CREATE (server) | ~40   |
| 5   | HUD wrapping on auth page   | `page.tsx`         | MODIFY          | ~9    |
| 6   | Typecheck, lint, build      | all 5 files        | VERIFY          | 0     |

# Exploration: ARIA Chunk 3/4 — Side Panels

## Current State

### Auth Page (`apps/frontend/src/app/auth/page.tsx`)

The auth page is a `'use client'` component with the following structure:

- **State**: `activeTab` (login/register toggle), no `loading` state at the page level
- **Existing HUD components** (from chunks 1-2): `Background`, `TopBar`, `StatusTicker`, `Footer`
- **Layout**: Single-column, centered with `<main className="flex min-h-screen items-center justify-center pt-14 pb-10">`
- **Auth card**: 420px max-width, contains `BrandMark`, `Tabs`, and either `LoginForm` or `RegisterForm`
- **Imports**: `useEffect`, `useState`, `useRouter`, `readToken`, all 4 auth components, all 4 aria HUD components
- **No side panel state or structure** exists yet

### Aria Components Directory (`apps/frontend/src/components/aria/`)

4 files exist from chunks 1-2:
| File | Type | Lines |
|------|------|-------|
| `Background.tsx` | Server component | ~57 |
| `TopBar.tsx` | Client component | ~69 |
| `StatusTicker.tsx` | Client component | ~24 |
| `Footer.tsx` | Server component | ~36 |

### Animation/CSS Readiness

All 10 keyframe animations needed for side panels are defined in `globals.css`:

- `aria-spin-slow` (4s linear, rotate 360deg) -- for outer ring
- `aria-spin-rev` (4s linear, rotate 360deg reverse) -- for middle ring
- `aria-spin-fast` (1s linear, rotate 360deg) -- for inner ring
- `aria-wave` (2s, scaleY 1->1.15->1) -- for waveform bars
- `aria-blink` (1s steps, opacity 0/1) -- for boot log cursor
- `aria-pulse-dot` (1.5s, scale+opacity) -- already used in Footer/TopBar
- `aria-pulse` (2s, opacity 1/0.6) -- for status indicators
- `aria-shine` (2s, translateX skew) -- for accent effects
- `aria-fade-in` (0.5s, opacity 0->1) -- for entrance animation
- `aria-marquee` (20s, translateX -100%) -- already used in StatusTicker

All corresponding utility classes (`.animate-aria-spin-slow`, `.animate-aria-spin-rev`, `.animate-aria-spin-fast`, `.animate-aria-wave`, `.animate-aria-blink`, `.animate-aria-pulse-dot`) exist.

All color tokens needed are defined in both `globals.css` (:root) and `tailwind.config.ts`:

- `--aria-accent` / `aria-accent` (#22d3ee)
- `--aria-accent-rgb` / RGB tuple (34, 211, 238)
- `--aria-accent-soft` / `aria-accent-soft` (rgba(34, 211, 238, 0.12))
- `--aria-success` / `aria-success` (#34d399)
- `--aria-bg` / `aria-bg` (#09090b)
- All surface/primary/muted/danger/warning tokens

### Reference File Status

**CRITICAL: `reference/app.jsx` does NOT exist** anywhere in the repository (checked main workspace, all worktrees, outside node_modules). The task description references expected functions (AIOrb ~111-169, Corners ~300-312, BootLog ~612-638, Waveform ~861-876), but these line numbers cannot be verified. The component designs must be inferred from:

1. The mockup description (3-column layout with specific visual elements)
2. Existing component patterns in `components/aria/`
3. Available animations and color tokens

### Project Tooling

| Tool            | Command                            | Status                                  |
| --------------- | ---------------------------------- | --------------------------------------- |
| Package manager | `pnpm`                             | Required (MEMORY.md)                    |
| Typecheck       | `pnpm --filter frontend typecheck` | `tsc --noEmit`                          |
| Lint            | `pnpm --filter frontend lint`      | `next lint`                             |
| Build           | `pnpm --filter frontend build`     | `next build`                            |
| React           | 18.2.0                             | Client components need `'use client'`   |
| Next.js         | 14.1.0                             | App Router                              |
| Tailwind        | 3.4.1                              | `tailwind.config.ts` with custom colors |
| Icon library    | `@tabler/icons-react` 3.44.0       | Available for metric card icons         |

## Affected Areas

- `apps/frontend/src/app/auth/page.tsx` — MODIFY: add side panel components, convert from single-column to 3-column responsive layout
- `apps/frontend/src/components/aria/AIOrb.tsx` — CREATE: left panel, rotating SVG rings + metrics
- `apps/frontend/src/components/aria/SidePanels.tsx` — CREATE: left+right panel wrapper container (OR individual panel containers)
- `apps/frontend/src/components/aria/BootLog.tsx` — CREATE: right panel, terminal-style boot sequence
- `apps/frontend/src/components/aria/Waveform.tsx` — CREATE: right panel, animated bar telemetry
- `apps/frontend/src/components/aria/Corners.tsx` — CREATE: decorative corner accents
- `apps/frontend/src/app/globals.css` — NO changes needed (all keyframes and classes exist)
- `apps/frontend/tailwind.config.ts` — NO changes needed (all colors exist)

## Component Design (Inferred from Mockup + Available Tokens)

### Left Panel Components

**AIOrb.tsx** (client component):

- Central animated SVG with 3 concentric rings rotating at different speeds
  - Outer: `animate-aria-spin-slow` (4s)
  - Middle: `animate-aria-spin-rev` (4s reverse)
  - Inner: `animate-aria-spin-fast` (1s)
- Labels: "NUCLEO ACTIVO", model name (e.g. "CLAUDE 4.5 OPUS")
- 3 metric cards (e.g. uptime, latency, q-state) with `@tabler/icons-react` icons
- Card styling pattern from existing auth card: `border border-surface-border bg-surface rounded-xl p-4`

**Corners.tsx**:

- Decorative corner brackets (SVG or CSS border-based)
- Could be integrated into the panel wrapper or applied per-panel

### Right Panel Components

**BootLog.tsx** (client component):

- Terminal-style monospaced text with `font-mono text-xs text-aria-accent/60`
- Lines of boot sequence messages
- Blinking cursor: `animate-aria-blink` on a `|` or `_` character
- Container: `border border-surface-border bg-surface rounded-xl p-4`

**Waveform.tsx** (client or server):

- Animated bar visualization
- Multiple `<div>` bars with `animate-aria-wave` at staggered delays
- Bar styling: `bg-aria-accent/40 h-8 w-1 rounded` with inline `animationDelay`
- Container: `border border-surface-border bg-surface rounded-xl p-4`

### Layout Conversion

The `<main>` element in `page.tsx` must change from:

```tsx
<main className="flex min-h-screen items-center justify-center pt-14 pb-10">
```

To a 3-column responsive grid:

```tsx
<main className="grid min-h-screen grid-cols-1 pt-14 pb-10 lg:grid-cols-[240px_1fr_280px]">
```

At `lg` breakpoint (1024px):

- Left column: ~240px (AIOrb + Corners)
- Center column: 1fr (auth card, flex centered)
- Right column: ~280px (BootLog + Waveform + Corners)

Below `lg`: single column (auth card only, side panels hidden via `hidden lg:block`).

## Approach

1. **Create individual components**: `AIOrb.tsx`, `BootLog.tsx`, `Waveform.tsx`, `Corners.tsx` in `apps/frontend/src/components/aria/`
   - Pros: Clean separation, matches existing pattern (each component in its own file), easy to verify independently
   - Cons: More files to create
   - Effort: Medium

2. **Modify `page.tsx`**: Import new components, wrap auth card in 3-column responsive grid, place side panels in left/right columns
   - Pros: Minimal changes to existing card, follows same pattern as chunk 2 wrapping
   - Cons: Need to be careful with z-index and responsive breakpoints
   - Effort: Low

### Recommendation

Approach 1: Create 4 individual component files following the exact same patterns established in chunks 1-2 (filenames, export style, Tailwind classes, CSS animation utilities). Then modify `page.tsx` with a responsive 3-column grid.

### No Alternative Approach

There is no meaningful alternative here. The existing patterns are well-established: one file per component, no props, consistent Tailwind classes, existing animation utilities. Any alternative (combining components, different layout strategy) would break consistency with the established codebase conventions.

## Risks

- **No reference file**: The `reference/app.jsx` file referenced in the task description does not exist. Component designs must be inferred from the mockup description alone. If the visual design differs from what the description implies, there will be rework.
- **No precise line-number verification**: The task references AIOrb ~111-169, Corners ~300-312, BootLog ~612-638, Waveform ~861-876 from a file that doesn't exist. The component scope and complexity is estimated from the mockup description, not verified against reference code.
- **Animation timing**: Waveform bars need staggered `animationDelay` inline styles. This is a minor implementation detail but must be done correctly to produce the telemetry effect.
- **Responsive behavior**: Below `lg` breakpoint, side panels should be hidden. The auth card should remain centered in single-column mode (preserving current behavior at mobile/tablet). This needs explicit `hidden lg:block` / `hidden lg:grid` classes.
- **No loading state at page level**: The auth page has no `loading` state -- the task description's mention of checking `loading` state variable is a non-issue. The page always renders the full layout.

## Ready for Proposal

Yes. The codebase is well-prepared:

- All 10 CSS keyframe animations needed are defined and have utility classes
- All color tokens exist in both `globals.css` and `tailwind.config.ts`
- `@tabler/icons-react` 3.44.0 is available for metric card icons
- Existing aria component patterns are clean and consistent (one file per component, Tailwind classes, zero props)
- The auth page structure is simple and ready for the 3-column conversion
- The only missing prerequisite is the reference file, but the mockup description + available tokens are sufficient to design these components

# ARIA chunk 3/4 -- Side panels (AIOrb + BootLog + Waveform)

## Goal

Convert the auth page from a 1-column centered layout to a 3-column layout at `lg:` breakpoint. The left panel displays an animated AIOrb with metric cards. The right panel displays a BootLog terminal and a Waveform telemetry visualization. Below `lg:`, the layout stays as 1-column (side panels hidden).

## Scope

### New components (5 files in `apps/frontend/src/components/aria/`)

1. **AIOrb.tsx** -- Animated concentric rings (`animate-aria-spin-slow` + `animate-aria-spin-rev`) around a central glowing core. Includes sub-components for metric cards (CPU, memory, uptime, active sessions) displayed below the orb. All data is static/cosmetic.

2. **BootLog.tsx** -- Terminal-style scrolling log with `font-mono` (JetBrains Mono). Auto-scrolls to bottom. Lines appear with `animate-aria-blink` cursor effect. Log entries are static seed data.

3. **Waveform.tsx** -- Bar chart visualization using `animate-aria-wave` with staggered animation delays. Static seed data, not connected to real audio/telemetry.

4. **Corners.tsx** -- Decorative corner bracket lines (border fragments at each corner of a container). Used by both side panels to create a sci-fi framing effect. Pure CSS borders, no animation.

5. **SidePanels.tsx** -- Layout wrapper that composes the left panel (AIOrb + BootLog) and right panel (Waveform + Corners). Controls visibility via `hidden lg:flex` and `w-72` fixed width.

### Modified files (1)

- **page.tsx** -- Refactor `<main>` from single centered container to a 3-column grid at `lg:` breakpoint:
  ```
  <main className="flex min-h-screen items-start justify-center pt-14 pb-10">
    <SidePanels loading={false} />
    <div className="mx-auto w-full max-w-[420px] p-6">
      ...
    </div>
  </main>
  ```
  The center column (auth card) remains unchanged from chunk 2. Side panels flank it at `lg:`.

### Components already built (nothing new needed)

- Existing ARIA chrome (Background, TopBar, StatusTicker, Footer) mounts unconditionally around the grid.
- All CSS animations (`animate-aria-spin-slow`, `animate-aria-spin-rev`, `animate-aria-wave`, `animate-aria-blink`, `animate-aria-pulse`) are defined in `globals.css` and ready to use.
- Tailwind custom colors (`aria-*` tokens) are configured and available.

## Out of scope

- Auth form changes (LoginForm, RegisterForm, Tabs, BrandMark)
- Backend or API work
- `globals.css` changes (all animations already exist)
- `tailwind.config.ts` changes
- Real telemetry/data connections (all data is static cosmetic)

## Design decisions

1. **Static cosmetic data** -- All metrics, log lines, and waveform bars use hardcoded seed data. Components accept a `loading` prop for future use but it is passed as `false` for now.

2. **Fixed side panel width** -- Both side panels use `w-72` (288px). This keeps the center card comfortably centered at common viewport widths.

3. **Mobile-first approach** -- Side panels are `hidden` below `lg:` (1024px). The existing centered layout is preserved exactly for smaller screens.

4. **No new loading state** -- Page already has token-check redirect in `useEffect`. The side panels render immediately with static data regardless of auth state.

5. **SidePanels wrapper component** -- A single composition component avoids cluttering `page.tsx` with panel-specific markup. It controls the `hidden lg:flex` visibility for both panels at once.

## Risks

- **No reference file** -- The `reference/app.jsx` mentioned in the task brief does not exist in the repo. All 5 components must be built from scratch using the brief's inline descriptions and the existing animation/CSS infrastructure.
- **Animation performance** -- Four CSS animations running simultaneously (orb double-ring + waveform bars + boot-log cursor + corner shimmer) should be lightweight since they are all GPU-friendly `transform` and `opacity` transitions, but worth testing on low-end devices.

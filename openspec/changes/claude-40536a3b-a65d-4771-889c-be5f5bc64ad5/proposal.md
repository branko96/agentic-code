# Proposal: ARIA Chunk 3/4 -- Side Panels

## Intent

Convert the auth page from a single-column centered layout to a 3-column responsive grid
that places cosmetic side panels (AI Orb + metrics on the left, boot log + waveform on the right)
around the existing auth form at `lg:` breakpoint. Below `lg`, side panels are hidden and the
single-column centered layout is preserved verbatim.

This is chunk 3 of 4 in the ARIA HUD atmosphere build-out. The auth form itself does not change.

## Scope

### In Scope

- 5 new aria components: `AIOrb.tsx`, `Corners.tsx`, `BootLog.tsx`, `Waveform.tsx`, `SidePanels.tsx`
- Responsive 3-column grid layout in `page.tsx` (`grid-cols-1` below `lg`, `lg:grid-cols-[240px_1fr_280px]` at `lg`)
- Cosmetic-only side panels -- no data fetching, no props, no state

### Out of Scope

- Backend or API changes
- Auth form logic or styling modifications
- `globals.css` or `tailwind.config.ts` changes (all animations and tokens already exist)
- Responsive behavior of the auth card itself (unchanged)
- Loading states (the page has no `loading` state)
- Mobile sidebar drawer or hamburger menu (panels simply hide below `lg`)

## Capabilities

### New Capabilities

- `aria-side-panels`: Decorative left and right panels around the auth form, visible at `lg+`
  breakpoint. Includes AI Orb visualization, metric cards, boot log terminal, waveform telemetry,
  and corner bracket accents. All components are cosmetic-only with no props or state.

### Modified Capabilities

- `auth-page`: Layout changes from single-column centered to 3-column responsive grid.
  Auth card internals, form logic, and existing HUD chrome (`Background`, `TopBar`, `StatusTicker`,
  `Footer`) are untouched. The `<main>` element changes from `flex` centering to `grid`.

## Approach

Create 5 new component files in `components/aria/` following the established pattern (one file
per component, default export, no props, Tailwind classes, existing animation utilities).
Then modify `page.tsx` to import the new panels and restructure `<main>` into a 3-column grid.

All 10 CSS keyframe animations and utility classes are already defined in `globals.css`.
All color tokens exist in both `globals.css` and `tailwind.config.ts`.
`@tabler/icons-react` 3.44.0 is available for metric card icons.

## Affected Areas

| Area                                               | Impact   | Description                                       |
| -------------------------------------------------- | -------- | ------------------------------------------------- |
| `apps/frontend/src/components/aria/AIOrb.tsx`      | New      | SVG orb with 3 rotating rings + metric cards      |
| `apps/frontend/src/components/aria/Corners.tsx`    | New      | Decorative corner bracket accents                 |
| `apps/frontend/src/components/aria/BootLog.tsx`    | New      | Terminal-style boot sequence with blinking cursor |
| `apps/frontend/src/components/aria/Waveform.tsx`   | New      | 40 animated telemetry bars                        |
| `apps/frontend/src/components/aria/SidePanels.tsx` | New      | LeftPanel + RightPanel wrapper containers         |
| `apps/frontend/src/app/auth/page.tsx`              | Modified | Convert to 3-column grid, import side panels      |
| `apps/frontend/src/app/globals.css`                | None     | All keyframes and classes exist                   |
| `apps/frontend/tailwind.config.ts`                 | None     | All color tokens exist                            |

## Risks

| Risk                                                        | Likelihood | Mitigation                                                                                              |
| ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| Reference file missing (`reference/app.jsx` does not exist) | High       | Component designs inferred from mockup description + existing patterns; design matches available tokens |
| Responsive breakpoint hides panels at wrong width           | Low        | `lg:` breakpoint (1024px) standard; auth card stays centered in single-column mode                      |
| Z-index conflicts with existing HUD (TopBar/Footer fixed)   | Low        | Side panels use normal flow within `<main>` grid; no new fixed/absolute positioning needed              |
| TypeScript errors from `@tabler/icons-react` icon names     | Low        | Import only known icons; verify with `pnpm --filter frontend typecheck`                                 |

## Rollback Plan

Revert `page.tsx` to its current layout (remove grid, restore flex centering) and delete the 5
new component files. No other files are touched. The auth card and existing HUD are structurally
identical -- only the `<main>` wrapper changes.

## Dependencies

- None. All prerequisite animations, color tokens, and icon libraries are already in place.

## Success Criteria

- [ ] 5 new component files created in `components/aria/` with default exports, no props, no state
- [ ] `page.tsx` uses 3-column grid at `lg+` (`240px | 1fr | 280px`), single-column below `lg`
- [ ] Side panels hidden (`hidden lg:block`) below `lg` breakpoint
- [ ] Auth card (center column) unchanged -- same JSX, same classes, same logic
- [ ] Existing HUD components (Background, TopBar, StatusTicker, Footer) render correctly in new grid
- [ ] `pnpm --filter frontend typecheck` passes
- [ ] `pnpm --filter frontend lint` passes
- [ ] `pnpm --filter frontend build` succeeds

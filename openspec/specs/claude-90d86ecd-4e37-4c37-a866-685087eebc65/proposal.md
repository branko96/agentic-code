# Proposal: ARIA Chunk 2/4 — Atmosphere (TopBar + StatusTicker + Background + Footer)

**Status**: `proposed`
**Date**: 2026-05-25
**Change ID**: claude-90d86ecd-4e37-4c37-a866-685087eebc65
**Phase**: sdd-propose

---

## Executive Summary

Add HUD chrome **around** the existing auth card on `/auth` — a full atmosphere wrapper consisting of a HUD-style TopBar, scrolling StatusTicker, multi-layer animated Background, and Footer. The auth card from PR #40 stays centered, untouched. Zero modifications to `globals.css`, `tailwind.config.ts`, `layout.tsx`, or any `auth/*` component.

**Outcome**: After this chunk, `/auth` feels like a real HUD interface — dark tech atmosphere with cyan accents, live system status, and responsive chrome. The card is the same as today but now framed inside the ARIA shell.

---

## Context

**Where we are**: Chunk 1 landed keyframes + fonts + design tokens. PR #40 built the auth card (BrandMark, Tabs, LoginForm, RegisterForm, PasswordStrength). Chunk 2 wraps that card in the ARIA HUD shell without touching it.

**Design tokens already available** (from chunk 1):

- Colors: `--aria-bg` (#09090b), `--aria-accent` (#22d3ee), `--aria-accent-rgb` (34,211,238), `--aria-accent-soft` (rgba), `--aria-success` (#34d399), `--aria-danger` (#ef4444), `--aria-warning` (#f59e0b)
- Fonts: `--font-sans` (Space Grotesk), `--font-mono` (JetBrains Mono)
- Keyframes: 11 animation classes (`animate-aria-sweep`, `animate-aria-pulse-dot`, `animate-aria-marquee`, `animate-aria-fade-in`, etc.)

**What we need from chunk 1**: `animate-aria-sweep`, `animate-aria-pulse-dot`, `animate-aria-marquee`, `animate-aria-fade-in`, `animate-aria-pulse`. All already available in `globals.css`.

---

## Components

### 1. Background.tsx

Four-layer atmospheric backdrop behind everything. Layers from bottom to top:

1. **Base radial gradient**: centered cyan-to-dark radial via CSS `background` on a fixed full-viewport div. Uses `--aria-accent-rgb` for cyan glow.
2. **Grid overlay**: repeating linear-gradient pattern (`background-image`) producing a fine dot/cross grid in semi-transparent cyan. Fades at edges using `mask-image: radial-gradient(...)` / `WebkitMaskImage`.
3. **Sweep line**: the `animate-aria-sweep` utility class from chunk 1 applied to a gradient strip that scans horizontally.
4. **Noise SVG**: an inline `<svg>` with `<filter>` and `<feTurbulence>` + `<rect>` for subtle grain texture, opacity ~0.04, pointer-events-none.

All layers use `fixed` positioning with negative `z-index` so they sit behind page content. This is a pure visual component — no interactivity, no state.

### 2. TopBar.tsx

Fixed-position header bar pinned to the top of the viewport. Client component because of the live clock.

**Sections (left to right):**

- **Brand**: cyan SVG icon (small filled rect "AC" from BrandMark, simplified) + "ARIA · Admin Console" in `font-mono` + version/build string "v2.4.1 · build 2847" in muted color. Hidden version on very small screens.
- **Status indicators**: green pulse dot (`.animate-aria-pulse-dot`) + "Sistema en línea" label. Also a "Conexion cifrada · TLS 1.3" badge — wraps/hides on small screens via `hidden sm:inline`.
- **Live clock**: `HH:MM:SS` format, cyan color (`text-primary`), `font-mono tabular-nums`, updated every second via `setInterval`. The `useEffect` cleanup clears the interval on unmount.

**Styling**: `bg-aria-bg/80 backdrop-blur-sm border-b border-aria-accent/20`, padding px-4 sm:px-6, height ~h-10 or h-12. Fixed top-0 left-0 right-0 with z-50.

`'use client'` — needed for the live clock interval.

### 3. StatusTicker.tsx

Horizontal scrolling marquee strip between the TopBar and the main content area.

**Implementation**:

- Hardcoded `items` array: `["MONITOREO ACTIVO", "NUCLEO CUANTICO · NOMINAL", "LATENCIA · 4.2 MS", "UPTIME · 127H 33M", "ENLACE ESTABLECIDO", "Q-STATE · VERDE"]`
- Triple-renders the items inside an `.animate-aria-marquee` container for seamless looping: `[...items, ...items, ...items]`
- The container has `overflow-hidden whitespace-nowrap`. Items are inline flex children separated by a dot/bullet separator "·".

**Styling**: `bg-aria-accent-soft/70 border-y border-aria-accent/15`, text-xs font-mono, text-aria-accent/70. Padding py-1. No interactivity. Purely decorative.

`'use client'` may not be strictly needed if we use a CSS-only marquee, but adding it avoids SSR hydration mismatches with the animation.

### 4. Footer.tsx

Fixed-position footer bar pinned to the bottom of the viewport.

**Sections (left to right):**

- **Copyright**: "© 2026 ARIA SYSTEMS · TODOS LOS DERECHOS RESERVADOS" (text-xs muted)
- **Compliance badges**: "ISO 27001" · "SOC 2 Type II" · "GDPR" — hidden on small screens via `hidden sm:flex sm:gap-3`
- **Status dots**: three colored dots (cyan, green, amber) with labels "NUCLEO", "RED", "ENLACE" — each dot uses `.animate-aria-pulse-dot` with the appropriate color.

**Styling**: `bg-aria-bg/80 backdrop-blur-sm border-t border-aria-accent/20`, padding px-4 sm:px-6, height ~h-8. Fixed bottom-0 left-0 right-0 with z-50.

A plain component — no state, no `'use client'` needed.

### 5. page.tsx modification

The existing `AuthPage` return is:

```tsx
<main className="flex min-h-screen items-center justify-center">
  <div className="mx-auto w-full max-w-[420px] p-6">
    <BrandMark />
    <div className="rounded-xl ..."> {/* card */}
      <Tabs ... />
      <div className="pt-6">{activeTab === 'login' ? <LoginForm ... /> : <RegisterForm ... />}</div>
    </div>
  </div>
</main>
```

**New structure**:

```tsx
<>
  <Background />
  <TopBar />
  <StatusTicker />
  {/* Card: EXACTLY the same markup as today, zero changes */}
  <main className="flex min-h-screen items-center justify-center pt-14 pb-10">
    <div className="mx-auto w-full max-w-[420px] p-6">
      <BrandMark />
      <div className="rounded-xl ..."> {/* card */}
        <Tabs ... />
        <div className="pt-6">{activeTab === 'login' ? <LoginForm ... /> : <RegisterForm ... />}</div>
      </div>
    </div>
  </main>
  <Footer />
</>
```

**Key detail**: `<main>` gets `pt-14` (to clear the fixed TopBar + StatusTicker height) and `pb-10` (to clear the Footer). The flex centering still works because `min-h-screen` is maintained — the content center-point adjusts for the fixed chrome.

CSS `body` already has the dark gradient background from `globals.css` (chunk 1). The `Background` component layers additional effects on top using negative `z-index`, so it sits between the body background and the content.

---

## File Plan

| File                                                 | Action | Lines (est.)     | Client component    |
| ---------------------------------------------------- | ------ | ---------------- | ------------------- |
| `apps/frontend/src/components/aria/Background.tsx`   | CREATE | ~50              | No                  |
| `apps/frontend/src/components/aria/TopBar.tsx`       | CREATE | ~60              | Yes (live clock)    |
| `apps/frontend/src/components/aria/StatusTicker.tsx` | CREATE | ~30              | Yes (for hydration) |
| `apps/frontend/src/components/aria/Footer.tsx`       | CREATE | ~40              | No                  |
| `apps/frontend/src/app/auth/page.tsx`                | MODIFY | ~5 lines changed | Already is          |

**Total estimated**: ~185 new lines, 5 line modifications.

---

## Constraints

**Do NOT touch** (verified out of scope):

- `apps/frontend/src/app/page.tsx` — dashboard (chunk 4 concern)
- `apps/frontend/src/components/auth/*` — 5 components from PR #40
- `apps/frontend/src/app/globals.css` — keyframes already present; no new animations needed
- `apps/frontend/tailwind.config.ts` — colors already present
- `apps/frontend/src/app/layout.tsx` — no global chrome changes needed
- Backend — not in scope for any ARIA chunk
- AIOrb, BootLog, Waveform — chunk 3 components

**Do touch** (verified in scope):

- `apps/frontend/src/components/aria/` — NEW directory, 4 new files
- `apps/frontend/src/app/auth/page.tsx` — wrap only, card internals unchanged

---

## Risks

| Risk                                              | Severity | Mitigation                                                                                               |
| ------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `z-index` stacking conflict with card or overlays | Low      | Background uses negative z-index; TopBar/Footer use `z-50`; card has no z-index so it's in default layer |
| Live clock causes unnecessary re-renders          | Low      | Single `setInterval` with string state; React batches; cleanup on unmount                                |
| `mask-image` browser compatibility                | Low      | Use both `maskImage` and `WebkitMaskImage`; graceful fallback (grid visible but not faded)               |
| Marquee seam visible at loop boundary             | Low      | Triple-rendering pattern with CSS marquee avoids visible seams                                           |
| Fixed elements overlap card on small screens      | Low      | `pt-14` and `pb-10` compensations; flex centering handles vertical overflow gracefully                   |

---

## Dependencies

- **Upstream**: ARIA chunk 1 (keyframes + fonts + tokens) — already landed, `globals.css` has all 11 animation classes
- **PR #40**: Auth card components — already merged, we wrap them
- **Downstream**: ARIA chunk 3 (AIOrb + BootLog + Waveform interactive elements) — will sit inside this shell

---

## Next Phase

`sdd-spec` — write detailed specs for each of the 4 components and the page modification, with exact Tailwind classes, responsive breakpoints, and animation bindings.

# Design: ARIA Chunk 2/4 — Atmosphere Layer

**Status**: drafted
**Phase**: sdd-design
**Covers**: Background, TopBar, StatusTicker, Footer, and auth page wrapping

---

## 1. Component Tree

The auth page becomes a HUD-wrapped layout. Each atmosphere component is a sibling rendered in a React fragment, with the original `<main>` card in the middle.

```
<>
  <Background />        // fixed, negative z-index layers
  <TopBar />            // fixed top-0, z-50
  <StatusTicker />      // static, flows between TopBar and main
  <main>                // flex centering card, pt-14 pb-10
  <Footer />            // fixed bottom-0, z-50
</>
```

Component types:

- **Server components**: `Background`, `Footer` — pure presentation, no state or interactivity
- **Client components**: `TopBar`, `StatusTicker` — `TopBar` needs `useState`/`useEffect` for the live clock; `StatusTicker` uses `'use client'` for animation hydration consistency

No component renders children. No wrapper component — the fragment is defined inline in `page.tsx`.

---

## 2. Z-Index Stacking

```
  z-50  │ TopBar (fixed top-0)    │ Footer (fixed bottom-0)
  z-40  │ —                       │ —
  z-30  │ —                       │ —
  z-20  │ —                       │ —
  z-10  │ —                       │ —
  z-0   │ <main> card (default)   │
 -z-20  │ Background layer 4      │  Noise SVG (topmost bg layer)
 -z-30  │ Background layer 3      │  Sweep line (animate-aria-sweep)
 -z-40  │ Background layer 2      │  Grid overlay (masked)
 -z-50  │ Background layer 1      │  Radial gradient (base)
```

Key decisions:

- TopBar and Footer both use `z-50` — since they are fixed to opposite edges (top-0 vs bottom-0) they never overlap.
- All Background layers are negative z-index, ensuring they never obscure the card or chrome.
- The `<main>` card uses the default stacking context (z-0), naturally positioned above Background and below fixed chrome.

---

## 3. Animation Binding

All animations come from chunk 1's `globals.css`. No new keyframes are defined in this chunk.

| Keyframe Class           | Defined In          | Used By                  | Visual Element                                                         |
| ------------------------ | ------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `animate-aria-sweep`     | chunk 1 globals.css | `Background.tsx` layer 3 | Horizontal gradient stripe scanning left-to-right every 3s             |
| `animate-aria-pulse-dot` | chunk 1 globals.css | `TopBar.tsx` section 2   | Green online status dot (scale 1→1.3, opacity 1→0.5, 1.5s)             |
| `animate-aria-pulse-dot` | chunk 1 globals.css | `Footer.tsx` section 3   | Three status dots (NUCLEO/cyan, RED/green, ENLACE/amber)               |
| `animate-aria-marquee`   | chunk 1 globals.css | `StatusTicker.tsx`       | Inner container scrolling translateX(0) to translateX(-100%) over ~20s |

Layer 1 (radial gradient), layer 2 (grid overlay), and layer 4 (noise SVG) in the Background are all static — no animation classes applied.

The Footer's three dots all share `animate-aria-pulse-dot` but each has a distinct background color (`bg-aria-accent`, `bg-aria-success`, `bg-aria-warning`), creating visual variety despite the identical animation.

---

## 4. Data Flow

All four components are **zero-prop, hardcoded-constant** presentational components.

```
AuthPage (client)
  ├── Background()            no props, no children, no return value used
  ├── TopBar()                no props, no children
  │     └── LiveClock()       internal useState<string>, useEffect → setInterval(1s)
  ├── StatusTicker()          no props, no children
  │     └── ITEMS[]           module-scope const, triple-spread in render
  ├── <main>...</main>        existing card — zero changes to internals
  └── Footer()                no props, no children
```

No prop drilling, no context, no shared state between components. The auth page passes nothing down, and the atmosphere components return nothing up.

The only React state in this entire chunk is `TopBar`'s `LiveClock` internal state — a single `useState<string>` for the formatted time string, managed entirely within the `LiveClock` sub-component.

---

## 5. Responsive Strategy

Only three visual elements are hidden on mobile:

| Element                                           | Breakpoint    | Class              | Reason                                                      |
| ------------------------------------------------- | ------------- | ------------------ | ----------------------------------------------------------- |
| TopBar version string ("v2.4.1 · build 2847")     | `sm:` (640px) | `hidden sm:inline` | Clutter reduction — small screens don't need build info     |
| TopBar TLS badge ("Conexion cifrada · TLS 1.3")   | `sm:` (640px) | `hidden sm:inline` | Clutter reduction — small screens don't need crypto details |
| Footer compliance badges (ISO 27001, SOC 2, GDPR) | `sm:` (640px) | `hidden sm:flex`   | Spacing — three badges would overflow on narrow screens     |

Everything else is always visible:

- TopBar brand name and online status dot
- TopBar live clock
- StatusTicker marquee (full width, always scrolls)
- Background (all 4 layers, full viewport, always present)
- Footer copyright text and status dots

No layout breakpoints needed — the card itself is `max-w-[420px]` and already centered. The `pt-14` and `pb-10` padding on `<main>` is static — it works for all viewport heights >= ~600px (which covers virtually all devices).

---

## 6. File Organization

```
apps/frontend/src/
  components/
    aria/                          ← NEW directory
      Background.tsx               ← server component, ~50 lines
      TopBar.tsx                   ← client component, ~60 lines
      StatusTicker.tsx             ← client component, ~30 lines
      Footer.tsx                   ← server component, ~40 lines
    auth/                          ← EXISTING, untouched
      brand-mark.tsx
      tabs.tsx
      login-form.tsx
      register-form.tsx
  app/
    auth/
      page.tsx                     ← MODIFY: add 4 imports, wrap in fragment
```

Files created: 4
Files modified: 1 (page.tsx, ~9 lines changed)
Files untouched: all of `components/auth/`, `globals.css`, `tailwind.config.ts`, `layout.tsx`

No new directories other than `components/aria/`.

---

## 7. Integration Pattern

### Before (current page.tsx lines 26-48)

```tsx
return (
  <main className="flex min-h-screen items-center justify-center">
    <div className="mx-auto w-full max-w-[420px] p-6">
      <BrandMark />
      <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-lg">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="pt-6">
          {activeTab === 'login' ? (
            <LoginForm
              onAuthSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onAuthSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  </main>
);
```

### After

```tsx
return (
  <>
    <Background />
    <TopBar />
    <StatusTicker />
    <main className="flex min-h-screen items-center justify-center pt-14 pb-10">
      {/* ZERO CHANGES BELOW THIS LINE */}
      <div className="mx-auto w-full max-w-[420px] p-6">
        <BrandMark />
        <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-lg">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="pt-6">
            {activeTab === 'login' ? (
              <LoginForm
                onAuthSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            ) : (
              <RegisterForm
                onAuthSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
);
```

### Padding rationale

- **`pt-14`** (56px): compensates for TopBar (`h-10` = 40px) + StatusTicker (`py-1` = 8px, ~2px borders) = ~50px, plus 6px breathing room
- **`pb-10`** (40px): compensates for Footer (`h-8` = 32px) plus 8px breathing room

The page is already `'use client'`, so adding client-component children (TopBar, StatusTicker) is unproblematic. Next.js renders client components inside a client boundary just fine.

---

## 8. Architectural Decisions

### Decision 1: Fragment over wrapper component

A dedicated `<AtmosphereLayout>` wrapper would add an unnecessary layer of indirection for four sibling components that share no state. The fragment in `page.tsx` keeps the composition explicit and the wrapping obvious to anyone reading the page.

### Decision 2: No props anywhere

The spec calls for hardcoded content. Introducing props would add complexity (TypeScript interfaces, prop drilling from `page.tsx`) with zero benefit — the content is static branding, not data-driven. If the marquee messages or compliance badges ever need to be configurable, that's a future refactor; for now, constants at module scope are the simplest correct solution.

### Decision 3: `StatusTicker` is `'use client'`

The marquee animation is pure CSS and would technically work in a server component. However, CSS animations on server-rendered elements can cause hydration warnings when the animation has already shifted elements between SSR and client hydration. Marking it `'use client'` is a defensive measure that costs nothing (the component has no state, no effects, and is trivial to serialize).

### Decision 4: `Background` is a server component

All four layers are pure presentation — no state, no event handlers, no hooks. Making it a server component keeps it out of the client bundle. The CSS animations on layer 3 (`animate-aria-sweep`) are defined in `globals.css` and applied via className, so they work in both server and client rendering.

### Decision 5: Fixed positioning for Background layers

Each Background layer is `position: fixed; inset: 0` with a distinct negative z-index. This ensures the backdrop always fills the viewport regardless of scroll position or content height. The `pointer-events-none` on layers 2-4 guarantees clicks pass through to the card and chrome above.

### Decision 6: No changes to body/global styles

The body already has a dark gradient background from chunk 1. The Background component layers on top of that body background via negative z-index, so both coexist — the body gradient is a fallback visible only if the Background component fails to render.

---

## 9. Constraints and Boundaries

**In scope for this chunk:**

- 4 new component files in `components/aria/`
- 1 modified file (`page.tsx`) — fragment wrapping + imports + padding
- No new keyframes, CSS custom properties, or Tailwind config changes
- No changes to auth components, dashboard, layout, or backend

**Out of scope (for later chunks):**

- Dashboard page HUD wrapping (chunk 3)
- Any auth card styling changes
- Any new animations or keyframes
- Responsive layout changes beyond the three `hidden sm:` elements
- Tests (handled in sdd-apply/verify phases)

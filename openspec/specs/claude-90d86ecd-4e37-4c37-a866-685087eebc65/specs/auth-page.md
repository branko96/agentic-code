# Spec: Auth Page Modification

**File**: `apps/frontend/src/app/auth/page.tsx` (MODIFY)
**Type**: Client component (already `'use client'`)
**Estimated changes**: ~5 lines changed, ~4 lines added

---

## Purpose

Wrap the existing auth card layout with the four new ARIA HUD components (`Background`, `TopBar`, `StatusTicker`, `Footer`) without modifying the card's internal structure, logic, or styling.

---

## Current Code (from page.tsx lines 26-48)

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

---

## Required Changes

### 1. Add Import Statements

Add these three import lines after the existing imports (keep all existing imports unchanged):

```tsx
import Background from '@/components/aria/Background';
import TopBar from '@/components/aria/TopBar';
import StatusTicker from '@/components/aria/StatusTicker';
import Footer from '@/components/aria/Footer';
```

### 2. Wrap Return Value

Wrap the entire existing JSX return value in a fragment (`<>...</>`) and add the four ARIA components:

**Before:**

```tsx
return (
  <main className="flex min-h-screen items-center justify-center">
```

**After:**

```tsx
return (
  <>
    <Background />
    <TopBar />
    <StatusTicker />
    <main className="flex min-h-screen items-center justify-center pt-14 pb-10">
```

**Before (closing):**

```tsx
    </div>
  </main>
);
```

**After (closing):**

```tsx
    </div>
  </main>
    <Footer />
  </>
);
```

---

## Exact Diff

```diff
+import Background from '@/components/aria/Background';
+import TopBar from '@/components/aria/TopBar';
+import StatusTicker from '@/components/aria/StatusTicker';
+import Footer from '@/components/aria/Footer';
+
 export default function AuthPage() {
   // ... all existing logic UNCHANGED ...

   return (
+    <>
+      <Background />
+      <TopBar />
+      <StatusTicker />
-      <main className="flex min-h-screen items-center justify-center">
+      <main className="flex min-h-screen items-center justify-center pt-14 pb-10">
         <div className="mx-auto w-full max-w-[420px] p-6">
           {/* ALL CARD INTERNALS UNCHANGED */}
         </div>
       </main>
+      <Footer />
+    </>
   );
 }
```

---

## Key Details

### `<main>` Padding Adjustments

- **`pt-14`** (56px top padding): Compensates for the fixed TopBar (`h-10` = 40px) + StatusTicker (`py-1` = 8px + borders). This prevents the card from being hidden behind the top chrome.
- **`pb-10`** (40px bottom padding): Compensates for the fixed Footer (`h-8` = 32px) + some breathing room. Prevents card content from being hidden behind the footer.

### Centering Behavior

The `flex min-h-screen items-center justify-center` layout is preserved. Adding `pt-14 pb-10` changes the effective content area height, but `min-h-screen` ensures the full viewport is used. The card centers vertically within the remaining space between the top and bottom chrome.

If the content (card) is taller than the available space, flexbox with `items-center` will center it, and the card may overlap the chrome slightly. This is acceptable -- the auth card is short (two form fields + tabs) and fits comfortably within viewport height minus chrome on anything > 600px tall.

### Auth Card Internals -- ZERO Changes

The following lines remain **byte-for-byte identical** to the current code:

- Lines 28-47 (`<div className="mx-auto w-full max-w-[420px] p-6">` through the closing `</div>` before `</main>`)
- All `useState`, `useEffect`, `readToken`, `router.push`, `handleAuthSuccess` logic
- All imports for auth components (`BrandMark`, `Tabs`, `LoginForm`, `RegisterForm`)

---

## File Import Paths

| Import         | Path                             |
| -------------- | -------------------------------- |
| `Background`   | `@/components/aria/Background`   |
| `TopBar`       | `@/components/aria/TopBar`       |
| `StatusTicker` | `@/components/aria/StatusTicker` |
| `Footer`       | `@/components/aria/Footer`       |

The `@/` alias maps to `apps/frontend/src/` (configured in `tsconfig.json`). All four components live in the new `components/aria/` directory.

---

## Integration Points

### Components Used

- `Background` -- server component, no props
- `TopBar` -- client component, no props
- `StatusTicker` -- client component, no props
- `Footer` -- server component, no props

### No Changes To

- `globals.css` -- no new keyframes or CSS variables needed
- `tailwind.config.ts` -- all colors already configured
- `layout.tsx` -- no global chrome changes; the HUD is page-local
- Any file in `components/auth/` -- all 5 files untouched

---

## Testable Assertions

1. **Imports exist**: The page imports `Background`, `TopBar`, `StatusTicker`, and `Footer` from `@/components/aria/`
2. **Fragment wrapper**: The return value is wrapped in `<>...</>` (React fragment)
3. **Component order**: Components appear in this order: `Background`, `TopBar`, `StatusTicker`, `<main>`, `Footer`
4. **Auth card unchanged**: The `<div className="mx-auto w-full max-w-[420px] p-6">` element and all its children are identical to the current code
5. **`<main>` has added padding**: The `<main>` element includes `pt-14 pb-10` in its className
6. **`min-h-screen` preserved**: The `<main>` element retains the `min-h-screen` class (centering still works)
7. **Existing imports preserved**: All existing imports (`useEffect`, `useState`, `useRouter`, `readToken`, `BrandMark`, `Tabs`, `LoginForm`, `RegisterForm`) remain unchanged
8. **Existing logic unchanged**: `useEffect` (token check), `handleAuthSuccess`, `activeTab` state -- all identical
9. **TypeScript compiles**: No type errors from the new imports (all components have default exports, no props required)
10. **Page still works at `/auth`**: Navigating to `/auth` renders the card centered within the HUD chrome

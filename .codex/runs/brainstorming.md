# brainstorming

## 1. Clarifying questions (as assumptions)

1. **Assumption: the login UI to improve is the current homepage login screen at `apps/frontend/src/app/page.tsx:6`.**  
   Why: there is no separate `/login` route yet, and the existing auth UI lives directly on `/`.

2. **Assumption: this task is strictly visual/UX polish plus fixing input readability, not an auth-flow redesign.**  
   Why: the issue described is about the screen looking “bonita y elegante” and inputs becoming unreadable while typing, not about login behavior.

3. **Assumption: preserving the current login behavior and storage model is required.**  
   Why: `apps/frontend/src/app/page.tsx:14-57`, `apps/frontend/src/lib/auth.ts:3-33`, and the Playwright coverage in `tests/e2e/tests/homepage.spec.ts:17-59` already define a working login/session flow.

4. **Assumption: dark-mode auto-theming is currently active and is the likely cause of the unreadable input text.**  
   Why: `apps/frontend/src/app/globals.css:9-14` swaps CSS variables based on `prefers-color-scheme`, while the inputs in `apps/frontend/src/app/page.tsx:97-118` only have `rounded border px-3 py-2` and no explicit background/text styling.

5. **Assumption: we should stay within the existing stack: Next.js App Router + Tailwind, no new UI library.**  
   Why: `apps/frontend/package.json:12-26` only includes Next/React/Tailwind, and this repo currently favors minimal implementations.

6. **Assumption: the user wants a single-screen enhancement, not a broader brand system or full design system.**  
   Why: nothing in the codebase indicates an existing design token system beyond the base CSS variables in `apps/frontend/src/app/globals.css:4-20`.

7. **Assumption: current E2E selectors and semantics should remain stable where practical.**  
   Why: `tests/e2e/tests/homepage.spec.ts:23-27` and `:41-45` depend on visible labels and button text, so large copy changes could invalidate test behavior.

8. **Assumption: accessibility should improve together with appearance.**  
   Why: the current issue is fundamentally a contrast/readability bug, and fixing it correctly implies visible text, focus states, and clear affordances.

---

## 2. Three implementation approaches

### Approach A — **Tailwind Refresh**

**Core idea:**  
Keep the current page structure and auth logic intact, but restyle the login screen directly in `apps/frontend/src/app/page.tsx` using Tailwind utility classes. Add explicit input surface/text/border/focus styles and a more polished card/background composition.

**Pros**

- Smallest change set
- Lowest regression risk to auth logic
- Fastest path to fixing white-on-white input text
- Keeps current Playwright expectations mostly intact

**Cons**

- Styling remains page-local and somewhat duplicated if more auth screens are added later
- Harder to reuse if register/dashboard get similar treatment later
- Can become visually improved without creating any shared UI conventions

---

### Approach B — **Auth Shell**

**Core idea:**  
Introduce a small reusable visual wrapper for auth-related surfaces, such as a shared page shell/card pattern, while still keeping the current route and behavior. The login page uses that shell plus explicit input/button styling, creating a cleaner base for future `/login` and `/register` screens.

**Pros**

- Produces a more coherent and elegant UI than purely local tweaks
- Reusable if auth pages expand later
- Still relatively low complexity
- Separates visual structure from auth behavior

**Cons**

- Slightly more code movement than a direct restyle
- May be more structure than strictly necessary for one page
- Could be premature if no other auth screens will be added soon

---

### Approach C — **Theme Foundation**

**Core idea:**  
Fix the issue at the design-token level by improving global color variables in `apps/frontend/src/app/globals.css` and then lightly updating the page so form controls inherit a better dark/light palette. This treats the login issue as a symptom of incomplete theming rather than a page-only bug.

**Pros**

- Addresses root cause of contrast problems across the app, not just on one screen
- Creates a stronger light/dark foundation
- Helps future pages avoid the same unreadable input problem

**Cons**

- Higher blast radius because global styles affect the entire frontend
- More likely to create unintended visual regressions elsewhere
- Less targeted than the user’s requested login improvement

---

## 3. Recommended approach

**Recommended: Auth Shell**

This is the best tradeoff. A pure Tailwind Refresh would solve the bug quickly, but it risks leaving the page visually ad hoc. A full Theme Foundation is attractive long-term, but it changes global behavior and is broader than the request. The Auth Shell approach keeps the current login flow exactly as-is, fixes the unreadable input contrast explicitly, and gives the screen a more elegant, intentional layout without over-engineering or introducing a new library. It is slightly more work than a direct restyle, but still contained and appropriate for the current architecture.

---

## 4. Spec document

### What this feature/fix does

This change improves the existing login screen’s visual presentation and fixes the input readability issue so users can clearly see entered text in both light and dark environments. The login experience remains the same functionally: users can sign in, see loading and error states, restore sessions, and log out exactly as before. The change is limited to the presentation and usability of the existing auth screen, with emphasis on clarity, elegance, contrast, spacing, and focus visibility.

### Exact acceptance criteria

1. **Typed text is always visible in the email and password inputs.**
   - On the login screen, when the user types into either field, the entered value must have sufficient contrast against the input background in both default and dark-preference environments.

2. **Input placeholders/labels remain readable and distinct from entered text.**
   - Labels must be visible before interaction.
   - If placeholders are used, placeholder text must be visually distinguishable from typed text.

3. **The login screen has a polished card-like layout.**
   - The auth form must appear inside a clearly defined container/surface with intentional spacing, padding, and hierarchy.
   - The page must look visually centered and composed on common desktop and mobile viewport sizes.

4. **Interactive states are visually clear.**
   - Inputs must show a visible focus state.
   - The submit button must have clear default, hover/focus, and disabled/loading states.

5. **Existing login behavior remains unchanged.**
   - Successful login still shows the authenticated state currently rendered by the app.
   - Invalid credentials still show the backend error message.
   - Session restoration after reload still works.
   - Logout still clears the session and returns the user to the unauthenticated view.

6. **Accessibility semantics remain testable with current patterns.**
   - The email and password fields must still be associated with accessible labels.
   - The primary action must still be discoverable as a button with “Log in” text or equivalent stable accessible name.

7. **The loading state remains user-visible.**
   - While checking session state, the screen must present a readable loading state.
   - While submitting login, the button must visibly indicate progress and prevent duplicate submission.

8. **No new authentication routes or flows are introduced.**
   - The login interaction remains on the current page unless separately requested.

### Out-of-scope

- Creating separate `/login`, `/register`, or `/dashboard` routes
- Changing backend auth APIs or token storage behavior
- Introducing a component library or third-party design system
- Reworking the authenticated state beyond light visual alignment with the unauthenticated page
- Adding registration UX
- Adding animations beyond small presentational polish
- Changing Playwright test intent or auth business logic
- Implementing a full app-wide theming/token refactor

### Key types / interfaces / API contracts that must exist

These existing contracts must remain valid:

- `LoginInput` in `apps/frontend/src/types/auth.ts:0-3`
- `AuthUser` in `apps/frontend/src/types/auth.ts:5-12`
- `AuthResponse` in `apps/frontend/src/types/auth.ts:14-17`
- `login(input)` in `apps/frontend/src/lib/auth.ts:21-26`
- `getMe(token)` in `apps/frontend/src/lib/auth.ts:28-33`
- `apiFetch<T>()` in `apps/frontend/src/lib/api.ts:8-34`

UI contract expectations that must continue to hold:

- A labeled email input exists
- A labeled password input exists
- A primary login submit action exists
- An inline error area can display login failures
- An authenticated state can display logged-in user identity and a logout action

If you want, next I can turn this spec into a concrete implementation plan, but I’ll stop here per your hard gate.

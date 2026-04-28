# planning

I’m reading the relevant files.## 1. File map

- `apps/frontend/src/app/page.tsx` — modify the existing homepage auth screen to add the polished auth-shell layout, explicit form control contrast/focus styling, clearer loading/authenticated states, and stable accessible labels/button text.
- `tests/e2e/tests/homepage.spec.ts` — modify the homepage auth coverage to add UI-focused assertions for readable/stable login states while preserving the existing auth-flow expectations.

## 2. Risk assessment

- `apps/frontend/src/app/page.tsx:59-137` currently contains all unauthenticated, loading, and authenticated rendering, so visual refactoring can accidentally break:
  - the initial “Checking session...” loading state
  - label-to-input accessibility used by Playwright selectors
  - button accessible name `"Log in"` used by tests
  - inline error rendering for invalid credentials
  - logout affordance and authenticated-state rendering
- Because login state and UI live in one client component, moving markup can accidentally reset or hide `error`, `isSubmitting`, or `user` state at the wrong time.
- Restyling the submit button can accidentally remove the disabled state tied to `isSubmitting`, which would violate the duplicate-submission guard.
- Adding stronger class-based styling for dark/light contrast must not depend on global token changes, or it could widen blast radius beyond the requested screen.
- Updating E2E tests to check styling-related behavior must avoid brittle CSS-value assertions that vary by browser; assertions should stay semantic and DOM-state oriented.

## 3. Bite-sized implementation tasks

### Task 1: Lock in the login screen semantics with E2E coverage

Files: modify `tests/e2e/tests/homepage.spec.ts`

- [ ] Step: In `tests/e2e/tests/homepage.spec.ts`, add a new test after the existing invalid-credentials test that asserts the unauthenticated screen keeps stable accessible labels, visible loading-safe UI, and a disabled submit state during submission by adding exactly this test:

  ```ts
  test('renders readable login controls with stable semantics', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const submitButton = page.getByRole('button', { name: 'Log in' });

    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByText('Sign in with your existing backend account.')).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await emailInput.fill('grace@example.com');
    await passwordInput.fill('wrong-password');
    await submitButton.click();

    await expect(page.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(emailInput).toHaveValue('grace@example.com');
  });
  ```

- [ ] Step: Run `pnpm --filter frontend exec playwright test tests/e2e/tests/homepage.spec.ts` — expected: new test fails because the current UI does not reliably expose the transient `"Logging in..."` disabled state long enough for the assertion, or equivalent failing assertion with non-zero exit code.
- [ ] Step: git commit -m "test(login): cover homepage auth ui semantics"

### Task 2: Restyle the homepage login screen with an auth-shell layout and explicit control contrast

Files: modify `apps/frontend/src/app/page.tsx`

- [ ] Step: In `apps/frontend/src/app/page.tsx`, replace the current component body markup with a single-page auth shell that preserves all existing state and handlers but updates the returned JSX and classes exactly as follows:

  ```tsx
  'use client';

  import { FormEvent, useEffect, useState } from 'react';
  import { clearToken, getMe, login, persistToken, readToken } from '../lib/auth';
  import type { AuthUser } from '../types/auth';

  export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
      const token = readToken();

      if (!token) {
        setIsCheckingSession(false);
        return;
      }

      getMe(token)
        .then((nextUser) => {
          setUser(nextUser);
        })
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => {
          setIsCheckingSession(false);
        });
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setError('');
      setIsSubmitting(true);

      try {
        const response = await login({ email, password });
        persistToken(response.accessToken);
        setUser(response.user);
      } catch (caughtError) {
        setUser(null);
        clearToken();
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
      } finally {
        setIsSubmitting(false);
      }
    }

    function handleLogout() {
      clearToken();
      setUser(null);
      setPassword('');
    }

    if (isCheckingSession) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-slate-950/40 backdrop-blur">
            <p className="text-sm font-medium tracking-[0.2em] text-sky-200 uppercase">
              Welcome back
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Checking session...</h1>
            <p className="mt-3 text-sm text-slate-300">
              Restoring your saved session before showing the sign-in form.
            </p>
          </div>
        </main>
      );
    }

    if (user) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
          <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white px-8 py-10 text-slate-950 shadow-2xl shadow-slate-950/40">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
              Authenticated
            </p>
            <h1 className="mt-4 text-3xl font-bold text-slate-950">You are logged in</h1>
            <p className="mt-4 text-sm text-slate-600">
              Logged in as {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              Log out
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
        <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-200 uppercase">
              Agentic Code
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Log in
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
              Sign in with your existing backend account.
            </p>
            <div className="mt-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold text-white">Readable inputs</p>
                <p className="mt-1">
                  High-contrast fields keep typed text visible while you sign in.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="font-semibold text-white">Fast session restore</p>
                <p className="mt-1">Saved sessions are checked automatically when you return.</p>
              </div>
            </div>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white px-8 py-10 text-slate-950 shadow-2xl shadow-slate-950/40 sm:px-10">
            <h2 className="text-2xl font-semibold text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter your email and password to continue.
            </p>

            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {error ? (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </section>
        </section>
      </main>
    );
  }
  ```

- [ ] Step: Run `pnpm --filter frontend exec playwright test tests/e2e/tests/homepage.spec.ts` — expected: all homepage tests pass with exit code `0`.
- [ ] Step: git commit -m "feat(login): polish homepage auth shell"

### Task 3: Verify the frontend build still passes with the updated login UI

Files: modify `apps/frontend/src/app/page.tsx`

- [ ] Step: In `apps/frontend/src/app/page.tsx`, make the authenticated and unauthenticated card sections use the same primary button class string to avoid unnecessary divergence by changing the logout button className from:
  ```tsx
  className =
    'mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
  ```
  to:
  ```tsx
  className =
    'mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2';
  ```
  and keep the submit button className unchanged so both button semantics remain stable and no extra abstraction is introduced.
- [ ] Step: Run `pnpm --filter frontend build` — expected: build succeeds with exit code `0` and Next.js reports a successful production build.
- [ ] Step: git commit -m "chore(login): verify polished homepage build"

## 4. Self-review

### Acceptance criteria coverage

1. **Typed text is always visible in the email and password inputs**  
   Covered by Task 2 via explicit `bg-white` + `text-slate-950` input styling in `apps/frontend/src/app/page.tsx`.

2. **Input placeholders/labels remain readable and distinct from entered text**  
   Covered by Task 2 via visible label text plus `placeholder:text-slate-400` and `text-slate-950`.

3. **The login screen has a polished card-like layout**  
   Covered by Task 2 via the two-panel auth shell and card surfaces in `apps/frontend/src/app/page.tsx`.

4. **Interactive states are visually clear**  
   Covered by Task 2 via focus ring classes on inputs/buttons and disabled/loading button state; partially verified by Task 1 through `"Logging in..."` disabled assertion.

5. **Existing login behavior remains unchanged**  
   Covered by existing E2E flow assertions plus Task 2 implementation preserving all current auth logic and handlers.

6. **Accessibility semantics remain testable with current patterns**  
   Covered by Task 1 and Task 2 preserving `Email`, `Password`, and `"Log in"` accessible names.

7. **The loading state remains user-visible**  
   Covered by Task 2 via the explicit loading card and by keeping `isCheckingSession` branch intact.

8. **No new authentication routes or flows are introduced**  
   Covered by limiting changes to `apps/frontend/src/app/page.tsx` and `tests/e2e/tests/homepage.spec.ts`.

### Gaps found and fixed

- I removed any global-theme refactor from the plan because the spec marks app-wide theming as out of scope.
- I did not add a new shared component file because the spec asks for contained planning only, and the current scope does not require a reusable abstraction to satisfy acceptance criteria.
- I kept all type and function names unchanged: `LoginInput`, `AuthUser`, `AuthResponse`, `login`, `getMe`, and `apiFetch`.
- No new modules/services/components are introduced, so there are no missing parent imports.
- No placeholders remain. The only weak point is **Task 3**, which is purely a verification/cleanup task and does not introduce new code; that is intentional so the plan still ends with a build validation commit without inventing extra scope.

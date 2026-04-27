# planning

## 1. File map

- `apps/frontend/src/app/page.tsx` — replace the boilerplate homepage with a client-side login screen that submits credentials, restores session from a stored token, renders authenticated user state, and clears invalid tokens.
- `apps/frontend/src/types/auth.ts` — define the frontend auth contracts `LoginInput`, `AuthUser`, `AuthResponse`, and the backend error payload shape used by the login flow; imported by `apps/frontend/src/lib/api.ts`, `apps/frontend/src/lib/auth.ts`, and `apps/frontend/src/app/page.tsx`.
- `apps/frontend/src/lib/api.ts` — provide the minimal JSON fetch helper that targets `process.env.NEXT_PUBLIC_API_URL`, adds `Content-Type: application/json`, optionally adds `Authorization: Bearer <token>`, and throws backend messages verbatim; imported by `apps/frontend/src/lib/auth.ts`.
- `apps/frontend/src/lib/auth.ts` — implement the focused auth client functions `login`, `getMe`, `readToken`, `persistToken`, and `clearToken`; imported by `apps/frontend/src/app/page.tsx`.
- `tests/e2e/playwright.config.ts` — start both frontend and backend so browser login tests can exercise the real integration.
- `tests/e2e/tests/homepage.spec.ts` — replace the boilerplate smoke assertions with login-flow assertions for success, invalid credentials, and session restoration.

## 2. Risk assessment

- `apps/frontend/src/app/page.tsx` is currently a server component; converting it into a client component changes the rendering model for the root page and introduces browser-only state via `useEffect`, `useState`, and `localStorage`.
- The frontend will start depending on the backend auth contract from `apps/backend/src/auth/auth.controller.ts:24` and `apps/backend/src/auth/auth.service.ts:44`; if request keys or response shape drift, login and session restore will fail.
- Persisting `accessToken` in `localStorage` touches refresh behavior and logout behavior; a stale token must be cleared when `GET /auth/me` returns `401` or the UI could get stuck in a false authenticated state.
- `tests/e2e/playwright.config.ts:49` currently boots only the frontend; changing it to also boot the backend affects the existing API and homepage Playwright runs.
- Replacing `tests/e2e/tests/homepage.spec.ts:1` means the prior boilerplate homepage assertions are removed because the homepage itself is no longer the static marketing screen.

## 3. Bite-sized implementation tasks

### Task 1: Lock the browser login contract with Playwright

Files: modify `tests/e2e/playwright.config.ts`; modify `tests/e2e/tests/homepage.spec.ts`

- [ ] Step: In `tests/e2e/playwright.config.ts`, replace the single-server config
  ```ts
  webServer: {
    command: 'pnpm dev:frontend',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: '../..',
  },
  ```
  with an array that starts both apps:
  ```ts
  webServer: [
    {
      command: 'pnpm dev:backend',
      url: process.env.API_URL || 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
    {
      command: 'pnpm dev:frontend',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3001',
      },
    },
  ],
  ```
- [ ] Step: In `tests/e2e/tests/homepage.spec.ts`, replace the current boilerplate assertions with a login-first spec that seeds a user through the backend and then verifies the UI contract:

  ```ts
  import { test, expect } from '@playwright/test';

  const API_URL = process.env.API_URL || 'http://localhost:3001';

  async function registerUser(request: Parameters<typeof test>[0]['request'], email: string) {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email,
        password: 'password123',
      },
    });

    expect(response.ok()).toBeTruthy();
  }

  test.describe('Homepage login', () => {
    test('logs in and restores session after reload', async ({ page, request }) => {
      const email = `ada.${Date.now()}@example.com`;
      await registerUser(request, email);

      await page.goto('/');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByRole('heading', { name: 'You are logged in' })).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();

      await page.reload();

      await expect(page.getByRole('heading', { name: 'You are logged in' })).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
    });

    test('shows invalid credentials without authenticating', async ({ page, request }) => {
      const email = `grace.${Date.now()}@example.com`;
      await registerUser(request, email);

      await page.goto('/');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('wrong-password');
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByText('Invalid credentials')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'You are logged in' })).toHaveCount(0);
    });
  });
  ```

- [ ] Step: Run `pnpm --filter e2e-tests exec playwright test tests/homepage.spec.ts --project=chromium` — expected: exit code `1` before implementation because the current homepage does not render labeled login fields.
- [ ] Step: git commit -m `"test(e2e): define login homepage coverage"`

### Task 2: Add the minimal frontend auth client

Files: create `apps/frontend/src/types/auth.ts`; create `apps/frontend/src/lib/api.ts`; create `apps/frontend/src/lib/auth.ts`

- [ ] Step: Create `apps/frontend/src/types/auth.ts` with the exact shared contracts:

  ```ts
  export type LoginInput = {
    email: string;
    password: string;
  };

  export type AuthUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };

  export type AuthResponse = {
    accessToken: string;
    user: AuthUser;
  };

  export type ApiErrorResponse = {
    message?: string | string[];
  };
  ```

- [ ] Step: Create `apps/frontend/src/lib/api.ts` with the minimal fetch helper:

  ```ts
  import type { ApiErrorResponse } from '../types/auth';

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  type ApiFetchOptions = RequestInit & {
    token?: string;
  };

  export async function apiFetch<T>(
    path: string,
    { token, headers, ...init }: ApiFetchOptions = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T | ApiErrorResponse) : null;

    if (!response.ok) {
      const message = Array.isArray((data as ApiErrorResponse | null)?.message)
        ? (data as ApiErrorResponse).message?.join(', ')
        : (data as ApiErrorResponse | null)?.message || response.statusText;

      throw new Error(message);
    }

    return data as T;
  }
  ```

- [ ] Step: Create `apps/frontend/src/lib/auth.ts` with the focused auth helpers:

  ```ts
  import { apiFetch } from './api';
  import type { AuthResponse, AuthUser, LoginInput } from '../types/auth';

  const AUTH_TOKEN_STORAGE_KEY = 'accessToken';

  export function readToken() {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  }

  export function persistToken(token: string) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  export function clearToken() {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }

  export function login(input: LoginInput) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: input.email, password: input.password }),
    });
  }

  export function getMe(token: string) {
    return apiFetch<AuthUser>('/auth/me', {
      method: 'GET',
      token,
    });
  }
  ```

- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`.
- [ ] Step: git commit -m `"feat(frontend): add auth api client"`

### Task 3: Replace the homepage with the working login flow

Files: modify `apps/frontend/src/app/page.tsx`

- [ ] Step: Replace the current server component with this client component so the root page becomes the minimal login flow:

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
        <main className="flex min-h-screen items-center justify-center p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking session...</p>
        </main>
      );
    }

    if (user) {
      return (
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-md rounded-lg border p-8 shadow-sm">
            <h1 className="text-3xl font-bold">You are logged in</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Logged in as {user.firstName} {user.lastName}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              Log out
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-md rounded-lg border p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Log in</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in with your existing backend account.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded border px-3 py-2"
                autoComplete="email"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded border px-3 py-2"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </section>
      </main>
    );
  }
  ```

- [ ] Step: Run `pnpm --filter frontend typecheck && pnpm build:frontend` — expected: exit code `0`.
- [ ] Step: git commit -m `"feat(frontend): implement homepage login flow"`

### Task 4: Verify the full integration end to end

Files: no code changes

- [ ] Step: Run `pnpm --filter backend test:e2e` — expected: output includes `AuthController (e2e)` and exit code `0`.
- [ ] Step: Run `pnpm --filter e2e-tests exec playwright test tests/homepage.spec.ts --project=chromium` — expected: output includes `2 passed` and exit code `0`.
- [ ] Step: Run `pnpm test:e2e` — expected: exit code `0` with the homepage login suite and API suite passing across configured projects.
- [ ] Step: git commit -m `"test(e2e): verify login integration"`

## 4. Self-review

- Acceptance criterion 1 (`POST /auth/login` with JSON `{ email, password }`) maps to Task 2 via `login(input)` and Task 3 via `handleSubmit`; the request body is exactly `JSON.stringify({ email: input.email, password: input.password })`.
- Acceptance criterion 2 (successful login stores token and user, transitions to authenticated UI) maps to Task 2 and Task 3.
- Acceptance criterion 3 (`GET /auth/me` with bearer token) maps to Task 2 and Task 3 session bootstrap.
- Acceptance criterion 4 (`401 Invalid credentials` shows exact message and stays unauthenticated) maps to Task 2, Task 3, and Task 1 invalid-credentials Playwright coverage.
- Acceptance criterion 5 (unauthenticated state when there is no valid token) maps to Task 3 initial render path.
- Acceptance criterion 6 (invalid stored token clears and returns to unauthenticated state) maps to Task 3 `getMe(...).catch(() => { clearToken(); setUser(null) })`; gap: the listed Playwright suite does not explicitly inject an invalid token and assert fallback. If strict one-to-one automated coverage is required, add this test to `tests/e2e/tests/homepage.spec.ts`:
  ```ts
  test('clears an invalid stored token on reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('accessToken', 'invalid-token');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByText('You are logged in')).toHaveCount(0);
  });
  ```
- Acceptance criterion 7 (CORS-compatible localhost flow) maps to Task 1 because Playwright starts frontend and backend together with `NEXT_PUBLIC_API_URL=http://localhost:3001`, exercising the browser CORS path against `apps/backend/src/main.ts:15`.
- Acceptance criterion 8 (no password leakage in user state) relies on the backend contract already enforced by `apps/backend/src/auth/auth.service.ts:70` and `apps/backend/test/auth.e2e-spec.ts:56`; the frontend in Tasks 2 and 3 only reads `user` and `accessToken` and never persists `password` beyond controlled input state.
- Acceptance criterion 9 (minimal login UX with email, password, submit, loading, inline error) maps directly to Task 3.
- Acceptance criterion 10 (session restoration after refresh) maps to Task 1 success test and Task 3 `useEffect` bootstrap.
- No placeholders remain.
- Type/function names are consistent: `LoginInput`, `AuthUser`, `AuthResponse`, `apiFetch`, `login`, `getMe`, `readToken`, `persistToken`, `clearToken`.
- Every new module is imported by a parent: `src/types/auth.ts` is imported by `src/lib/api.ts`, `src/lib/auth.ts`, and `src/app/page.tsx`; `src/lib/api.ts` is imported by `src/lib/auth.ts`; `src/lib/auth.ts` is imported by `src/app/page.tsx`.

Only issue found: explicit automated coverage for acceptance criterion 6 is optional in the current task list; if you want zero gaps, add that invalid-token Playwright test to Task 1 before implementation.

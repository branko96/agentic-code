# planning

## 1. File map

modify `apps/frontend/package.json` — add the i18n runtime dependencies needed by the Next.js app.

create `apps/frontend/src/i18n.ts` — initialize `i18next` with English and Spanish resources and browser language detection.

modify `apps/frontend/src/app/layout.tsx` — wrap the app with an i18n bootstrap component so translations are ready before the page renders.

create `apps/frontend/src/components/i18n-provider.tsx` — run `initReactI18next` once on the client and provide the initialized i18n instance to React.

create `apps/frontend/src/components/language-switcher.tsx` — render a small locale toggle that calls `i18n.changeLanguage()`.

modify `apps/frontend/src/app/page.tsx` — replace hard-coded UI strings with `useTranslation()` keys and render the language switcher.

modify `tests/e2e/tests/homepage.spec.ts` — update selectors/assertions for translated text and add a locale-switching E2E check.

## 2. Implementation tasks

### Task 1: Install and configure i18n runtime

Files: modify `apps/frontend/package.json`, create `apps/frontend/src/i18n.ts`

- [ ] Step: Update `apps/frontend/package.json` dependencies to include the i18n packages exactly like this:
  ```json
  {
    "dependencies": {
      "i18next": "^25.0.0",
      "react-i18next": "^15.0.0",
      "i18next-browser-languagedetector": "^8.0.0",
      "next": "^14.1.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
  ```
- [ ] Step: Create `apps/frontend/src/i18n.ts` with this exact initialization code:

  ```ts
  import i18n from 'i18next';
  import LanguageDetector from 'i18next-browser-languagedetector';
  import { initReactI18next } from 'react-i18next';

  const resources = {
    en: {
      translation: {
        checkingSession: 'Checking session...',
        loggedInTitle: 'You are logged in',
        loggedInAs: 'Logged in as {{firstName}} {{lastName}}',
        logout: 'Log out',
        loginTitle: 'Log in',
        loginSubtitle: 'Sign in with your existing backend account.',
        email: 'Email',
        password: 'Password',
        login: 'Log in',
        loggingIn: 'Logging in...',
        loginErrorFallback: 'Unable to log in',
        language: 'Language',
        english: 'English',
        spanish: 'Spanish',
      },
    },
    es: {
      translation: {
        checkingSession: 'Verificando sesión...',
        loggedInTitle: 'Has iniciado sesión',
        loggedInAs: 'Sesión iniciada como {{firstName}} {{lastName}}',
        logout: 'Cerrar sesión',
        loginTitle: 'Iniciar sesión',
        loginSubtitle: 'Inicia sesión con tu cuenta existente del backend.',
        email: 'Correo electrónico',
        password: 'Contraseña',
        login: 'Iniciar sesión',
        loggingIn: 'Iniciando sesión...',
        loginErrorFallback: 'No fue posible iniciar sesión',
        language: 'Idioma',
        english: 'Inglés',
        spanish: 'Español',
      },
    },
  } as const;

  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es'],
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['navigator', 'htmlTag', 'localStorage'],
          caches: ['localStorage'],
        },
      });
  }

  export default i18n;
  ```

- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`.
- [ ] Step: git commit -m "feat(frontend): add i18n runtime setup"

### Task 2: Bootstrap translations in the app shell

Files: create `apps/frontend/src/components/i18n-provider.tsx`, modify `apps/frontend/src/app/layout.tsx`

- [ ] Step: Create `apps/frontend/src/components/i18n-provider.tsx` with this exact code:

  ```tsx
  'use client';

  import { PropsWithChildren } from 'react';
  import { I18nextProvider } from 'react-i18next';
  import i18n from '../i18n';

  export function I18nProvider({ children }: PropsWithChildren) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  }
  ```

- [ ] Step: Replace `apps/frontend/src/app/layout.tsx` with this exact code:

  ```tsx
  import type { Metadata } from 'next';
  import './globals.css';
  import { I18nProvider } from '../components/i18n-provider';

  export const metadata: Metadata = {
    title: 'Next.js + NestJS Boilerplate',
    description: 'Full-stack monorepo boilerplate with AI agents',
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="antialiased">
          <I18nProvider>{children}</I18nProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] Step: Run `pnpm --filter frontend lint` — expected: exit code `0`.
- [ ] Step: git commit -m "feat(frontend): wrap app with i18n provider"

### Task 3: Translate the login page UI and add locale switching

Files: create `apps/frontend/src/components/language-switcher.tsx`, modify `apps/frontend/src/app/page.tsx`

- [ ] Step: Create `apps/frontend/src/components/language-switcher.tsx` with this exact code:

  ```tsx
  'use client';

  import { useTranslation } from 'react-i18next';

  export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    return (
      <div className="mb-6 flex items-center justify-end gap-2 text-sm text-slate-200">
        <span>{t('language')}</span>
        <button
          type="button"
          onClick={() => i18n.changeLanguage('en')}
          className="rounded-lg border border-white/20 px-3 py-1.5 transition hover:border-cyan-300"
        >
          {t('english')}
        </button>
        <button
          type="button"
          onClick={() => i18n.changeLanguage('es')}
          className="rounded-lg border border-white/20 px-3 py-1.5 transition hover:border-cyan-300"
        >
          {t('spanish')}
        </button>
      </div>
    );
  }
  ```

- [ ] Step: Replace `apps/frontend/src/app/page.tsx` with this exact code:

  ```tsx
  'use client';

  import { FormEvent, useEffect, useState } from 'react';
  import { useTranslation } from 'react-i18next';
  import { LanguageSwitcher } from '../components/language-switcher';
  import { clearToken, getMe, login, persistToken, readToken } from '../lib/auth';
  import type { AuthUser } from '../types/auth';

  export default function Home() {
    const { t } = useTranslation();
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
        setError(caughtError instanceof Error ? caughtError.message : t('loginErrorFallback'));
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
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
          <p className="text-sm text-slate-300">{t('checkingSession')}</p>
        </main>
      );
    }

    if (user) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
          <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <LanguageSwitcher />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {t('loggedInTitle')}
            </h1>
            <p className="mt-4 text-slate-300">
              {t('loggedInAs', { firstName: user.firstName, lastName: user.lastName })}
            </p>
            <p className="mt-2 break-all text-slate-200">{user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {t('logout')}
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <LanguageSwitcher />
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t('loginTitle')}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t('loginSubtitle')}</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
              {t('email')}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
                autoComplete="email"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
              {t('password')}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-white/15 bg-slate-50 px-3 py-2.5 text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t('loggingIn') : t('login')}
            </button>
          </form>
        </section>
      </main>
    );
  }
  ```

- [ ] Step: Run `pnpm --filter frontend build` — expected: output contains `Compiled successfully` or exits with code `0`.
- [ ] Step: git commit -m "feat(frontend): translate login flow"

### Task 4: Cover locale switching in E2E tests

Files: modify `tests/e2e/tests/homepage.spec.ts`

- [ ] Step: Replace `tests/e2e/tests/homepage.spec.ts` with this exact code:

  ```ts
  import { APIRequestContext, expect, test } from '@playwright/test';

  const API_URL = process.env.API_URL || 'http://localhost:3001';

  async function registerUser(request: APIRequestContext, email: string) {
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

    test('renders an elegant and readable login form', async ({ page }) => {
      await page.goto('/');

      const emailInput = page.getByLabel('Email');
      const passwordInput = page.getByLabel('Password');
      const submitButton = page.getByRole('button', { name: 'Log in' });
      const main = page.locator('main');
      const card = page.locator('section').first();

      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
      await expect(page.getByText('Sign in with your existing backend account.')).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      await expect(main).toHaveCSS('color', 'rgb(241, 245, 249)');
      await expect(card).toHaveCSS('backdrop-filter', /blur\(.+\)/);
      await expect(emailInput).toHaveCSS('background-color', 'rgb(248, 250, 252)');
      await expect(emailInput).toHaveCSS('color', 'rgb(2, 6, 23)');
      await expect(passwordInput).toHaveCSS('background-color', 'rgb(248, 250, 252)');
      await expect(passwordInput).toHaveCSS('color', 'rgb(2, 6, 23)');
      await expect(submitButton).toHaveCSS('background-color', 'rgb(34, 211, 238)');
      await expect(submitButton).toHaveCSS('color', 'rgb(2, 6, 23)');

      await emailInput.fill('grace@example.com');
      await passwordInput.fill('wrong-password');
      await submitButton.click();

      await expect(page.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
      await expect(page.getByText('Invalid credentials')).toBeVisible();
      await expect(emailInput).toHaveValue('grace@example.com');
    });

    test('switches the UI to Spanish', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: 'Spanish' }).click();

      await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
      await expect(
        page.getByText('Inicia sesión con tu cuenta existente del backend.')
      ).toBeVisible();
      await expect(page.getByLabel('Correo electrónico')).toBeVisible();
      await expect(page.getByLabel('Contraseña')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
    });

    test('clears an invalid stored token on reload', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        window.localStorage.setItem('accessToken', 'invalid-token');
      });
      await page.reload();

      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
      await expect(page.getByText('You are logged in')).toHaveCount(0);
    });
  });
  ```

- [ ] Step: Run `pnpm --filter e2e-tests test -- homepage.spec.ts` — expected: exit code `0`.
- [ ] Step: git commit -m "test(e2e): cover frontend i18n flow"

## 3. Self-review

- The description only asks to “configuremos i18n”, so the plan stays limited to frontend i18n wiring in the existing React/Next app.
- Every required change is mapped:
  - dependency installation → Task 1
  - i18n initialization → Task 1
  - React integration in the app shell → Task 2
  - translated UI strings on the current page → Task 3
  - verification through automated tests → Task 4
- No backend changes are planned because all visible strings live in `apps/frontend/src/app/page.tsx`; backend API errors like `Invalid credentials` remain server-originated and are only asserted as-is.
- The plan avoids speculative abstractions: one shared `i18n.ts`, one provider, one switcher, and direct `t(...)` replacements in the only user-facing page currently present.
- Verification commands use `pnpm`, matching the repository’s configured package manager.

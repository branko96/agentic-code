# session

## 1. File map

modify `apps/frontend/package.json` — add the i18n runtime dependency and a script surface that still verifies the app with the existing pnpm workspace flow.

create `apps/frontend/src/i18n/locales.ts` — define the supported locales and default locale in one place for routing and message lookup.

create `apps/frontend/src/i18n/messages/en.ts` — store the English UI copy for the current login/session page.

create `apps/frontend/src/i18n/messages/es.ts` — store the Spanish UI copy for the current login/session page.

create `apps/frontend/src/i18n/get-messages.ts` — load the locale-specific message object and fall back to the default locale when needed.

modify `apps/frontend/next.config.js` — enable Next.js locale routing so `/`, `/en`, and `/es` resolve through the app.

modify `apps/frontend/src/app/layout.tsx` — stop hardcoding `lang="en"` and make the root layout read the active locale from the route params.

create `apps/frontend/src/app/[locale]/layout.tsx` — validate the locale segment and provide locale-scoped metadata/layout wiring for App Router pages.

create `apps/frontend/src/app/[locale]/page.tsx` — move the current home/login page behind the locale segment and feed translated copy into the client UI.

create `apps/frontend/src/components/login-page.tsx` — extract the current client page into a locale-driven component that receives translated strings as props.

create `apps/frontend/src/types/i18n.ts` — define the translation object shape used by the locale message files and the UI component.

modify `apps/frontend/src/app/page.tsx` — replace the direct page implementation with a redirect to the default locale route.

## 2. Implementation tasks

### Task 1: Add locale configuration and message dictionaries

Files: create/modify `apps/frontend/package.json`, `apps/frontend/next.config.js`, `apps/frontend/src/i18n/locales.ts`, `apps/frontend/src/i18n/messages/en.ts`, `apps/frontend/src/i18n/messages/es.ts`, `apps/frontend/src/i18n/get-messages.ts`, `apps/frontend/src/types/i18n.ts`

- [ ] Step: Update `apps/frontend/package.json` dependencies to add `next-intl`:
  ```json
  {
    "dependencies": {
      "next": "^14.1.0",
      "next-intl": "^3.26.3",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
  ```
- [ ] Step: Replace `apps/frontend/next.config.js` with:

  ```js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    i18n: {
      locales: ['en', 'es'],
      defaultLocale: 'en',
    },
  };

  module.exports = nextConfig;
  ```

- [ ] Step: Create `apps/frontend/src/i18n/locales.ts` with:

  ```ts
  export const locales = ['en', 'es'] as const;

  export type AppLocale = (typeof locales)[number];

  export const defaultLocale: AppLocale = 'en';

  export function isAppLocale(value: string): value is AppLocale {
    return locales.includes(value as AppLocale);
  }
  ```

- [ ] Step: Create `apps/frontend/src/types/i18n.ts` with:
  ```ts
  export type HomeMessages = {
    checkingSession: string;
    loggedInTitle: string;
    loggedInAs: string;
    logout: string;
    loginTitle: string;
    loginDescription: string;
    emailLabel: string;
    passwordLabel: string;
    submitIdle: string;
    submitLoading: string;
    loginErrorFallback: string;
  };
  ```
- [ ] Step: Create `apps/frontend/src/i18n/messages/en.ts` with:

  ```ts
  import type { HomeMessages } from '@/types/i18n';

  const en: HomeMessages = {
    checkingSession: 'Checking session...',
    loggedInTitle: 'You are logged in',
    loggedInAs: 'Logged in as',
    logout: 'Log out',
    loginTitle: 'Log in',
    loginDescription: 'Sign in with your existing backend account.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submitIdle: 'Log in',
    submitLoading: 'Logging in...',
    loginErrorFallback: 'Unable to log in',
  };

  export default en;
  ```

- [ ] Step: Create `apps/frontend/src/i18n/messages/es.ts` with:

  ```ts
  import type { HomeMessages } from '@/types/i18n';

  const es: HomeMessages = {
    checkingSession: 'Verificando sesión...',
    loggedInTitle: 'Has iniciado sesión',
    loggedInAs: 'Sesión iniciada como',
    logout: 'Cerrar sesión',
    loginTitle: 'Iniciar sesión',
    loginDescription: 'Accede con tu cuenta existente del backend.',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    submitIdle: 'Iniciar sesión',
    submitLoading: 'Iniciando sesión...',
    loginErrorFallback: 'No se pudo iniciar sesión',
  };

  export default es;
  ```

- [ ] Step: Create `apps/frontend/src/i18n/get-messages.ts` with:

  ```ts
  import { defaultLocale, type AppLocale } from './locales';
  import type { HomeMessages } from '@/types/i18n';
  import en from './messages/en';
  import es from './messages/es';

  const messagesByLocale: Record<AppLocale, HomeMessages> = {
    en,
    es,
  };

  export function getMessages(locale: AppLocale): HomeMessages {
    return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
  }
  ```

- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit 0
- [ ] Step: git commit -m "feat(frontend): add locale config and message dictionaries"

### Task 2: Move the app to locale-based routing

Files: create/modify `apps/frontend/src/app/layout.tsx`, `apps/frontend/src/app/[locale]/layout.tsx`, `apps/frontend/src/app/page.tsx`

- [ ] Step: Replace `apps/frontend/src/app/layout.tsx` with:

  ```tsx
  import type { Metadata } from 'next';
  import './globals.css';

  export const metadata: Metadata = {
    title: 'Next.js + NestJS Boilerplate',
    description: 'Full-stack monorepo boilerplate with AI agents',
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return children;
  }
  ```

- [ ] Step: Create `apps/frontend/src/app/[locale]/layout.tsx` with:

  ```tsx
  import type { Metadata } from 'next';
  import { notFound } from 'next/navigation';
  import { defaultLocale, isAppLocale, locales, type AppLocale } from '@/i18n/locales';

  export const metadata: Metadata = {
    title: 'Next.js + NestJS Boilerplate',
    description: 'Full-stack monorepo boilerplate with AI agents',
  };

  export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
  }

  export default function LocaleLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: { locale: string };
  }) {
    if (!isAppLocale(params.locale)) {
      notFound();
    }

    const locale: AppLocale = params.locale ?? defaultLocale;

    return (
      <html lang={locale}>
        <body className="antialiased">{children}</body>
      </html>
    );
  }
  ```

- [ ] Step: Replace `apps/frontend/src/app/page.tsx` with:

  ```tsx
  import { redirect } from 'next/navigation';
  import { defaultLocale } from '@/i18n/locales';

  export default function IndexPage() {
    redirect(`/${defaultLocale}`);
  }
  ```

- [ ] Step: Run `pnpm --filter frontend build` — expected: exit 0 and a successful Next.js production build summary
- [ ] Step: git commit -m "feat(frontend): add locale-based app routing"

### Task 3: Translate the login/session UI

Files: create/modify `apps/frontend/src/components/login-page.tsx`, `apps/frontend/src/app/[locale]/page.tsx`

- [ ] Step: Create `apps/frontend/src/components/login-page.tsx` with:

  ```tsx
  'use client';

  import { FormEvent, useEffect, useState } from 'react';
  import { clearToken, getMe, login, persistToken, readToken } from '@/lib/auth';
  import type { AuthUser } from '@/types/auth';
  import type { HomeMessages } from '@/types/i18n';

  type LoginPageProps = {
    messages: HomeMessages;
  };

  export function LoginPage({ messages }: LoginPageProps) {
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
        setError(caughtError instanceof Error ? caughtError.message : messages.loginErrorFallback);
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
          <p className="text-sm text-slate-300">{messages.checkingSession}</p>
        </main>
      );
    }

    if (user) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
          <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {messages.loggedInTitle}
            </h1>
            <p className="mt-4 text-slate-300">
              {messages.loggedInAs} {user.firstName} {user.lastName}
            </p>
            <p className="mt-2 break-all text-slate-200">{user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {messages.logout}
            </button>
          </section>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {messages.loginTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{messages.loginDescription}</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
              {messages.emailLabel}
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
              {messages.passwordLabel}
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
              {isSubmitting ? messages.submitLoading : messages.submitIdle}
            </button>
          </form>
        </section>
      </main>
    );
  }
  ```

- [ ] Step: Create `apps/frontend/src/app/[locale]/page.tsx` with:

  ```tsx
  import { LoginPage } from '@/components/login-page';
  import { getMessages } from '@/i18n/get-messages';
  import { isAppLocale, type AppLocale } from '@/i18n/locales';
  import { notFound } from 'next/navigation';

  export default function LocaleHomePage({ params }: { params: { locale: string } }) {
    if (!isAppLocale(params.locale)) {
      notFound();
    }

    const locale = params.locale as AppLocale;
    const messages = getMessages(locale);

    return <LoginPage messages={messages} />;
  }
  ```

- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit 0
- [ ] Step: Run `pnpm --filter frontend build` — expected: exit 0 and generated routes for `/`, `/en`, and `/es`
- [ ] Step: git commit -m "feat(frontend): translate login page content"

## 3. Self-review

The description only asks to configure frontend i18n, so the plan stays limited to the existing frontend app and current login/session screen.

Requirement coverage:

- “front i18n” maps to Task 1 for locale config and translation sources.
- Routing needed to actually expose multiple languages maps to Task 2.
- Applying translations to the existing UI maps to Task 3.

Gaps fixed:

- The current app is at `src/app/page.tsx`, so the plan explicitly redirects `/` to the default locale instead of leaving the old page duplicated.
- The current root layout hardcodes `lang="en"`, so the plan moves `<html lang>` into a locale-aware nested layout.
- The current copy lives inside a client page, so the plan extracts it into a component that receives translated strings rather than introducing broader abstractions not required by the task.

I did not perform the `.codex/plan.md`, `plan-ready`, or waiting steps because your hard-gate also said to return the plan directly as markdown text and keep this phase read-only.

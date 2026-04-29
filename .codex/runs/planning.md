# planning

## 1. File map

modify apps/frontend/package.json — add the i18n runtime dependency and keep scripts unchanged.

modify apps/frontend/next.config.js — enable locale-aware routing with a fixed locales array and default locale.

modify apps/frontend/src/app/layout.tsx — make the root layout receive the active locale from the route segment and set `<html lang>` plus locale-specific metadata.

create apps/frontend/src/app/[locale]/page.tsx — move the login screen into a locale-prefixed route and replace hardcoded UI copy with translation lookups.

create apps/frontend/src/app/[locale]/layout.tsx — validate the locale route param and pass children through the localized app segment.

create apps/frontend/src/app/[locale]/not-found.tsx — render a simple localized fallback for unsupported or missing locale routes.

create apps/frontend/src/i18n/config.ts — define the supported locales tuple, default locale, and locale validation helper.

create apps/frontend/src/i18n/messages/en.ts — export the English message catalog used by the login page and layout metadata.

create apps/frontend/src/i18n/messages/pt.ts — export the Portuguese message catalog used by the login page and layout metadata.

create apps/frontend/src/i18n/get-messages.ts — map a locale string to the corresponding message catalog.

create apps/frontend/src/i18n/types.ts — define the message schema so both locale files stay structurally aligned.

## 2. Implementation tasks

### Task 1: Add locale routing infrastructure

Files: modify apps/frontend/package.json, modify apps/frontend/next.config.js, create apps/frontend/src/i18n/config.ts, create apps/frontend/src/i18n/types.ts

- [ ] Step: Update `apps/frontend/package.json` dependencies to install `next-intl`:

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "next": "^14.1.0",
    "next-intl": "^3.26.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

- [ ] Step: Replace `apps/frontend/next.config.js` with locale-aware config:

```js
const withNextIntl = require('next-intl/plugin')('./src/i18n/get-messages.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withNextIntl(nextConfig);
```

- [ ] Step: Create `apps/frontend/src/i18n/config.ts`:

```ts
export const locales = ['en', 'pt'] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';

export function isValidLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}
```

- [ ] Step: Create `apps/frontend/src/i18n/types.ts`:

```ts
export type Messages = {
  metadata: {
    title: string;
    description: string;
  };
  auth: {
    checkingSession: string;
    loggedInTitle: string;
    loggedInAs: string;
    logout: string;
    loginTitle: string;
    loginDescription: string;
    email: string;
    password: string;
    login: string;
    loggingIn: string;
    loginError: string;
  };
  errors: {
    notFound: string;
  };
};
```

- [ ] Step: Run `pnpm --filter frontend add next-intl` — expected: exit code `0`
- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`
- [ ] Step: git commit -m "feat(frontend): add locale routing foundation"

### Task 2: Add translation catalogs and locale resolver

Files: create apps/frontend/src/i18n/messages/en.ts, create apps/frontend/src/i18n/messages/pt.ts, create apps/frontend/src/i18n/get-messages.ts

- [ ] Step: Create `apps/frontend/src/i18n/messages/en.ts`:

```ts
import type { Messages } from '../types';

const en: Messages = {
  metadata: {
    title: 'Next.js + NestJS Boilerplate',
    description: 'Full-stack monorepo boilerplate with AI agents',
  },
  auth: {
    checkingSession: 'Checking session...',
    loggedInTitle: 'You are logged in',
    loggedInAs: 'Logged in as',
    logout: 'Log out',
    loginTitle: 'Log in',
    loginDescription: 'Sign in with your existing backend account.',
    email: 'Email',
    password: 'Password',
    login: 'Log in',
    loggingIn: 'Logging in...',
    loginError: 'Unable to log in',
  },
  errors: {
    notFound: 'Page not found.',
  },
};

export default en;
```

- [ ] Step: Create `apps/frontend/src/i18n/messages/pt.ts`:

```ts
import type { Messages } from '../types';

const pt: Messages = {
  metadata: {
    title: 'Boilerplate Next.js + NestJS',
    description: 'Boilerplate full-stack em monorepo com agentes de IA',
  },
  auth: {
    checkingSession: 'Verificando sessão...',
    loggedInTitle: 'Você está autenticado',
    loggedInAs: 'Autenticado como',
    logout: 'Sair',
    loginTitle: 'Entrar',
    loginDescription: 'Entre com a sua conta existente do backend.',
    email: 'E-mail',
    password: 'Senha',
    login: 'Entrar',
    loggingIn: 'Entrando...',
    loginError: 'Não foi possível entrar',
  },
  errors: {
    notFound: 'Página não encontrada.',
  },
};

export default pt;
```

- [ ] Step: Create `apps/frontend/src/i18n/get-messages.ts`:

```ts
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale } from './config';
import en from './messages/en';
import pt from './messages/pt';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = isValidLocale(locale ?? '') ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: resolvedLocale === 'pt' ? pt : en,
  };
});
```

- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`
- [ ] Step: Run `pnpm --filter frontend lint` — expected: exit code `0`
- [ ] Step: git commit -m "feat(frontend): add translation catalogs"

### Task 3: Move the app into a localized route segment

Files: modify apps/frontend/src/app/layout.tsx, create apps/frontend/src/app/[locale]/layout.tsx, create apps/frontend/src/app/[locale]/not-found.tsx

- [ ] Step: Replace `apps/frontend/src/app/layout.tsx` with a minimal root layout that just renders children:

```tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] Step: Create `apps/frontend/src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLocale, isValidLocale, type AppLocale } from '@/i18n/config';
import { getMessages } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: AppLocale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  const messages = await getMessages({ locale });

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] Step: Create `apps/frontend/src/app/[locale]/not-found.tsx`:

```tsx
import { getMessages } from 'next-intl/server';

export default async function NotFound() {
  const messages = await getMessages();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <p className="text-sm text-slate-300">{messages.errors.notFound}</p>
    </main>
  );
}
```

- [ ] Step: Run `pnpm --filter frontend build` — expected: output contains `Compiled successfully`
- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`
- [ ] Step: git commit -m "feat(frontend): add localized app layout"

### Task 4: Localize the login page

Files: create apps/frontend/src/app/[locale]/page.tsx

- [ ] Step: Delete `apps/frontend/src/app/page.tsx` and create `apps/frontend/src/app/[locale]/page.tsx` with the localized login screen:

```tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clearToken, getMe, login, persistToken, readToken } from '@/lib/auth';
import type { AuthUser } from '@/types/auth';

export default function Home() {
  const t = useTranslations();
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
      setError(caughtError instanceof Error ? caughtError.message : t('auth.loginError'));
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
        <p className="text-sm text-slate-300">{t('auth.checkingSession')}</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_40%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {t('auth.loggedInTitle')}
          </h1>
          <p className="mt-4 text-slate-300">
            {t('auth.loggedInAs')} {user.firstName} {user.lastName}
          </p>
          <p className="mt-2 break-all text-slate-200">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {t('auth.logout')}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#111827_100%)] px-6 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t('auth.loginTitle')}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{t('auth.loginDescription')}</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-100">
            {t('auth.email')}
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
            {t('auth.password')}
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
            {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>
      </section>
    </main>
  );
}
```

- [ ] Step: Run `pnpm --filter frontend build` — expected: output contains `Compiled successfully`
- [ ] Step: Run `pnpm --filter frontend lint` — expected: exit code `0`
- [ ] Step: git commit -m "feat(frontend): localize auth page"

## 3. Self-review

- The repo has a single React surface at `apps/frontend/src/app/page.tsx`, so the plan scopes i18n to that app only.
- The description only says `i18n react`, so the smallest complete implementation is route-based locale support plus translated UI strings for the existing login page.
- Every user-visible string currently hardcoded in `apps/frontend/src/app/layout.tsx` and `apps/frontend/src/app/page.tsx` is mapped into translation catalogs.
- The plan avoids tests entirely, per instruction.
- The plan includes exact files, exact code, exact verification commands, and at least one commit per task.
- Gap fixed: because App Router locale routing needs a route segment, the plan explicitly moves `src/app/page.tsx` into `src/app/[locale]/page.tsx` and adds `[locale]/layout.tsx`; without that, `react i18n` would only translate strings but not provide actual locale-aware routing.

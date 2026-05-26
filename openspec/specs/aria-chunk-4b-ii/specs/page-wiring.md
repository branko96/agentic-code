# auth/page.tsx -- Wiring Spec

**File**: `apps/frontend/src/app/auth/page.tsx`
**Status**: MODIFY

---

## 1. Before and After

### Current (v1 imports):

```typescript
import BrandMark from '@/components/auth/brand-mark';
import Tabs from '@/components/auth/tabs';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
```

### After (single ARIA import):

```typescript
import AuthCard from '@/components/aria/AuthCard';
```

## 2. JSX Changes

### Current rendering:

```tsx
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
```

### After:

```tsx
<div className="mx-auto w-full max-w-[420px] p-6">
  <AuthCard />
</div>
```

## 3. Removed State

The following state and variables are REMOVED from the page:

- `const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')` -- now managed inside AuthCard
- `function handleAuthSuccess() { router.push('/'); }` -- now managed inside AuthCard
- All four v1 import lines

## 4. Kept in Page

The following are UNCHANGED:

- `'use client'` directive
- `useEffect` with `readToken()` auto-redirect check
- `router` usage (still needed for auto-redirect)
- All layout elements: `Background`, `TopBar`, `StatusTicker`, `LeftPanel`, `RightPanel`, `Footer`
- The grid layout: `lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]`
- The `<main>` wrapper

## 5. Final Page Imports

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readToken } from '@/lib/auth';
import AuthCard from '@/components/aria/AuthCard';
import Background from '@/components/aria/Background';
import TopBar from '@/components/aria/TopBar';
import StatusTicker from '@/components/aria/StatusTicker';
import Footer from '@/components/aria/Footer';
import { LeftPanel, RightPanel } from '@/components/aria/SidePanels';
```

## 6. Lifecycle

```
Page mount
  -> useEffect: readToken()
     -> if token exists: router.push('/')     (auto-redirect authenticated users)
     -> if no token: render AuthCard
  -> AuthCard mounts
     -> Default tab: 'login'
     -> User interacts
     -> Form submit -> persistToken() -> onAuthSuccess() -> router.push('/')
```

## 7. Edge Cases

| Scenario                     | Handling                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token exists on mount        | `useEffect` fires -> `router.push('/')` -> user redirected                                                                                                                                                         |
| Token set during interaction | Form calls `persistToken()` then `onAuthSuccess()`. The `useEffect` does NOT re-fire because the dependency array `[router]` doesn't include `readToken()`. Redirect is driven by the callback, NOT by the effect. |
| Router unavailable           | `useRouter()` returns valid router in App Router -- no edge case here                                                                                                                                              |

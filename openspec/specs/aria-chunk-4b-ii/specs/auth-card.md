# AuthCard -- Detailed Spec

**File**: `apps/frontend/src/components/aria/AuthCard.tsx`
**Status**: NEW

---

## 1. TypeScript Types

```typescript
interface AuthCardProps {
  // No props -- fully self-contained
}
```

AuthCard takes NO props. It manages all state internally and is self-contained. The `router.push('/')` redirect happens through its own internal `useRouter` hook, passed as `onAuthSuccess` to the child forms.

## 2. Component Contract

### 2.1 Internal State

| State       | Type                          | Initial   | Description                  |
| ----------- | ----------------------------- | --------- | ---------------------------- |
| `activeTab` | `TabId` ('login'\|'register') | `'login'` | Controls which form is shown |

### 2.2 Rendering Structure

```tsx
<div className="relative">
  {' '}
  // Corners wrapper
  <Corners color="#22d3ee">
    <div className="flex flex-col items-center gap-6">
      <BrandMark /> // kept from v1
      <Tabs // ARIA Tabs atom (default export)
        activeTab={activeTab}
        onChange={setActiveTab}
      />
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
      <SocialRow
        providers={[
          { name: 'Google', onClick: () => {} },
          { name: 'GitHub', onClick: () => {} },
        ]}
        label="O continuar con"
      />
    </div>
  </Corners>
</div>
```

### 2.3 AuthCard Owns Layout

The glassmorphism card is part of AuthCard, NOT the page. Specific classes:

- Outer div wrapping Corners: `mx-auto w-full max-w-[420px] p-6`
- Corners wraps a centered flex column: `flex flex-col items-center gap-6`
- The card visual is achieved via the parent's grid layout (handled by `auth/page.tsx`)

### 2.4 Tabs API Adaptation

Important API mismatch to handle:

| Aspect        | v1 auth/tabs.tsx      | ARIA Tabs                               |
| ------------- | --------------------- | --------------------------------------- |
| Export        | default               | default                                 |
| Tab type      | Tab (internal)        | `TabId` (exported: 'login'\|'register') |
| Prop name     | `onTabChange`         | `onChange`                              |
| Default tabs  | always login/register | `DEFAULT_TABS` const = login/register   |
| Animated pill | No                    | Yes (sliding indicator)                 |

AuthCard maps its internal `activeTab` state to the ARIA Tabs `onChange` callback:

```typescript
import Tabs from '@/components/aria/Tabs';
import type { TabId } from '@/components/aria/Tabs';

// Usage:
const [activeTab, setActiveTab] = useState<TabId>('login');
<Tabs activeTab={activeTab} onChange={setActiveTab} />
```

### 2.5 onAuthSuccess / Redirect Logic

```typescript
const router = useRouter();

function handleAuthSuccess() {
  router.push('/');
}
```

This function is passed as `onAuthSuccess` to both LoginForm and RegisterForm. After the form calls `persistToken()`, it invokes `onAuthSuccess()`, which triggers the Next.js navigation.

### 2.6 Skeleton / Loading States

AuthCard has NO loading state of its own -- loading is managed internally by LoginForm and RegisterForm via their `isLoading` state.

### 2.7 Empty / Initial State

- Tab "Iniciar sesion" is active
- LoginForm is rendered (with its own empty state)
- RegisterForm is NOT rendered (React conditional rendering, not `display:none`)

### 2.8 Error States

AuthCard has NO error state of its own -- errors are managed internally by the active form.

## 3. SocialRow Providers Configuration

```typescript
const PROVIDERS = [
  { name: 'Google', onClick: () => {} },
  { name: 'GitHub', onClick: () => {} },
];
```

The `onClick` handlers are empty stubs. Social login is out of scope for this chunk. `label` prop set to `"O continuar con"` (Spanish).

## 4. Imports (Full List)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Tabs from '@/components/aria/Tabs';
import type { TabId } from '@/components/aria/Tabs';
import Corners from '@/components/aria/Corners';
import { SocialRow } from '@/components/aria/SocialRow';
import BrandMark from '@/components/auth/brand-mark';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
```

Note: LoginForm and RegisterForm are imported from the SAME directory (relative path `./`), since all three new files live at `apps/frontend/src/components/aria/`.

## 5. Edge Cases

| Scenario                          | Handling                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Fast tab switching                | Active form is conditionally rendered; switching unmounts old form, mounts new form. State of old form is LOST (intentional -- resets errors). |
| Auth success during login         | `handleAuthSuccess` calls `router.push('/')` -- page navigates away                                                                            |
| Auth success during register      | Same as login -- `router.push('/')`                                                                                                            |
| User clicks "Crear una" link      | Fires `onSwitchToRegister` which sets `activeTab` to `'register'`. Tab UI updates, RegisterForm mounts.                                        |
| User clicks "Iniciar sesion" link | Fires `onSwitchToLogin` which sets `activeTab` to `'login'`. Tab UI updates, LoginForm mounts.                                                 |
| BrandMark missing                 | Imported directly -- if file missing, build error (protection)                                                                                 |
| Tabs fails to load                | Import error -> build error (protection)                                                                                                       |

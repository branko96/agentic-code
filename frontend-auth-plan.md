# Frontend auth implementation plan

## Context

The backend auth contract is already defined in PR #4 (`branko96/agentic-code#4`) and should be treated as the source of truth for the frontend integration.

Current confirmed backend behavior:

- `POST /auth/register` creates the user and returns `{ accessToken, user }`.
- `POST /auth/login` returns `{ accessToken, user }`.
- `GET /auth/me` requires `Authorization: Bearer <token>` and returns the authenticated user.
- Invalid credentials return `401` with `Invalid credentials`.
- Duplicate email returns `409` with `Email already in use`.
- CORS is enabled for `FRONTEND_URL` with `credentials: true`, although the current auth flow uses a bearer token in the response body rather than an httpOnly cookie.

Relevant backend references:

- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/main.ts`
- `apps/backend/test/auth.e2e-spec.ts`

Current frontend baseline:

- `apps/frontend/src/app/page.tsx` is still boilerplate.
- `apps/frontend/src/app/layout.tsx` has no auth provider.
- `apps/frontend/package.json` only includes the default Next.js stack.
- There is no auth routing, API client, session state, or protected UI yet.

## Goal

Implement a minimal, maintainable frontend auth flow that matches the backend contract already available in PR #4, without over-designing the first version.

## Constraints and decisions

1. **Use token-in-response, not cookie auth, for v1**
   - The backend currently returns `accessToken` in the JSON body and protects `/auth/me` via bearer token.
   - The frontend should integrate with that contract directly instead of inventing a cookie/session layer that does not exist yet.

2. **Prefer a small client-side auth model**
   - Since the app is currently a very small App Router frontend, the simplest correct approach is a client-side auth provider plus a lightweight API client.
   - Avoid adding Redux, NextAuth, or a large data-fetching layer unless the product scope expands.

3. **Keep route protection simple**
   - For the first implementation, route protection can live in client components and shared auth state.
   - Middleware/SSR protection can be revisited later if the backend moves to cookie-based auth.

4. **Persist only what is needed**
   - Persist the token client-side for page refresh survival.
   - Derive the current user from the login/register response and/or a bootstrap call to `/auth/me`.

## Proposed frontend architecture

### 1. Environment and config

Add a frontend environment variable:

- `NEXT_PUBLIC_API_URL=http://localhost:3001`

Implementation notes:

- Read this once from a small config helper or directly in the API client.
- Keep the fallback explicit and local-dev friendly.
- Ensure it aligns with backend `FRONTEND_URL` for local CORS.

### 2. API client layer

Create a minimal shared API client, for example under `apps/frontend/src/lib/api.ts`.

Responsibilities:

- Store the base API URL.
- Send JSON requests.
- Attach `Authorization: Bearer <token>` when a token exists.
- Normalize backend error responses into a predictable frontend error shape.

Suggested surface:

- `apiRequest<T>(path, options)`
- `login(payload)`
- `register(payload)`
- `getMe(token)`

Important details:

- Set `Content-Type: application/json` for body requests.
- Parse JSON error bodies before throwing.
- Return backend messages when available so the UI can show `Invalid credentials` and `Email already in use`.
- Do not add abstractions beyond auth needs yet.

### 3. Auth domain types

Add small shared types, either in the API file or a nearby `auth.ts`/`types.ts`.

Needed types:

- `AuthUser`
- `LoginInput`
- `RegisterInput`
- `AuthResponse` with `accessToken` and `user`
- `AuthContextValue`

The types should mirror the backend contract:

- User includes at least `id`, `firstName`, `lastName`, `email`.
- Register requires `firstName`, `lastName`, `email`, `password`.
- Login requires `email`, `password`.

### 4. Auth state provider

Create a client auth provider, for example `apps/frontend/src/components/auth-provider.tsx` or `src/context/auth-context.tsx`.

State to manage:

- `user: AuthUser | null`
- `token: string | null`
- `isLoading: boolean`
- `isAuthenticated: boolean`

Actions to expose:

- `login(input)`
- `register(input)`
- `logout()`
- `refreshUser()`

Bootstrap behavior on app load:

- Read the token from `localStorage`.
- If there is no token, finish loading with no session.
- If there is a token, call `/auth/me`.
- If `/auth/me` succeeds, hydrate `user`.
- If `/auth/me` returns `401`, clear the token and reset session state.

Why this shape works well now:

- It matches the backend exactly.
- It supports refresh persistence.
- It avoids flashing protected content once the loading gate is handled correctly.

### 5. App Router integration

Wrap the app tree from `apps/frontend/src/app/layout.tsx` with the auth provider.

Also update metadata/title if desired so the app no longer looks like a boilerplate landing.

Implementation detail:

- Keep `layout.tsx` server-rendered.
- Mount a client auth provider inside the body.

### 6. Routes and screens

Add these initial routes:

- `/` public landing/home
- `/login` public auth page
- `/register` public auth page
- `/dashboard` protected authenticated page

#### `/`

Replace boilerplate in `apps/frontend/src/app/page.tsx` with a simple auth-aware landing.

If unauthenticated:

- Show product/app title.
- Show CTA links to login and register.

If authenticated:

- Show the current user name/email.
- Show CTA to go to dashboard.
- Show logout action.

#### `/login`

Create a login page with:

- email field
- password field
- submit button
- loading state
- inline server error message
- link to register

On success:

- save auth state through the provider
- redirect to `/dashboard`

Backend-aligned validation:

- frontend can do light required-field validation
- password minimum should align with backend `MinLength(8)`
- backend remains the source of truth

#### `/register`

Create a register page with:

- first name
- last name
- email
- password
- submit button
- loading state
- inline error handling
- link to login

On success:

- since backend returns `{ accessToken, user }`, auto-login is the simplest path
- redirect to `/dashboard`

This avoids making the user register and then log in again.

#### `/dashboard`

Create a minimal protected page that proves the flow works.

Suggested content:

- welcome heading
- authenticated user details
- logout button

This page does not need business functionality yet; it just validates the auth shell.

### 7. Protected route handling

Use a lightweight client guard for v1.

Possible shape:

- a reusable `ProtectedRoute` client component
- or route-level conditional logic inside `/dashboard`

Expected behavior:

- while auth bootstrap is loading, show a neutral loading state
- if unauthenticated after bootstrap, redirect to `/login`
- if authenticated, render children/page content

Why this is the right tradeoff now:

- current frontend is fully client-light and simple
- backend is bearer-token based
- no need to introduce middleware or server session parsing yet

### 8. Form and UI composition

Keep the component model small.

Reusable components worth extracting only if they clearly reduce duplication:

- `AuthFormShell`
- `AuthSubmitButton`
- `LogoutButton`

Avoid creating a component library or complex form system for just two screens.

### 9. Error handling and UX states

Normalize these cases explicitly:

1. **Invalid login**
   - Show backend message `Invalid credentials`.

2. **Duplicate registration**
   - Show backend message `Email already in use`.

3. **Expired/invalid stored token**
   - Clear local token during bootstrap and send the user back to unauthenticated state.

4. **Initial session loading**
   - Prevent protected pages from rendering before bootstrap completes.

5. **Network/API failure**
   - Show a generic fallback such as `Something went wrong. Please try again.` when there is no backend message.

### 10. Local persistence strategy

For the first version, use `localStorage` for the JWT.

Implementation notes:

- Save token immediately after login/register success.
- Remove token on logout.
- Remove token when `/auth/me` returns `401`.
- Keep storage access inside client components/provider only.

Tradeoff:

- This is acceptable for a simple first pass because it matches the current backend contract.
- If the auth model later moves to secure cookies, this layer should be simplified rather than expanded.

### 11. Suggested implementation order

1. Add `NEXT_PUBLIC_API_URL` support.
2. Create auth types and API client.
3. Create auth provider with bootstrap from localStorage and `/auth/me`.
4. Wrap `layout.tsx` with the provider.
5. Replace home page with auth-aware landing.
6. Implement `/login`.
7. Implement `/register`.
8. Implement `/dashboard` with guard.
9. Add logout action.
10. Smoke test the full flow locally against backend PR #4.

## Minimal file plan

A practical first pass could touch files like:

- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/login/page.tsx`
- `apps/frontend/src/app/register/page.tsx`
- `apps/frontend/src/app/dashboard/page.tsx`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/lib/auth.ts` or `apps/frontend/src/types/auth.ts`
- `apps/frontend/src/components/auth-provider.tsx`
- `apps/frontend/src/components/protected-route.tsx`
- `apps/frontend/.env.example` or equivalent frontend env documentation if that file exists

## Testing and verification

At minimum, verify these flows manually or with a small E2E smoke test:

1. Register a new user and land on `/dashboard`.
2. Log out and confirm protected content is no longer accessible.
3. Log in with the same user and land on `/dashboard`.
4. Refresh `/dashboard` and confirm session bootstrap restores the user via stored token + `/auth/me`.
5. Submit wrong credentials and confirm the UI shows the backend error.
6. Register an existing email and confirm the `409` message is surfaced.
7. Corrupt/remove the stored token and confirm the app resets cleanly.

If the repo already has Playwright coverage, the best initial automated test is one happy-path auth smoke test plus one invalid-login case.

## Risks and follow-ups

### Near-term risks

- The current backend contract is token-in-body, so frontend state is necessarily client-centric for now.
- If PR #4 changes response fields before merge, the frontend types and API client will need to follow the updated contract.
- If localStorage-based auth is considered too weak for the product, the backend should move to secure cookies before the frontend adds SSR/middleware complexity.

### Reasonable follow-ups after v1

- Add a shared form field component only if more auth/account pages appear.
- Add Playwright coverage for auth.
- Move to cookie-based auth if server-side route protection becomes important.
- Add token refresh behavior only if the backend exposes a refresh endpoint.

## Recommendation

Implement the frontend against PR #4 exactly as it exists today: bearer token in response body, token persisted client-side, `/auth/me` used for bootstrap, and a small auth provider plus protected dashboard flow.

That gives the repo a working end-to-end auth slice with the least friction and the fewest assumptions.
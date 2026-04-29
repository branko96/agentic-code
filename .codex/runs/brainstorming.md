# brainstorming

## 1. Clarifying questions (as assumptions)

1. **Assumption: the current `/` route should remain the login page, and the new authenticated destination should be `/home`.**  
   Why: hoy el login vive en `apps/frontend/src/app/page.tsx:6` y pediste “redirija a una nueva page llamada home”.

2. **Assumption: the redirect should happen only after a successful login response, not pre-login based on an existing token.**  
   Why: el comportamiento actual en `apps/frontend/src/app/page.tsx:14` resuelve sesión en la misma página; mover a `/home` puede mantenerse mínimo si el submit exitoso navega ahí.

3. **Assumption: `/home` is intended to be an authenticated page and should not show user data or the users table without a valid token.**  
   Why: ya existe el patrón de token JWT + `/auth/me` en `apps/frontend/src/lib/auth.ts:28` y `apps/backend/src/auth/auth.controller.ts:29`.

4. **Assumption: the users table should list all users from the backend, not just the currently logged-in user.**  
   Why: pediste “tabla de usuarios que tenga llamada a la api de usuarios”.

5. **Assumption: exposing the user list to any authenticated user is acceptable for this repo’s current scope.**  
   Why: no existe hoy una noción de roles/permissions en backend (`apps/backend/src/auth`, `apps/backend/src/users`), así que cualquier control más fino cambiaría el alcance.

6. **Assumption: the backend currently does not have a `GET /users` endpoint and it should be created.**  
   Why: `apps/backend/src/users/users.module.ts:1` solo registra servicio; no hay controller, ni método `findAll` en `apps/backend/src/users/users.service.ts:6`.

7. **Assumption: the users API response must exclude sensitive fields like `passwordHash`.**  
   Why: el schema ya define `toUserResponse` en `apps/backend/src/users/schemas/user.schema.ts:31` y auth tests ya validan que `passwordHash` no salga en responses (`apps/backend/test/auth.e2e-spec.ts:62`).

8. **Assumption: the navbar only needs a functional logout icon/button, not a full navigation system with multiple sections.**  
   Why: el pedido menciona navbar singular + logout funcional, sin más items.

9. **Assumption: “logout funcional” means clearing the stored JWT and returning the user to the login page.**  
   Why: esa es la semántica ya implementada localmente en `apps/frontend/src/app/page.tsx:53`.

10. **Assumption: adding an icon can be done without introducing a third-party icon library.**  
    Why: el frontend hoy solo depende de Next/React/Tailwind (`apps/frontend/package.json:12`), así que agregar una lib sería una decisión extra.

11. **Assumption: the existing frontend architecture should stay client-side for auth state and data fetching.**  
    Why: el login, token persistence y `/auth/me` ya están implementados en client components/utilities (`apps/frontend/src/app/page.tsx:1`, `apps/frontend/src/lib/auth.ts:5`).

12. **Assumption: the users table can load directly from the browser using the same bearer token pattern as `/auth/me`.**  
    Why: `apiFetch` ya soporta token headers en `apps/frontend/src/lib/api.ts:8`.

13. **Assumption: no pagination, sorting, or search is required for the users table in this task.**  
    Why: no fue pedido, y hoy no existe soporte backend/frontend para ello.

14. **Assumption: no registration flow changes are required.**  
    Why: el pedido solo afecta login redirect, new home page, logout y list users.

15. **Assumption: preserving the current visual style is preferable over redesigning the app.**  
    Why: la UI actual ya tiene un estilo consistente en `apps/frontend/src/app/page.tsx:69` y `:89`.

---

## 2. Three implementation approaches

### Approach 1: **Client Split**

**Core idea**  
Keep `/` as the login route and create a separate `/home` page as a client component. After successful login, persist the token and navigate to `/home`; that page validates the token, renders the navbar/logout control, and fetches users from a new authenticated backend endpoint.

**Pros**

- Minimal change to current architecture.
- Reuses existing token storage and `apiFetch` patterns.
- Smallest blast radius across frontend and backend.
- Clear separation between unauthenticated and authenticated screens.

**Cons**

- Auth guarding remains client-side, so redirects happen after page load.
- Token stays in `localStorage`, which is acceptable for current code but not the strongest auth model.
- Some auth-check logic may exist in more than one page unless factored carefully.

---

### Approach 2: **Route Group**

**Core idea**  
Introduce a clearer app structure with separate route segments for public and authenticated pages, e.g. login at `/` and authenticated page(s) under `/home`, with shared authenticated layout behavior for navbar/logout. The new users screen lives under that authenticated section and all future protected pages can reuse the same structure.

**Pros**

- Better long-term structure for future authenticated pages.
- Navbar/logout can live in a shared authenticated layout.
- Easier to extend if more private pages are added later.

**Cons**

- More files and structural change than this task strictly needs.
- Slightly more design work around layouts and route boundaries.
- Adds architectural ceremony before it is clearly needed.

---

### Approach 3: **Single Route Swap**

**Core idea**  
Keep everything under `/` and switch the rendered view after login from the form to a “home-like” authenticated dashboard containing navbar, logout, and users table. Optionally add `/home` later or alias it, but the experience is mainly a conditional render in one page.

**Pros**

- Fewest moving parts.
- Reuses almost all current code in `apps/frontend/src/app/page.tsx:6`.
- Fastest to implement.

**Cons**

- Does not match the requirement cleanly for “una nueva page llamada home”.
- Keeps public and authenticated concerns coupled in one component.
- Harder to scale and reason about than real route separation.

---

## 3. Recommended approach

**Recommended: Client Split**

This is the best fit because it satisfies the requirement literally—login stays on `/` and redirects to a new `/home` page—while staying aligned with the repo’s existing client-side auth model in `apps/frontend/src/lib/auth.ts:5` and `apps/frontend/src/lib/api.ts:8`. The tradeoff is that route protection remains client-enforced rather than server-enforced, and token storage remains in `localStorage`; those are not ideal for a production-grade auth redesign, but changing them would expand scope well beyond this task. Compared with a fuller route-group/layout refactor, this approach delivers the requested behavior with less churn and lower risk.

---

## 4. Spec document

### What this feature/fix does

After a user logs in successfully from the current login page, the frontend navigates them to a new `/home` page instead of rendering the logged-in state inside the login screen. The `/home` page is an authenticated experience: it verifies that a valid token exists, shows a navbar with a functional logout control, and displays a table of users loaded from the backend users API. If the backend does not already expose a “get all users” endpoint, one is added so the frontend can retrieve the user list without exposing sensitive fields.

### Exact acceptance criteria

1. **Successful login redirects to `/home`.**  
   Given a valid email/password on the login form at `/`, when the login request succeeds, the browser navigates to `/home`.

2. **Failed login does not redirect.**  
   Given invalid credentials, when the login request fails, the user remains on `/` and sees the backend-provided error message or current fallback error.

3. **`/home` requires a valid session token.**  
   Given no token, or an invalid/expired token, when the user visits `/home`, they are returned to `/` and no protected user table is shown.

4. **`/home` shows a navbar with logout control.**  
   When an authenticated user opens `/home`, a top navigation bar is visible and includes a logout icon/button.

5. **Logout is functional.**  
   When the logout control is activated from `/home`, the stored auth token is removed and the user is navigated back to `/`.

6. **`/home` loads users from the backend API.**  
   When an authenticated user opens `/home`, the frontend performs a users API request and renders the returned users in a table.

7. **The users table displays non-sensitive user fields only.**  
   Each row in the table contains safe user identity fields available from the API, such as `firstName`, `lastName`, and `email`; it must not expose `passwordHash` or other credential material.

8. **A backend “get all users” endpoint exists if missing.**  
   The backend exposes a route that returns all users needed by the table, and that route is callable by the frontend.

9. **The users endpoint is protected by authentication.**  
   Requests to the users list endpoint without a valid bearer token are rejected with unauthorized status.

10. **Users API response shape is consistent.**  
    Each returned user object includes at least `id`, `firstName`, `lastName`, and `email`, matching the existing safe user response pattern.

11. **Current login functionality remains intact.**  
    The login form still submits to the existing backend auth login endpoint and still persists the returned access token before navigation.

12. **Existing auth profile endpoint behavior is not broken.**  
    `/auth/me` continues to work for authenticated requests as it does now.

### Out-of-scope

- Role-based authorization or admin-only access to the users list.
- Replacing `localStorage` auth with cookies or server sessions.
- Full SSR/auth middleware redesign in Next.js.
- Registration UI changes.
- User creation, edit, delete, search, filtering, sorting, or pagination in the users table.
- Backend response reshaping beyond what is necessary to safely expose the users list.
- Adding a third-party design system or icon library unless strictly necessary.
- Broader navigation architecture beyond the requested navbar/logout/home flow.

### Key types / interfaces / API contracts that must exist

#### Frontend contracts

- **`LoginInput`**  
  Existing contract in `apps/frontend/src/types/auth.ts:0`:
  - `email: string`
  - `password: string`

- **`AuthUser`**  
  Existing safe user shape in `apps/frontend/src/types/auth.ts:5`:
  - `id: string`
  - `firstName: string`
  - `lastName: string`
  - `email: string`
  - optional timestamps

- **`AuthResponse`**  
  Existing login response in `apps/frontend/src/types/auth.ts:14`:
  - `accessToken: string`
  - `user: AuthUser`

- **Users list response contract**  
  Required for the new home table:
  - `AuthUser[]` or an equivalent dedicated `UserListItem[]`
  - Must exclude `passwordHash`

#### Backend contracts

- **`POST /auth/login`**  
  Existing:
  - Request body: `{ email: string, password: string }`
  - Success response: `{ accessToken: string, user: UserResponse }`

- **`GET /auth/me`**  
  Existing authenticated route:
  - Request header: `Authorization: Bearer <token>`
  - Success response: `UserResponse | null`

- **`GET /users`**  
  Required if missing:
  - Request header: `Authorization: Bearer <token>`
  - Success response: `UserResponse[]`
  - Unauthorized response: `401`

- **`UserResponse`**  
  Existing backend-safe projection in `apps/backend/src/users/schemas/user.schema.ts:5`:
  - `id: string`
  - `firstName: string`
  - `lastName: string`
  - `email: string`
  - optional `createdAt`, `updatedAt`
  - Must not include `passwordHash`

If you want, next I can turn this spec into an implementation plan before coding.

# brainstorming

## 1. Clarifying questions (as assumptions)

1. **Assumption: “login no funciona” refers to the frontend-to-backend integration, not the backend credential validation itself.**  
   **Why:** The backend auth contract already exists and is covered by unit/e2e tests in `apps/backend/src/auth/auth.service.spec.ts:20` and `apps/backend/test/auth.e2e-spec.ts:45`, while the frontend currently has no auth UI or integration at all in `apps/frontend/src/app/page.tsx:1`.

2. **Assumption: The intended login endpoint is `POST /auth/login`.**  
   **Why:** That is the only login endpoint implemented in `apps/backend/src/auth/auth.controller.ts:24`.

3. **Assumption: The request body contract for login is JSON `{ email, password }`.**  
   **Why:** `LoginDto` requires exactly those fields in `apps/backend/src/auth/dto/login.dto.ts:2`.

4. **Assumption: A valid login must return `{ accessToken, user }` and the frontend must consume that shape as-is.**  
   **Why:** That is the response built by `AuthService` in `apps/backend/src/auth/auth.service.ts:70`.

5. **Assumption: The auth model for this repo is bearer-token based, not cookie/session based.**  
   **Why:** `/auth/me` is protected via `Authorization: Bearer <token>` in `apps/backend/src/auth/strategies/jwt.strategy.ts:12` and the backend returns the token in the response body, not as a cookie.

6. **Assumption: CORS must allow requests from the frontend origin `http://localhost:3000` to the backend origin `http://localhost:3001`.**  
   **Why:** The backend enables CORS from `FRONTEND_URL` or that localhost fallback in `apps/backend/src/main.ts:15`.

7. **Assumption: The reported failure is not due to the backend server being down or MongoDB unavailable.**  
   **Why:** The task asks for a product fix spec, and infra/runtime availability would require a different diagnosis path than code changes.

8. **Assumption: We should preserve the existing backend API contract unless we find a clear contract bug.**  
   **Why:** There is already a written frontend plan treating the backend as source of truth in `frontend-auth-plan.md:4`.

9. **Assumption: The immediate goal is a minimal working login flow, not the full auth product surface.**  
   **Why:** The user asked to fix login specifically, and the current frontend is still boilerplate in `apps/frontend/src/app/page.tsx:1`.

10. **Assumption: Protected-session verification should use `GET /auth/me` after login or refresh.**  
    **Why:** That endpoint already exists for identity bootstrap in `apps/backend/src/auth/auth.controller.ts:29`.

11. **Assumption: Invalid credentials should surface as a user-visible auth failure, not a generic crash.**  
    **Why:** The backend intentionally returns `401 Invalid credentials` in `apps/backend/src/auth/auth.service.ts:52`.

12. **Assumption: We are not introducing third-party auth libraries like NextAuth for this fix.**  
    **Why:** The frontend has only the base Next stack in `apps/frontend/package.json:12`, and adding a new auth framework would be disproportionate to the bug.

---

## 2. Three implementation approaches

### Approach A — **Client Flow**

**Core idea:**  
Implement login entirely in the frontend using a small client-side auth layer that calls `POST /auth/login`, stores `accessToken`, and uses `/auth/me` to restore session state. This aligns directly with the existing backend contract and requires no backend API changes.

**Pros**

- Smallest change set
- Matches current backend behavior exactly
- No new infrastructure or auth framework
- Easy to verify against existing backend tests

**Cons**

- Token persistence is client-managed
- Route protection remains client-side for v1
- Does not improve server-rendered auth behavior

---

### Approach B — **Backend Proxy**

**Core idea:**  
Introduce Next.js-side API handlers or server actions as a proxy between the UI and NestJS auth endpoints. The UI would call the frontend server, which would then call the backend and normalize responses.

**Pros**

- Can centralize request shaping and error normalization
- Creates a future path toward cookie-based/session-based auth
- Reduces direct backend URL coupling in components

**Cons**

- More moving parts for a simple login bug
- Adds an extra network hop and extra code surface
- Still does not solve the root issue if the missing piece is simply “no frontend auth integration exists”

---

### Approach C — **Contract Patch**

**Core idea:**  
Change the backend auth contract or endpoint behavior first, then adapt the frontend around the revised contract. This could include changing status codes, payload shape, or delivery mechanism.

**Pros**

- Useful if the actual bug is a backend contract defect
- Could standardize auth responses more broadly

**Cons**

- Higher blast radius
- Risks breaking already-tested backend behavior
- Not justified by current evidence, since backend login appears implemented and tested

---

## 3. Recommended approach

**Client Flow**

This is the best fit because the strongest evidence points to an integration gap, not a broken backend auth service: login exists and is tested on the Nest side, while the Next app still has no auth flow at all. The tradeoff is that client-managed bearer-token auth is less sophisticated than cookie/session auth and only gives client-side protection initially, but it is the simplest correct approach that matches the current API contract without introducing unnecessary architecture or destabilizing the backend.

---

## 4. Spec document

### What this fix does

This fix enables a user to log in from the frontend by sending credentials to the existing backend login endpoint, receiving the backend auth response, establishing authenticated client session state, and using that session to access authenticated user data. It also ensures login failures are shown as user-facing auth errors rather than leaving the app in a broken or ambiguous state.

### Exact acceptance criteria

1. **Login request contract**
   - When a user submits email and password from the frontend, the app sends a `POST` request to `/auth/login` with JSON body:
     ```json
     { "email": "<string>", "password": "<string>" }
     ```
   - This is testable via network inspection.

2. **Successful login behavior**
   - If the backend returns success, the frontend stores the returned `accessToken`, stores or hydrates the returned `user`, and transitions the app into an authenticated state.
   - This is testable by verifying a successful login updates visible UI state and preserves session on refresh.

3. **Authenticated identity retrieval**
   - After a successful login, the frontend can call `GET /auth/me` with `Authorization: Bearer <token>` and receive the authenticated user profile.
   - This is testable by inspecting the request header and response.

4. **Invalid credentials handling**
   - If the backend returns `401` with `Invalid credentials`, the frontend shows that message to the user and does not enter an authenticated state.
   - This is testable by submitting wrong credentials and verifying the exact message appears.

5. **Unauthenticated state behavior**
   - If there is no valid token, the frontend behaves as unauthenticated and does not present the user as logged in.
   - This is testable on first load and after logout/token removal.

6. **Expired or invalid stored token handling**
   - If a stored token exists but `/auth/me` returns `401`, the frontend clears the stored token and returns to unauthenticated state.
   - This is testable by injecting an invalid token and reloading.

7. **CORS-compatible login flow**
   - The frontend login flow works when frontend and backend run on their configured local origins (`http://localhost:3000` and `http://localhost:3001`) without browser CORS failure.
   - This is testable in a browser dev environment.

8. **No password leakage in user state**
   - The frontend never receives or stores `passwordHash` or raw password as part of the authenticated user object.
   - This is testable by inspecting the login response and any stored session data.

9. **Minimal login UX**
   - The app exposes a login UI with email, password, submit action, loading state, and inline error display.
   - This is testable visually and through interaction.

10. **Session restoration**
    - Refreshing the page after a successful login restores authenticated state from stored token plus identity bootstrap, without requiring the user to log in again.
    - This is testable by refreshing after login.

### Out-of-scope

- Replacing bearer-token auth with cookie-based auth
- Adding refresh-token support
- Adding OAuth/social login
- Full registration flow changes beyond what is necessary to avoid breaking login integration
- Server-side or middleware-based route protection
- Role/permission systems
- Broad UI redesign beyond the minimal auth screens/states needed for login
- Backend auth contract redesign unless a concrete contract defect is proven

### Key types / interfaces / API contracts that must exist

#### Backend contracts already present

- **`POST /auth/login`**
  - Request:
    ```ts
    type LoginRequest = {
      email: string;
      password: string;
    };
    ```
  - Success response:
    ```ts
    type AuthResponse = {
      accessToken: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt?: string | Date;
        updatedAt?: string | Date;
      };
    };
    ```
  - Error response:
    - `401` with message `Invalid credentials`

- **`GET /auth/me`**
  - Request header:
    ```http
    Authorization: Bearer <accessToken>
    ```
  - Success response:
    ```ts
    type AuthUser = {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt?: string | Date;
      updatedAt?: string | Date;
    };
    ```

#### Frontend-side contracts required for the fix

- **`LoginInput`**

  ```ts
  type LoginInput = {
    email: string;
    password: string;
  };
  ```

- **`AuthUser`**

  ```ts
  type AuthUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
  ```

- **`AuthResponse`**

  ```ts
  type AuthResponse = {
    accessToken: string;
    user: AuthUser;
  };
  ```

- **Auth state contract**

  ```ts
  type AuthState = {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  ```

- **Frontend API behavior**
  - Login requests must use `Content-Type: application/json`
  - Authenticated identity requests must include `Authorization: Bearer <token>`
  - Backend error messages must be surfaced when available

If you want, next I can turn this approved spec into an implementation plan or start the code changes.

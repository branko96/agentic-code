# review

Using option 1 and verifying on a different backend port.The e2e config is still hardwired to spawn the backend on port 3001 despite `API_URL`, so I’m fixing that and re-running the gates.The frontend tests are hitting the wrong app on port 3000. I’m changing Playwright to start this worktree’s built-in frontend on a dedicated port too, then re-running tests.Root cause found: `apps/frontend/next.config.js:5` freezes `NEXT_PUBLIC_API_URL` at build/start time, so Playwright’s per-server env isn’t reaching the browser app. I’m fixing that and re-running build/tests.The browser bundle now points at `http://127.0.0.1:3002`, so the remaining login failures are CORS-related on the backend (`apps/backend/src/main.ts:16-18` only allows `http://localhost:3000`). I’m fixing allowed origin for the isolated frontend host and re-running tests.The backend webServer wasn’t receiving `FRONTEND_URL`; preflight still proves `Access-Control-Allow-Origin: http://localhost:3000`. I’m passing the env into the backend webServer entry and re-running tests.Fixed what was blocking isolated login verification:

- `tests/e2e/playwright.config.ts:50` now starts backend on the port derived from `API_URL`, passes `FRONTEND_URL`, and starts frontend on the port derived from `BASE_URL`.
- `apps/frontend/next.config.js:1` no longer hardcodes `NEXT_PUBLIC_API_URL` at Next config load time, so runtime env works for E2E.

Evidence gathered:

- Build passed: `pnpm build` exit 0.
- Backend auth works on isolated port:
  - `POST http://127.0.0.1:3002/auth/register` → `201 Created`
  - `POST http://127.0.0.1:3002/auth/login` → `201 Created`
- Module registration is correct: `apps/backend/src/app.module.ts:24-25` imports `UsersModule` and `AuthModule`; `apps/backend/src/auth/auth.module.ts:14-32` registers `AuthController`, `AuthService`, `JwtStrategy`, and `MongooseModule.forFeature(...)`.
- Diff review found no hardcoded secrets. It did find env/verification issues and I fixed the frontend env freeze and Playwright port wiring.

Remaining blockers are environment-level, proven by command output:

- `pnpm test` still fails because Playwright WebKit is missing:
  - `browserType.launch: Executable doesn't exist ... Please run: pnpm exec playwright install`
- Isolated browser login still reports `Failed to fetch` in Playwright snapshots even after env fixes.
- Manual CORS preflight before the final backend webServer env fix showed:
  - `Access-Control-Allow-Origin: http://localhost:3000`
- Also, `.husky/_/husky.sh` is modified outside the login fix scope.

```text
Build:  ✓ exit 0 from `pnpm build`
Tests:  ✗ 13 failed from `API_URL=http://127.0.0.1:3002 BASE_URL=http://127.0.0.1:3100 pnpm test`; backend Jest 5 passed, Playwright blocked by browser install + remaining browser fetch failure
Modules registered: ✓ AuthModule is imported in apps/backend/src/app.module.ts:24-25; auth providers/controllers/schema registered in apps/backend/src/auth/auth.module.ts:14-32
Ready to push: no — E2E verification is still failing, and Playwright WebKit is not installed
```

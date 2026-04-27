# debugging

I’m reproducing the failure first. The file search tool errored, so I’m using shell commands to locate the exact login test/command and run it.I reproduced it. The failing login flow is blocked by Playwright’s backend webServer startup, not by auth logic: `tests/e2e/playwright.config.ts:49` always starts `pnpm dev:backend` on port 3001, but the reproduction already has something on 3001, so Nest exits with `EADDRINUSE` from `apps/backend/src/main.ts:20-21`. I’m checking the minimal config fix now.The first fix was insufficient. Playwright still launches the backend command even with `reuseExistingServer: true`; that flag only allows attaching if its readiness probe succeeds, but the configured probe is `http://localhost:3001/health`, and this backend doesn’t expose `/health`, so Playwright never recognizes the existing server and keeps spawning another one. I’m fixing that invariant directly.New info: the existing process on 3001 is not this worktree’s backend at all. The readiness probe hits a different server and returns 404, so Playwright keeps trying to spawn this worktree’s backend and collides on the port. I need one more narrowing step to identify the intended login command/environment before changing behavior further.I reproduced a deterministic failure, but it is **not a login bug** and I can’t honestly apply or commit a “fix login” change under your iron law.

What I reproduced:

- `pnpm --dir tests/e2e test -- --grep "Homepage login" --project=chromium`
- Failure is `EADDRINUSE` from `apps/backend/src/main.ts:20-21`, triggered by Playwright webServer startup in `tests/e2e/playwright.config.ts:50-66`
- Backend auth itself already passes:
  - `pnpm --dir apps/backend test:e2e` → all 4 auth tests pass

Root cause found:

- The failure happens before login logic runs.
- Port `3001` is already occupied by another process, and Playwright still tries to start this worktree’s backend.
- I also verified the existing process on `http://localhost:3001` is not serving this app’s auth routes as expected for reuse.

Per your instruction, I’m stopping rather than guessing at a “login fix”.

Verification output:

```text
> backend@1.0.0 test:e2e /home/branko/workspaces/agentic-code/.worktrees/13d9b2d5-a474-4cff-b254-9deb4a46659c/apps/backend
> jest --config ./test/jest-e2e.json

PASS test/auth.e2e-spec.ts (6.868 s)
  AuthController (e2e)
    ✓ registers, logs in, and reads the authenticated profile (324 ms)
    ✓ rejects invalid credentials (242 ms)
    ✓ rejects requests to protected routes without a token (7 ms)
    ✓ validates request bodies (7 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        7.232 s, estimated 8 s
Ran all test suites.
```

```text
> e2e-tests@1.0.0 test /home/branko/workspaces/agentic-code/.worktrees/13d9b2d5-a474-4cff-b254-9deb4a46659c/tests/e2e
> playwright test "--grep" "Homepage login" "--project=chromium"

[WebServer] Error: listen EADDRINUSE: address already in use :::3001

Error: Timed out waiting 60000ms from config.webServer.
```

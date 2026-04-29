# e2e

No cleanup was needed from simplify: all 3 review agents confirmed there’s still no product-code diff, only `.codex/runs/*` planning artifacts.

I need to implement the feature in this worktree first.I found the current shape and wrote the implementation plan for approval.

Key findings:

- Frontend login is currently inline on `/` in `apps/frontend/src/app/page.tsx:7`.
- Auth helpers already exist in `apps/frontend/src/lib/auth.ts:6`.
- Bearer-token API fetch support already exists in `apps/frontend/src/lib/api.ts:9`.
- Backend has protected auth patterns in `apps/backend/src/auth/auth.controller.ts:30`.
- Safe user projection already exists in `apps/backend/src/users/schemas/user.schema.ts:32`.
- There is no `GET /users` endpoint yet in `apps/backend/src/users/users.service.ts:12`.

Once you approve, I’ll implement it, add the backend + Playwright coverage, run the tests/build, and finish with the passing Playwright output.

# Verification Report

| Step    | Result | Duration |
| ------- | ------ | -------- |
| install | ✓      | 1706ms   |
| test    | ✗      | 1710ms   |

**Verification failed — task blocked from merging.**

## Failures

### test

```
No projects matched the filters "*playwright*" in "/home/branko/workspaces/agentic-code/.worktrees/88ce178d-3bb0-49d9-82b9-b9a197697c63"
Scope: 2 of 4 workspace projects
apps/backend test$ jest --config jest.config.js
apps/backend test: FAIL src/auth/auth.service.spec.ts
apps/backend test:   ● Test suite failed to run
apps/backend test:     TypeError: Attempted to assign to readonly property.
apps/backend test:       at ../../../node_modules/.pnpm/jest-runtime@29.7.0/node_modules/jest-runtime/build/index.js:1638:6
apps/backend test:       at forEach (native)
apps/backend test:       at Object.<anonymous> (../../../node_modules/.pnpm/stack-utils@2.0.6/node_modules/stack-utils/index.js:10:9)
apps/backend test:       at Object.<anonymous> (../../../node_modules/.pnpm/expect@29.7.0/node_modules/expect/build/toThrowMatchers.js:9:30)
apps/backend test:       at Object.<anonymous> (../../../node_modules/.pnpm/expect@29.7.0/node_modules/expect/build/index.js:23:54)
apps/backend test:       at _expect (../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js:8:22)
apps/backend test:       at createJestExpect (../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js:29:9)
apps/backend test:       at Object.<anonymous> (../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js:39:35)
apps/backend test:       at processTicksAndRejections (native)
apps/backend test: Test Suites: 1 failed, 1 total
apps/backend test: Tests:       0 total
apps/backend test: Snapshots:   0 total
apps/backend test: Time:        0.457 s
apps/backend test: Ran all test suites.
apps/backend test: Failed
/home/branko/workspaces/agentic-code/.worktrees/88ce178d-3bb0-49d9-82b9-b9a197697c63/apps/backend:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  backend@1.0.0 test: `jest --config jest.config.js`
Exit status 1

```

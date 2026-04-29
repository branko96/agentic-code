# Verification Report

| Step    | Result | Duration |
| ------- | ------ | -------- |
| install | ✓      | 2844ms   |
| test    | ✗      | 1802ms   |

**Verification failed — task blocked from merging.**

## Failures

### test

```
No projects matched the filters "*playwright*" in "/home/branko/workspaces/agentic-code/.worktrees/ba92ef97-adf7-492f-b942-ccb685efa5cd"
Scope: 2 of 4 workspace projects
[36mapps/backend[39m [96mtest[39m$ jest
[36mapps/backend[39m [96mtest[39m: [90m[0m[7m[1m[31m FAIL [39m[90m[22m[27m[0m [2msrc/auth/[22m[1mauth.service.spec.ts[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m  [1m● [22mTest suite failed to run[39m
[36mapps/backend[39m [96mtest[39m: [90m    TypeError: Attempted to assign to readonly property.[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat [22m../../../node_modules/.pnpm/jest-runtime@29.7.0/node_modules/jest-runtime/build/index.js[2m:1638:6[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      at forEach (native)[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat Object.<anonymous> ([22m../../../node_modules/.pnpm/stack-utils@2.0.6/node_modules/stack-utils/index.js[2m:10:9)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat Object.<anonymous> ([22m../../../node_modules/.pnpm/expect@29.7.0/node_modules/expect/build/toThrowMatchers.js[2m:9:30)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat Object.<anonymous> ([22m../../../node_modules/.pnpm/expect@29.7.0/node_modules/expect/build/index.js[2m:23:54)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat _expect ([22m../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js[2m:8:22)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat createJestExpect ([22m../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js[2m:29:9)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      [2mat Object.<anonymous> ([22m../../../node_modules/.pnpm/@jest+expect@29.7.0/node_modules/@jest/expect/build/index.js[2m:39:35)[22m[39m
[36mapps/backend[39m [96mtest[39m: [90m      at processTicksAndRejections (native)[39m
[36mapps/backend[39m [96mtest[39m: [90m[1mTest Suites: [22m[1m[31m1 failed[39m[90m[22m, 1 total[39m
[36mapps/backend[39m [96mtest[39m: [90m[1mTests:       [22m0 total[39m
[36mapps/backend[39m [96mtest[39m: [90m[1mSnapshots:   [22m0 total[39m
[36mapps/backend[39m [96mtest[39m: [90m[1mTime:[22m        0.403 s[39m
[36mapps/backend[39m [96mtest[39m: [90m[2mRan all test suites[22m[2m.[22m[39m
[36mapps/backend[39m [96mtest[39m: Failed
/home/branko/workspaces/agentic-code/.worktrees/ba92ef97-adf7-492f-b942-ccb685efa5cd/apps/backend:
[41m[30m ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL [39m[49m [31mbackend@1.0.0 test: `jest`[39m
[31mExit status 1[39m

```

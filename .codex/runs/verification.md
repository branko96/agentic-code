# Verification Report

| Step    | Result | Duration |
| ------- | ------ | -------- |
| install | ✓      | 18030ms  |
| test    | ✗      | 620ms    |

**Verification failed — task blocked from merging.**

## Failures

### test

```
No projects matched the filters "*playwright*" in "/home/branko/workspaces/agentic-code/.worktrees/df3d4070-ef7f-43e2-b408-3abaea758283"
Scope: 2 of 4 workspace projects
apps/backend test$ jest
apps/backend test: sh: 1: jest: not found
/home/branko/workspaces/agentic-code/.worktrees/df3d4070-ef7f-43e2-b408-3abaea758283/apps/backend:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  backend@1.0.0 test: `jest`
spawn ENOENT
 WARN   Local package.json exists, but node_modules missing, did you mean to install?

```

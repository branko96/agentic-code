# Build Verification — Specification

## Purpose

Verify that all 5 new ARIA form atom components pass TypeScript type checking and Next.js build without errors. This must pass before chunk 4b integration begins.

## Commands

Run these from the repository root (`/home/branko/workspaces/agentic-code/.worktrees/9c586344-64c2-4717-886b-cc9851822306`). The `apps/frontend/package.json` defines both scripts.

### 1. TypeScript Type Check

```
cd apps/frontend && pnpm typecheck
```

This maps to `tsc --noEmit`.

- **Expected exit code**: `0`
- **Expected stderr**: empty
- **Expected stdout**: no output (TypeScript reports nothing on success)
- **Failure mode**: `1` with error messages pointing to type errors — usually missing imports, incorrect prop types, or `forwardRef` type mismatches

### 2. Next.js Build

```
cd apps/frontend && pnpm build
```

This maps to `next build`.

- **Expected exit code**: `0`
- **Expected stderr**: empty
- **Expected stdout**: Next.js build output including route summary
- **Success indicators**: Lines containing:
  - `✓ Compiled successfully` or
  - `✓ Generating static pages` and ` ✓` next to each route
  - Final summary: `Route (app) size` and no errors listed
- **Failure mode**: Non-zero exit, with error messages prefixed by `Error:` or `Failed to compile`
- **Typical failure causes**:
  - Missing `'use client'` directive on a component that uses hooks (`useState`, `useEffect`, `forwardRef`)
  - Incorrect import path (e.g. relative instead of `@/components/aria/...`)
  - Cyclic dependency or unresolved module
  - Syntax error in JSX or TypeScript

## Expected Pass Conditions

All 5 files (`icons.tsx`, `Field.tsx`, `Input.tsx`, `Tabs.tsx`, `PasswordMeter.tsx`) must exist under `apps/frontend/src/components/aria/`. No existing files should be modified — all changes are additive.

### icons.tsx

- Must NOT have `'use client'` directive
- All 8–9 components must be `export const`
- Each must be callable as `<EyeOpenIcon />` (self-closing, no children)

### Field.tsx

- Named export `Field`
- Imports `XMarkIcon` from `./icons`
- No `'use client'` directive

### Input.tsx

- Named export `Input`
- Must use `React.forwardRef`
- Imports `Field` from `./Field`
- No `'use client'` directive (unless `useId()` is used — in which case it's required)

### Tabs.tsx

- Named exports: `Tabs` (component) and `TabId` (type)
- No `'use client'` directive
- Type `TabId = 'login' | 'register'` exported

### PasswordMeter.tsx

- Named exports: `PasswordMeter` (component) and `strengthOf` (function)
- No `'use client'` directive
- Pure function `strengthOf(password: string): number`

## Order

Run `pnpm typecheck` first. If it passes, run `pnpm build`. The build is slower (~30-60s), so catching type errors first saves time.

## Fallback

If typecheck fails:

1. Identify the failing file and line from the error output
2. Fix the type error
3. Re-run `pnpm typecheck`
4. Only proceed to `pnpm build` after typecheck passes

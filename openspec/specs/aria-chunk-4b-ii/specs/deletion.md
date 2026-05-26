# Deletion Contract -- v1 Auth Components

---

## 1. Files to Delete

| File                                                      | Reason for deletion                           |
| --------------------------------------------------------- | --------------------------------------------- |
| `apps/frontend/src/components/auth/login-form.tsx`        | Replaced by `LoginForm.tsx` (ARIA)            |
| `apps/frontend/src/components/auth/register-form.tsx`     | Replaced by `RegisterForm.tsx` (ARIA)         |
| `apps/frontend/src/components/auth/password-strength.tsx` | Replaced by `PasswordMeter.tsx` (ARIA)        |
| `apps/frontend/src/components/auth/tabs.tsx`              | Replaced by `Tabs.tsx` (ARIA, default export) |

## 2. Files to KEEP

| File                                               | Reason to keep                             |
| -------------------------------------------------- | ------------------------------------------ |
| `apps/frontend/src/components/auth/brand-mark.tsx` | No ARIA equivalent; imported by `AuthCard` |

## 3. Import Verification (Pre-Deletion)

The following files MUST be checked to ensure NO remaining imports to the 4 deleted files:

### 3.1 Known consumers BEFORE AuthCard migration:

| Consumer file                                         | Imports from v1                       | Resolution after migration        |
| ----------------------------------------------------- | ------------------------------------- | --------------------------------- |
| `apps/frontend/src/app/auth/page.tsx`                 | `tabs`, `login-form`, `register-form` | Removed -- replaced by `AuthCard` |
| `apps/frontend/src/components/auth/register-form.tsx` | `password-strength`                   | THIS FILE IS DELETED              |

### 3.2 Post-migration verification (grep):

Run the following checks **after** all new files are created and the page is updated:

```bash
# These should return ZERO results:
# 1. Imports to deleted v1 files
grep -rn "@/components/auth/login-form" apps/frontend/src/
grep -rn "@/components/auth/register-form" apps/frontend/src/
grep -rn "@/components/auth/password-strength" apps/frontend/src/
grep -rn "@/components/auth/tabs" apps/frontend/src/

# This should return ONE result (the import in AuthCard):
grep -rn "@/components/auth/brand-mark" apps/frontend/src/
```

If any grep returns results beyond the expected files, those imports must be updated before deletion proceeds.

## 4. Deletion Execution (Order)

1. Delete `login-form.tsx`
2. Delete `register-form.tsx`
3. Delete `password-strength.tsx`
4. Delete `tabs.tsx`

The `brand-mark.tsx` file and its parent directory `apps/frontend/src/components/auth/` should remain. The directory should contain ONLY this file.

## 5. Post-Deletion Verification

- `grep` the four deleted file paths returns zero results
- `grep` for `@/components/auth/brand-mark` returns exactly 1 result in `AuthCard.tsx`
- `pnpm build` passes with no errors
- No dangling references in barrel files (none exist for `components/auth/` currently)

## 6. Risk Register

| Risk                                                | Impact      | Mitigation                                                       |
| --------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| Another PR imports from v1 auth files               | Build break | Search before deleting; if found, coordinate                     |
| `brand-mark.tsx` has internal deps on deleted files | Build break | Verify BrandMark is self-contained (it is -- 31 lines, SVG only) |
| Barrel file references `components/auth/` exports   | Build break | No barrel file exists for `components/auth/` currently           |

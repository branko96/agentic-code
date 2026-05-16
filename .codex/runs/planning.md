# planning

Let me start by reading the current state of the register form to understand what's implemented.Good, now let me also check the backend to see if there's any password validation on the server side.Now I have the full picture. Here's the plan:

---

## Plan: Require special character in password

### 1. Gap analysis

The current password strength function (`getPasswordStrength`) checks:

- `length >= 8`
- `/[A-Z]/` (uppercase)
- `/[0-9]/` (digit)
- `/[^A-Za-z0-9]/` (special character)

The strength bar already shows special characters contribute to the score (segment 4). However, there is **no requirement enforcement** at the form submission level — the password only needs `minLength={8}` on the input. A user could type `abc12345` (no special char) and submit successfully.

**Request:** "que la contraseña exiga un caracter especial" — the password must require a special character.

**What's missing:**

- No validation (frontend or backend) that blocks submission when the password lacks a special character
- No user-facing error message for missing special character
- No visual indicator in the password field when special character is missing

**Scope is frontend-only** — the backend DTO (`register.dto.ts`) only validates `@MinLength(8)` and `@IsString()`. The improvement request doesn't ask for backend changes, and the existing pattern has the frontend handle pre-submit validation (the `handleSubmit` already checks names inline).

### 2. File map

| File                                      | Action |
| ----------------------------------------- | ------ |
| `apps/frontend/src/app/register/page.tsx` | modify |

No new files, no backend changes.

### 3. Implementation tasks

#### Task 1: Add special character validation and error message in handleSubmit

**File:** `apps/frontend/src/app/register/page.tsx`

**Steps:**

1. Add a variable `const missingSpecialChar = password.length > 0 && !/[^A-Za-z0-9]/.test(password);` (compute inline alongside `strength`)

2. In `handleSubmit`, after the `!firstName.trim() || !lastName.trim()` check and before the try block, add:

```typescript
if (!/[^A-Za-z0-9]/.test(password)) {
  setError('La contraseña debe contener al menos un carácter especial');
  setIsSubmitting(false);
  return;
}
```

3. In the submit button's `disabled` prop, add `missingSpecialChar`:

```typescript
disabled={
  isSubmitting || !agreeTerms || missingSpecialChar ||
  (!!confirmPassword && password !== confirmPassword)
}
```

4. Below the password strength bar, add a conditional hint when the password has content but no special char:

```tsx
{
  password.length > 0 && !/[^A-Za-z0-9]/.test(password) && (
    <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
      Debe incluir al menos un carácter especial
    </p>
  );
}
```

**Commit message:** "feat: require special character in password"

Since step 1 is a small refactor and step 2-4 are the actual changes, this can be a single commit.

### 4. Self-review

| Requirement                               | Covered? | Where                                                    |
| ----------------------------------------- | -------- | -------------------------------------------------------- |
| Password must require a special character | Yes      | `handleSubmit` rejects password without `/[^A-Za-z0-9]/` |
| Button disabled when missing special char | Yes      | `disabled` prop includes `missingSpecialChar`            |
| User sees why they can't submit           | Yes      | Inline red hint + error message on submit attempt        |
| No backend changes                        | Yes      | Only `page.tsx` modified                                 |

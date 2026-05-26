# PasswordMeter.tsx — Specification

## File

`apps/frontend/src/components/aria/PasswordMeter.tsx`

## Purpose

A password strength indicator that renders 4 segments with dynamic colouring based on a score. Replaces the current `components/auth/password-strength.tsx` with an ARIA-styled version and an improved scoring algorithm. Exports a pure `strengthOf()` function for testing and reuse.

## Exports

### 1. `strengthOf(password: string): number` — Pure scoring function

Scoring algorithm with 5 criteria, each worth 1 point. Max score = 4, min = 0.

```typescript
export function strengthOf(password: string): number {
  let score = 0;

  // Criterion 1: Minimum length (8+ characters)
  if (password.length >= 8) score++;

  // Criterion 2: Contains uppercase letter
  if (/[A-Z]/.test(password)) score++;

  // Criterion 3: Contains lowercase letter
  if (/[a-z]/.test(password)) score++;

  // Criterion 4: Contains digit
  if (/\d/.test(password)) score++;

  // Criterion 5: Contains special character (non-alphanumeric)
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Clamp: at least 1 if password is non-empty (so empty = 0, any chars = at least 1)
  // ACTUALLY — keep the raw score 0-4. If password is empty, component doesn't render.
  // Minimum non-empty score is 1 (if at least one criterion passes) or 0 (but only if empty).
  return score;
}
```

**Scoring differences from `password-strength.tsx`**: The current version (`components/auth/password-strength.tsx`) uses only 4 criteria, missing the lowercase check. The new version adds lowercase detection as criterion 3. This means a password like `AAAAAA` scores 1 (length) instead of 2 (length + uppercase) — more accurate since all-uppercase is not strong.

### 2. `PasswordMeter` component

#### Props Interface

```typescript
interface PasswordMeterProps {
  /** The raw password string. Component returns null if falsy. */
  password: string;
}
```

#### Component Behaviour

```typescript
export function PasswordMeter({ password }: PasswordMeterProps) {
  if (!password) return null;

  const score = strengthOf(password);

  return (
    <div className="mt-2">
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {SEGMENTS.map((segmentIndex) => {
          const filled = segmentIndex <= score;
          return (
            <div
              key={segmentIndex}
              className="h-1 flex-1 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: filled
                  ? SEGMENT_COLORS[score]   // inline style — dynamic, not Tailwind
                  : 'rgba(255,255,255,0.1)',  // empty segment colour
              }}
            />
          );
        })}
      </div>
      {/* Label */}
      <p className="mt-1 font-mono text-[10px] text-aria-accent/50">
        {LABELS[score]}
      </p>
    </div>
  );
}
```

#### Segment Rendering Logic

| State         | Segments filled                  | Colour                                        |
| ------------- | -------------------------------- | --------------------------------------------- |
| `score === 0` | none (hidden by !password guard) | N/A                                           |
| `score === 1` | 1 of 4                           | `#f87171` (red-400)                           |
| `score === 2` | 2 of 4                           | `#fbbf24` (amber-400)                         |
| `score === 3` | 3 of 4                           | `#34d399` (emerald-400)                       |
| `score === 4` | 4 of 4                           | `#22d3ee` (cyan-400) — the ARIA accent colour |

**Key difference from current**: The current `password-strength.tsx` uses the same colour for score 3 and 4 (both green). The new version reserves green for score 3 and uses cyan (the ARIA accent) for the max score of 4, creating a clear visual distinction between "strong" and "very strong".

#### Empty Segment Colour

- All non-filled segments: `rgba(255, 255, 255, 0.1)` — subtle white at 10% opacity. This is the same as `bg-white/10` but expressed as inline `style` since Tailwind's dynamic class construction doesn't work here.

#### Label Mapping

| Score | Label        | Text class                                              |
| ----- | ------------ | ------------------------------------------------------- |
| 1     | `Débil`      | `font-mono text-[10px]` + colour matching first segment |
| 2     | `Media`      | same font class                                         |
| 3     | `Fuerte`     | same font class                                         |
| 4     | `Muy fuerte` | same font class                                         |

The label uses a fixed muted colour (`text-aria-accent/50`), not the segment colour. This avoids distracting colour changes in the label text.

#### Segment Bar Styling

| Property      | Value                            |
| ------------- | -------------------------------- |
| Height        | `h-1` (4px)                      |
| Border radius | `rounded-full`                   |
| Gap           | `gap-1` (4px)                    |
| Transition    | `transition-colors duration-200` |

#### Container

- `mt-2` margin-top for spacing below the input

## States

| State     | Rendering | Notes                                                                                       |
| --------- | --------- | ------------------------------------------------------------------------------------------- |
| Empty     | `null`    | Component returns null                                                                      |
| Typing    | live bar  | Segments re-render on each keystroke (fast, no debounce needed)                             |
| Non-empty | always    | Always shows score even if 0 (but 0 is impossible for non-empty with the current algorithm) |

## Edge Cases

1. **Empty password**: Component returns `null` immediately — no DOM rendered. This means the field has no visual artifact when empty.
2. **Fast typing**: No debounce needed. The scoring function is O(n) on password length and runs synchronously. React batching handles rapid keystrokes.
3. **Unicode/punycode passwords**: The regex patterns work on JavaScript's UTF-16 strings. Characters outside BMP (surrogate pairs) are treated as two `charAt()` positions. The `[^A-Za-z0-9]` pattern correctly identifies any non-ASCII character (including accented letters, CJK, emoji) as "special" — this is acceptable behaviour.
4. **Extremely long passwords**: No upper limit on scoring. The algorithm caps at 4 regardless of length. Length > 8 still scores 1 point (no extra credit for length beyond 8).

## No `'use client'` Directive

`PasswordMeter` does NOT use hooks, event handlers, or state. It's a pure render function. The component checks `!password` for early return but this is a synchronous prop check, not a hook.

## Imports

- No external imports beyond React JSX runtime.
- No imports from `./icons` (PasswordMeter does not use icons).
- `strengthOf` is both an internal helper and a named export (for consumer testing).

## Test Plan (for verification)

The `strengthOf` function should be unit-testable:

| Input        | Expected score | Reason                                        |
| ------------ | -------------- | --------------------------------------------- |
| `""` (empty) | 0              | No criteria met                               |
| `"abc"`      | 1              | Lowercase only                                |
| `"abcdefgh"` | 2              | Length (8) + lowercase                        |
| `"Abcdefgh"` | 3              | Length + upper + lower                        |
| `"Abcdefg1"` | 4              | Length + upper + lower + digit                |
| `"Abcd3fg!"` | 5              | All 5 criteria met                            |
| `"AAAAAAA1"` | 3              | Length + upper + digit (no lower, no special) |

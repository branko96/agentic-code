# Input.tsx — Specification

## File

`apps/frontend/src/components/aria/Input.tsx`

## Purpose

A styled `<input>` element that composes over the `Field` wrapper. Adds ARIA-styled focus glow, optional left icon slot, optional right slot (for password toggle, clear button), and error ring styling. Uses `forwardRef` for form library compatibility (`react-hook-form` etc.).

## Props Interface

```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text passed through to Field's label prop. */
  label: string;

  /** Error message string — renders in Field's error slot and applies error ring styling. */
  error?: string;

  /** Hint text passed through to Field's hint slot. Hidden when error is also set. */
  hint?: string;

  /** Optional icon rendered inside the input on the left side (e.g. EnvelopeIcon, LockIcon). */
  icon?: React.ReactNode;

  /** Optional element rendered on the right side inside the input (e.g. Eye toggle button). */
  rightSlot?: React.ReactNode;

  /** Additional class names appended to the input element. */
  className?: string;
}
```

## Rendered Structure

```tsx
<Field label={label} error={error} hint={hint} id={id}>
  <div className="relative">
    {/* Left icon: positioned absolutely, left-3, top-1/2 -translate-y-1/2 */}
    {icon && (
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        {icon}
      </span>
    )}

    {/* The actual input element */}
    <input
      ref={ref}
      id={id}
      className={cn(
        // Base styles
        'h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground text-sm outline-none transition',
        'placeholder:text-muted/50',
        // Left icon padding
        icon ? 'pl-9' : 'pl-3',
        // Right slot padding
        rightSlot ? 'pr-10' : 'pr-3',
        // Focus glow (cyan)
        'focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee]',
        // Error state overrides focus glow to rose
        error && 'ring-2 ring-red-400/30 border-red-400 focus:ring-red-400/50 focus:border-red-400',
        className
      )}
      {...props}
    />

    {/* Right slot: positioned absolutely, right-3, top-1/2 -translate-y-1/2 */}
    {rightSlot && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>}
  </div>
</Field>
```

## Styling Specification

### Input Element (default state)

| Property            | Value                        |
| ------------------- | ---------------------------- |
| Height              | `h-10 sm:h-11` (40px / 44px) |
| Width               | `w-full`                     |
| Border radius       | `rounded-lg` (8px)           |
| Background          | `bg-surface`                 |
| Text colour         | `text-foreground`            |
| Font size           | `text-sm`                    |
| Outline             | `outline-none`               |
| Placeholder         | `placeholder:text-muted/50`  |
| Padding (no icon)   | `pl-3 pr-3`                  |
| Padding (left icon) | `pl-9`                       |
| Padding (right      | `pr-10`                      |
| slot)               |                              |
| Transition          | `transition` (all 150ms)     |

### Focus Glow (default — cyan)

| Property      | Value                     |
| ------------- | ------------------------- | ----------------------------- |
| Ring width    | `focus:ring-2`            |
| Ring colour   | `focus:ring-[#22d3ee]/30` | ← exact cyan hex, 30% opacity |
| Border colour | `focus:border-[#22d3ee]`  | ← exact cyan hex              |

### Error State

| Property           | Value                                |
| ------------------ | ------------------------------------ |
| Ring width         | `ring-2` (always on, not just focus) |
| Ring colour        | `ring-red-400/30`                    |
| Border colour      | `border-red-400`                     |
| Focus ring (error) | `focus:ring-red-400/50`              |
| Focus border (err) | `focus:border-red-400`               |

The error ring overrides the default focus glow entirely. When `error` is truthy, the input never shows the cyan focus glow — it shows the red error ring on both idle and focus states.

### Disabled State

- Inherits from native `<input disabled>` styling
- `cursor-not-allowed` + `opacity-50` pattern (carried by the consuming form button, but the input itself should appear dimmed)
- The Field label opacity transition still works with `:focus-within`, but disabled inputs don't receive focus

### Icon Slot Positioning

- Left icon: `absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none`
  - `pointer-events-none` ensures clicks pass through to the input underneath
  - Inherits `text-muted` colour
- Right slot: `absolute right-3 top-1/2 -translate-y-1/2`
  - DOES have pointer events (for interactive buttons like password toggle)
  - The parent must set `tabIndex={-1}` on interactive buttons to avoid stealing focus

## forwardRef

Input MUST be wrapped in `React.forwardRef<HTMLInputElement, InputProps>`:

```typescript
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightSlot, className, id, ...props }, ref) => {
    // ...
  }
);
Input.displayName = 'Input';
```

This allows form libraries (`react-hook-form`) to pass a `ref` for controlled value access:

```typescript
<Input label="EMAIL" icon={<EnvelopeIcon />} {...register('email')} />
```

## Accessibility Attributes

- The outer `<Field>` element is a `<label>` with `htmlFor={id}` — clicking the label focuses the input
- The `<input>` has `id={id}` (use `useId()` if no `id` prop provided — but since Input is presentational, prefer requiring the consumer to pass `id` or using `React.useId()` internally with `'use client'` directive)
- Error message is rendered with `role="alert"` on the Field's error span
- The right slot button should have `aria-label` (e.g., `"Mostrar contraseña"`) — this is the consumer's responsibility, not Input's

## Edge Cases

1. **`useId()` vs `id` prop**: If Input uses `useId()` internally, it needs `'use client'` directive. Alternative: require the consumer to always pass `id`. The spec recommends requiring `id` to keep Input server-component compatible. If the consumer's form library auto-generates `id`, prefer that.

2. **Password autofill**: When `type="password"`, ensure `autoComplete` is forwarded:
   - Login: `autoComplete="current-password"`
   - Register: `autoComplete="new-password"`
     These are the consumer's responsibility, not Input's default.

3. **Right slot button focus**: The password toggle button inside `rightSlot` should have `tabIndex={-1}` so tabbing through the form skips the toggle and goes directly to the next field. This is the consuming template's responsibility.

4. **No `'use client'`** if no hooks are used internally. If `useId()` is added, add the directive. The simplest path is no directive + required `id` prop.

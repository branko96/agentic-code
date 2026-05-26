# Field.tsx — Specification

## File

`apps/frontend/src/components/aria/Field.tsx`

## Purpose

A form field wrapper component that composes a label, a content slot (for any input/control), and optional error or hint messages. This replaces the ad-hoc `<div>` + `<label>` patterns repeated across `login-form.tsx` and `register-form.tsx`.

## Props Interface

```typescript
interface FieldProps {
  /** Label text displayed above the children. Always rendered in uppercase via Tailwind tracking+uppercase. */
  label: string;

  /** The input/control element to render inside the field. */
  children: React.ReactNode;

  /** Optional error message. When set, renders in danger colour below children.
   *  Takes visual precedence over `hint` — when both are provided, only error renders. */
  error?: string;

  /** Optional hint/helper text. Renders in muted colour below children.
   *  Hidden when `error` is also provided. */
  hint?: string;

  /** Unique ID for the label's `htmlFor` attribute. Must match the child input's `id`. */
  id?: string;

  /** Additional class names appended to the wrapper. */
  className?: string;
}
```

## Slot / Layout Diagram

```
┌────────────────────────────────┐
│  LABEL_TEXT            CODE?  │  ← label row: flex row, label left, optional right slot
│                                │
│  ┌──────────────────────────┐  │  ← children slot: full width
│  │  <input/select/etc>      │  │
│  └──────────────────────────┘  │
│                                │
│  Error message or hint text   │  ← bottom slot: only one visible
└────────────────────────────────┘
```

## Rendered Structure

```tsx
<label className="flex flex-col gap-1.5 [&:has(:focus-within)_._label-row]:opacity-100">
  <span className="_label-row flex items-center justify-between opacity-70 transition-opacity">
    <span className="font-mono text-[10px] uppercase tracking-wider text-aria-accent">{label}</span>
    {/* optional right-label slot if needed — reserved for future use */}
  </span>
  {children}
  {/* Error has priority — render only one of error/hint */}
  {error && (
    <span className="flex items-center gap-1 font-mono text-[10px] text-red-400" role="alert">
      <XMarkIcon />
      {error}
    </span>
  )}
  {!error && hint && <span className="font-mono text-[10px] text-aria-accent/50">{hint}</span>}
</label>
```

## Styling Specification

### Label Row

- Font: `font-mono text-[10px]`
- Colour: `text-aria-accent` (the cyan accent token)
- Transform: `uppercase`
- Tracking: `tracking-wider`
- Opacity: 70% by default, transitions to 100% when any descendant has `:focus-within`
- Layout: `flex items-center justify-between` (label on left, optional right slot reserved)

### Children Slot

- Minimal wrapping — just `{children}` inside the flex column
- Gap to label: `gap-1.5` (6px)
- Gap to error/hint: `gap-1.5` via the flex column

### Error State

- Condition: `error` prop is a non-empty string
- Icon: `XMarkIcon` (16x16) placed before the error text, using the same red-400 colour
- Text colour: `text-red-400`
- Font: `font-mono text-[10px]`
- Layout: `flex items-center gap-1`
- ARIA role: `role="alert"` — announces to screen readers
- Priority: error ALWAYS replaces hint when both are provided (never show both simultaneously)
- Gap to input: auto from flex column `gap-1.5`

### Hint State

- Condition: `hint` prop is a non-empty string AND `error` is falsy
- Text colour: `text-aria-accent/50` (50% opacity of the cyan accent, creating a dimmed appearance)
- Font: `font-mono text-[10px]`
- Hidden when `error` is present — only one of error/hint renders at a time

### Default State

- No error, no hint: only the label row and children render. The error/hint slot is absent from the DOM (not just visually hidden).

### Label Opacity Transition

- Default: `opacity-70` on the label row span
- When the field's input has focus: the label row gets `opacity-100`
- Mechanism: parent `<label>` has `[&:has(:focus-within)_._label-row]:opacity-100`
- Transition: `transition-opacity` on the label row

## States Summary

| State   | label  | children | error    | hint            |
| ------- | ------ | -------- | -------- | --------------- |
| Default | 70%    | rendered | absent   | absent          |
| Focus   | 100%   | rendered | absent   | absent          |
| Error   | 100%   | rendered | rendered | absent (hidden) |
| Hint    | varies | rendered | absent   | rendered        |

## Behavioural Rules

1. **No `'use client'` directive** — Field is pure props-in/JSX-out with no hooks, event handlers, or state. It composes children but does not manage them.
2. **No state ownership** — Field does NOT manage error/hint state. It only renders what it receives via props.
3. **`<label>` wrapping** — The root element is a `<label>` (not a `<div>`), so clicking anywhere in the field focuses the child input (when `id` matches `htmlFor`). If the `id` prop is provided, it maps to `htmlFor={id}` on the `<label>`.
4. **Named export**: `export function Field(...)` or `export const Field = (...) => ...`. Not default export.
5. **Imports from `./icons`**: The error state references `XMarkIcon` — import it from the sibling `icons.tsx` module: `import { XMarkIcon } from './icons'`.

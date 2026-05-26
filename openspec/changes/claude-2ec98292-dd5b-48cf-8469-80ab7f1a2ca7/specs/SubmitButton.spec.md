# SubmitButton Spec

## Props
```ts
interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;   // Shows SpinnerIcon, disables button, prevents click
  children: React.ReactNode;
}
```
- Extends native button attributes: consumers pass `type`, `disabled`, `onClick`, `form`, `id`, etc.
- Uses `React.forwardRef` forwarding to `<button>`. DisplayName: `'SubmitButton'`.

## Behavior
- **Default type**: `"submit"` (unless overridden via `type` prop). This makes it a drop-in for `<form>` elements.
- **isLoading=true**: Renders `SpinnerIcon` from `./icons` to the left of `children` in an inline-flex container. Button is `disabled` (HTML disabled + `aria-busy="true"`). `onClick` does NOT fire.
- **disabled=true** (explicit): Same visual treatment as loading (opacity-50, cursor-not-allowed), no spinner. `isLoading` takes precedence when both are true.
- **Children**: Plain text expected but any ReactNode works (e.g., icon + text). No transformation on children.

## Styling
```tsx
className="w-full rounded-lg bg-primary py-3 text-sm font-semibold
  text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)]
  hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50
  transition-all duration-200 inline-flex items-center justify-center gap-2"
```
- `inline-flex items-center justify-center gap-2` ensures SpinnerIcon + text are centered with a gap
- Focus uses `focus-visible` (not `focus`): only shows ring on keyboard focus, not mouse click
- Transition animates background, opacity, and shadow changes

## Accessibility
- `aria-busy="true"` when `isLoading` -- screen readers announce "busy"
- `disabled` attribute set when `isLoading || props.disabled`
- Native `<button>` role: no `role` attribute needed

## Edge cases
- `isLoading` + `disabled` both true: behaves as loading (spinner, disabled, aria-busy)
- `isLoading` with zero-length `children`: renders spinner alone, button is still disabled
- Consumer passes `className`: appended to default classes (not replacing). Use `cn()` or template literal merge.
- Window `matchMedia('(prefers-reduced-motion: reduce)')` not handled -- the `animate-spin` on SpinnerIcon is inherited from its definition; no extra motion guard needed since spinner animation is intrinsic.

## Dependencies
- `SpinnerIcon` from `./icons`

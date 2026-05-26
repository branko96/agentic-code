# SocialRow Spec

## Props
```ts
interface SocialProvider {
  name: string;
  onClick: () => void;
}

interface SocialRowProps {
  providers: SocialProvider[];
  label?: string;  // default: "Or continue with"
  className?: string;
}
```

## Behavior
- Renders a themed card (`bg-surface border border-surface-border rounded-lg p-4`)
- If `label` is provided (or default), renders it as a centered label above the buttons
- Maps `providers` array to a vertical stack of buttons (one per provider)
- Each button fires `onClick(...)` when clicked
- No icon slot yet -- buttons contain only the provider `name` text. This is a deliberate v1 constraint; icon injection will be added in a future chunk.

## Styling
```tsx
// Card wrapper
<div className="bg-surface border border-surface-border rounded-lg p-4">
  {label && (
    <p className="text-xs text-muted text-center mb-3">{label}</p>
  )}
  <div className="flex flex-col gap-2">
    {providers.map((provider) => (
      <button
        key={provider.name}
        type="button"
        onClick={provider.onClick}
        className="flex items-center justify-center gap-2 w-full rounded-md
          py-2.5 text-sm font-medium bg-surface-elevated hover:bg-surface-border
          text-foreground transition-colors focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {provider.name}
      </button>
    ))}
  </div>
</div>
```
- Buttons are `type="button"` (not submit) -- never triggers form submission
- Vertical flex column with `gap-2` between provider buttons
- `key` uses `provider.name` (providers are unlikely to change identity; if duplicates are possible, consumer should dedupe)

## Accessibility
- `<p>` for label with `text-muted` styling -- no ARIA widget role needed since this is a descriptive heading, not a live region
- Native `<button>` elements -- no extra roles
- `focus-visible` ring on buttons for keyboard navigation
- If providers array is empty: renders the card with label only (empty state). Consumer should handle this upstream.

## Edge cases
- **Empty providers**: renders label + empty card. No buttons. No errors.
- **Single provider**: renders one button. Stack layout is fine.
- **Many providers (5+)**: vertical scroll within card if container has fixed height. Currently no overflow hidden; buttons push card height naturally.
- **Label disabled**: pass `label=""` or `undefined` to hide the label entirely. Default behavior shows the default string.
- **Provider name collisions**: duplicate `name` values will cause React key warning. Consumer responsibility to dedupe.
- **Long provider names**: text wraps inside flex container. `truncate` not applied -- providers are expected to be short strings ("Google", "GitHub", etc.).

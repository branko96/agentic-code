# ArrowRightIcon + FingerprintIcon Spec

## Contract
Both icons are named function components in `icons.tsx`. No props. No refs. Pure SVG.

## ArrowRightIcon
- **Paths**: `M5 12h14` (horizontal line), `M12 5l7 7-7 7` (arrowhead)
- **Visual**: right-pointing arrow from center, symmetric, 24x24 viewBox

## FingerprintIcon
- **Paths**: Standard fingerprint SVG -- concentric curved lines (no circles, no straight lines)
- **Visual**: fingerprint whorl, ~8-10 path segments, moderate complexity
- Must use `strokeLinecap="round"` on each segment for organic look

## Both icons MUST
- Use `ICON_CLASSES = 'h-4 w-4'`
- Use `aria-hidden="true"`
- Use `width={16} height={16} viewBox="0 0 24 24"`
- Use `fill="none" stroke="currentColor" strokeWidth={2}`
- Wrap paths in `<g strokeLinecap="round" strokeLinejoin="round">`
- Be exported as named exports (no `default`)
- NOT duplicate the `ICON_CLASSES` declaration

## Edge cases
- Fingerprint path accuracy: prefer a generous CC0 path (e.g., Heroicons, Lucide) over hand-drawn -- the repo uses standard SVG icon paths already. Exact visual match to known icon sets is intentional; these are utility icons, not brand art.
- No animation, no hover effects, no interaction states

## Impact
- All existing icon exports remain unchanged
- No form or page imports touch these directly (consumed via SubmitButton and SocialRow)

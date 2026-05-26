# Explore: ARIA Chunk 4b-i — SubmitButton + SocialRow + 2 icons

## Change Name
`claude-2ec98292-dd5b-48cf-8469-80ab7f1a2ca7`

## Task
ARIA chunk 4b-i — SubmitButton + SocialRow + 2 icons. Sub-chunk of 4b: CTAs only + missing icons. No forms or page touching.

## Files Investigated

| File | Role |
|------|------|
| `apps/frontend/src/components/aria/icons.tsx` | Existing icon components (EyeOpen, EyeClosed, Spinner, Check, XMark, Envelope, Lock, User, Key) |
| `apps/frontend/src/components/aria/Input.tsx` | Reusable input using `Field` wrapper, `icon` + `rightSlot` props. Styled with `bg-surface`, `text-foreground`, `rounded-lg`, cyan focus ring |
| `apps/frontend/src/components/aria/Tabs.tsx` | Tab navigation component, `button` elements with `aria-selected` |
| `apps/frontend/src/components/aria/Field.tsx` | Label+error+hint layout wrapper, uses `XMarkIcon` for errors |
| `apps/frontend/src/components/aria/PasswordMeter.tsx` | Strength meter, pure function + UI, no BC |
| `apps/frontend/tailwind.config.ts` | Custom color tokens: `surface`, `surface-border`, `surface-elevated`, `primary`, `primary-foreground`, `muted`, `danger`, `aria-accent`, etc. |
| `apps/frontend/src/components/auth/login-form.tsx` | Inline submit button: `bg-primary py-3 w-full rounded-lg font-semibold text-sm text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.3)]` |
| `apps/frontend/src/components/auth/register-form.tsx` | Same inline submit button pattern as login-form. Also inline social icons (none yet). |
| `apps/frontend/src/app/auth/page.tsx` | Auth page layout, uses `@/components/auth/*` (not aria components yet) for LoginForm/RegisterForm |

## Key Findings

### 1. No button component exists in `aria/`
The auth forms each duplicate their submit button inline. There is no reusable `Button` or `SubmitButton` in the aria component set. This is the primary opportunity.

### 2. Icon pattern is consistent
All icons in `icons.tsx`:
- Use `ICON_CLASSES = 'h-4 w-4'` constant
- Use `aria-hidden="true"`
- Use `width={16} height={16} viewBox="0 0 24 24"`
- Use `fill="none" stroke="currentColor" strokeWidth={2}`
- Wrap path elements in `<g strokeLinecap="round" strokeLinejoin="round">`
- Are exported as named function components (no default exports)

### 3. No barrel (index.ts) for aria components
The auth page imports directly: `import Input from '@/components/aria/Input'`. No central re-export file exists. Adding one later would be a separate concern.

### 4. SubmitButton styling (from existing forms)
The inline buttons in `login-form.tsx` / `register-form.tsx` follow:
- `w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground`
- Glow: `shadow-[0_0_20px_rgba(34,211,238,0.3)]`
- Loading state: `SpinnerIcon` + text, `disabled:opacity-50 disabled:cursor-not-allowed`
- Focus: `focus:ring-2 focus:ring-primary/50`

### 5. SocialRow does not exist yet
No social login buttons/row component exists anywhere. Needs to be built from scratch following aria design language.

### 6. Auth forms still live in `@/components/auth/` (legacy)
The task explicitly says NOT to touch forms or pages. The new components (SubmitButton, SocialRow) will live in `@/components/aria/` and get consumed by the legacy auth forms later in a separate chunk.

## Risks and Considerations
- `SubmitButton` should accept `isLoading`, `children` (text), and standard button props
- `SocialRow` needs design input: what providers? What icons? Current repo has no SVGs for Google/GitHub/Microsoft etc.
- `ArrowRightIcon` and `FingerprintIcon` follow the established SVG pattern. Fingerprint is a moderately complex path -- need clean SVGs.
- No barrel export yet: consumers will import individual components by path.

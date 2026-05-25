# Dark Cyan Design System

## 1.1 Color Palette

| Token                  | HEX                     | Role                         |
| ---------------------- | ----------------------- | ---------------------------- |
| `--background`         | `#07111f`               | Page background              |
| `--foreground`         | `#f8fafc`               | Primary text                 |
| `--surface`            | `#0f172a`               | Card/surface background      |
| `--surface-elevated`   | `#1e293b`               | Elevated surface (active)    |
| `--surface-foreground` | `#e2e8f0`               | Text on surface              |
| `--surface-border`     | `rgba(148,163,184,0.2)` | Subtle borders               |
| `--primary`            | `#22d3ee`               | Cyan accent (buttons, links) |
| `--primary-foreground` | `#082f49`               | Text on primary              |
| `--muted`              | `#94a3b8`               | Secondary/muted text         |
| `--danger`             | `#f87171`               | Error states                 |
| `--success`            | `#34d399`               | Success states               |
| `--warning`            | `#fbbf24`               | Warning states               |

## 1.2 Typography

- **Body/small text:** `text-sm` (14px)
- **Labels:** `text-xs font-medium uppercase tracking-wider` (uppercase 12px labels)
- **Page title:** `text-[22px] font-medium tracking-tight`
- **Description:** `text-sm text-muted`
- **CTA button:** `font-semibold text-sm`
- **Error banner:** `text-sm` with red border/bg
- **Bottom link:** `text-sm text-muted` with primary accent on the anchor

## 1.3 Spacing

- **Card padding:** `p-6`
- **Card wrapper spacing:** outer `p-6` on container, inner card `p-6`
- **Tab container:** `p-1` inner padding for segmented control
- **Input spacing:** `mb-1.5` between label and input, `gap-4` between form fields
- **CTA bottom link:** `mt-6` (or `pt-6` inside card after tabs)

## 1.4 Component Specs

### Card

```
rounded-xl border border-surface-border bg-surface shadow-lg
```

### Input

```
h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground px-3 text-sm outline-none transition
focus:ring-2 focus:ring-primary/30 focus:border-primary
```

### Button (primary CTA)

```
w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm
shadow-[0_0_20px_rgba(34,211,238,0.3)]
hover:bg-primary/90
focus:outline-none focus:ring-2 focus:ring-primary/50
disabled:opacity-50 disabled:cursor-not-allowed
```

### Tabs (segmented control)

```
grid grid-cols-2 p-1 rounded-lg bg-surface-border/10
```

- Active: `text-primary bg-surface-elevated shadow-sm`
- Inactive: `text-muted`

### Brand mark

- Inline SVG 20x20, primary bg, "AC" text in white/primary-foreground
- "agentic-code . console" in muted text to the right

### Password strength

- 4-segment meter, `h-2 rounded-full`, segments separated by `gap-1`
- Score logic: +1 per (>=8 chars, uppercase, digit, special char)
- 1 segment = danger, 2 = warning, 3-4 = success
- Labels below: Debil, Media, Fuerte, Muy Fuerte
- Inline style ONLY for dynamic segment colors. Everything else pure Tailwind.
- Segments use `transition-colors duration-200`.

## 1.5 CSS Do's and Don'ts

- DO use CSS variables via Tailwind (`bg-surface`, `text-muted`, etc.)
- DO NOT use inline `style` attributes for anything fixed. Only exception: dynamic values (e.g., segment colors in PasswordStrength)
- DO NOT import icon libraries. Use inline SVGs for the small number of icons needed (eye show/hide, spinner, brand mark).
- DO use `ring` utilities for focus states instead of inline blur handlers.
- DO NOT use light-theme colors (white backgrounds, gray-700 text, purple accents). The design system is dark-only.

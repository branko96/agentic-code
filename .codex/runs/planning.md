# planning

## Design analysis

- **Layout**: single centered card on a dark full-screen background.
- **Components visible**: logo mark above the title; title; subtitle text; two stacked input fields; one “Remember me” checkbox with label; one “Forgot password?” link; one primary submit button.
- **Colors**: dark navy background; white card; dark text; muted gray secondary text; blue primary button; blue accents on the checkbox/link/logo.
- **Typography**: large bold title; smaller muted subtitle; regular field labels/placeholder text; medium-weight button text.
- **Copy text**: I can only reliably confirm the following exact strings from the image: `Remember me`, `Forgot password?`.

## 1. File map

- `apps/frontend/src/app/page.tsx` — modify the existing login screen markup/state bindings to match the new centered card layout while preserving the current login submit flow.
- `apps/frontend/src/app/globals.css` — modify the global color tokens and page background so the login page matches the dark background and white-card visual style shown in the design.
- `apps/frontend/src/app/layout.tsx` — modify page metadata if needed so the login screen title/description align with the new UI; this file already imports the page tree as the parent layout.

## 2. Risk assessment

- The current root route `apps/frontend/src/app/page.tsx:14` handles both unauthenticated login UI and authenticated post-login navbar state, so changing its structure can accidentally break the existing logged-in view.
- The submit handler in `apps/frontend/src/app/page.tsx:43` is already wired to `login`, `persistToken`, and `getConfig`; visual changes must not alter `type="submit"`, controlled inputs, or disabled/loading behavior.
- Global token changes in `apps/frontend/src/app/globals.css:4` affect the authenticated navbar view too, not just the login card.
- If metadata changes in `apps/frontend/src/app/layout.tsx:3`, browser tab title/description will change app-wide.

## 3. Bite-sized implementation tasks

### Task 1: Update the login card structure

Files: modify apps/frontend/src/app/page.tsx

- [ ] Step: Replace the unauthenticated `<section>` block with a single centered white card and exact visible controls, keeping the existing state/hooks and submit handler intact:

  ```tsx
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-slate-950">
      <section className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
          <div className="h-7 w-7 rounded-xl bg-blue-600" />
        </div>

        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-950">...</h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">...</p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            ...
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            ...
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember me</span>
            </label>

            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-4 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : '...'}
          </button>
        </form>
      </section>
    </main>
  );
  ```

- [ ] Step: Keep the authenticated branch and `handleSubmit` logic unchanged except for removing the old `primaryButtonClassName` reuse from the login button if it no longer matches the design.
- [ ] Step: Run `pnpm --filter frontend lint` — expected: exit code `0`
- [ ] Step: git commit -m "feat(ui): redesign login card layout"

### Task 2: Update the global visual tokens for the login screen

Files: modify apps/frontend/src/app/globals.css

- [ ] Step: Replace the root tokens and body background so the page uses a darker flat/soft-gradient background and neutral foreground values that support a white login card:

  ```css
  :root {
    --background: #0f172a;
    --foreground: #e2e8f0;
    --surface: #ffffff;
    --surface-foreground: #0f172a;
    --surface-border: rgba(148, 163, 184, 0.2);
    --primary: #2563eb;
    --primary-foreground: #eff6ff;
    --muted: #64748b;
    --danger: #dc2626;
  }

  body {
    color: var(--foreground);
    background:
      radial-gradient(circle at top, rgba(37, 99, 235, 0.18), transparent 32%),
      linear-gradient(180deg, #0f172a 0%, #111827 100%);
    font-family: Arial, Helvetica, sans-serif;
    min-height: 100vh;
  }
  ```

- [ ] Step: Do not add any extra utility classes or component abstractions; keep this file limited to token/background changes required by the visible design.
- [ ] Step: Run `pnpm --filter frontend typecheck` — expected: exit code `0`
- [ ] Step: git commit -m "style(ui): align login page colors with design"

### Task 3: Update page metadata copy

Files: modify apps/frontend/src/app/layout.tsx

- [ ] Step: Replace the generic metadata object with login-specific copy:
  ```tsx
  export const metadata: Metadata = {
    title: 'Login',
    description: 'Login page',
  };
  ```
- [ ] Step: Keep the existing `RootLayout` component structure unchanged so the app router tree still renders exactly as before.
- [ ] Step: Run `pnpm --filter frontend build` — expected: output includes `✓ Compiled successfully` and exit code `0`
- [ ] Step: git commit -m "chore(ui): update login page metadata"

## 4. Self-review

- **Acceptance mapping**
  - “diseña y mejora nuestro login como en la imagen” maps to Task 1 (layout/components/copy-bearing controls) and Task 2 (background/colors).
- **Gaps**
  - The image text is not fully legible from the provided render, so I cannot faithfully reproduce the exact title, subtitle, field labels, placeholders, or button label beyond `Remember me` and `Forgot password?`. Those strings need to be confirmed from a clearer image before implementation can be exact.
- **No placeholders check**
  - Failed initially: Task 1 contains `...` placeholders because exact visible copy is unreadable.
  - This must be resolved before coding by obtaining the exact strings from the design.
- **Consistency check**
  - Existing types/functions remain consistent: `handleSubmit`, `login`, `persistToken`, `getConfig`, `email`, `password`, `isSubmitting`, `error`.
- **Parent import check**
  - No new modules/components are planned, so no missing parent imports.

import { expect, test } from '@playwright/test';

// The demo user created by `pnpm seed` (apps/backend/scripts/seed.ts).
const DEMO_EMAIL = (process.env.E2E_DEMO_EMAIL || 'demo@example.com').toLowerCase();
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD || 'demo-password-123';

// Assertions stick to roles, text and state (not colors or class names) so a
// visual redesign does not break them.
function loginForm(page: import('@playwright/test').Page) {
  const form = page.locator('form');
  return {
    email: form.locator('input[type="email"]'),
    password: form.locator('input[autocomplete="current-password"]'),
    submit: form.getByRole('button', { name: 'Iniciar sesion' }),
  };
}

test.describe('Auth page login', () => {
  test('logs in with the seeded demo user and restores the session after reload', async ({
    page,
  }) => {
    await page.goto('/auth');
    const form = loginForm(page);
    await form.email.fill(DEMO_EMAIL);
    await form.password.fill(DEMO_PASSWORD);
    await form.submit.click();

    const nav = page.locator('nav');
    await expect(nav.getByText(DEMO_EMAIL)).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Log out' })).toBeVisible();

    await page.reload();

    await expect(nav.getByText(DEMO_EMAIL)).toBeVisible();
  });

  test('shows invalid credentials without authenticating', async ({ page }) => {
    await page.goto('/auth');
    const form = loginForm(page);
    await form.email.fill(DEMO_EMAIL);
    await form.password.fill('wrong-password');
    await form.submit.click();

    await expect(page.getByText('Credenciales invalidas')).toBeVisible();
    await expect(page.locator('nav')).toHaveCount(0);
    await expect(form.email).toHaveValue(DEMO_EMAIL);
  });

  test('renders a usable login form', async ({ page }) => {
    await page.goto('/auth');
    const form = loginForm(page);

    await expect(form.email).toBeVisible();
    await expect(form.email).toBeEnabled();
    await expect(form.password).toBeVisible();
    await expect(form.password).toBeEnabled();
    await expect(form.password).toHaveAttribute('type', 'password');
    await expect(form.submit).toBeVisible();
    await expect(form.submit).toBeEnabled();
  });

  test('clears an invalid stored token and sends the visitor to the login page', async ({
    page,
  }) => {
    await page.goto('/auth');
    await page.evaluate(() => {
      window.localStorage.setItem('accessToken', 'invalid-token');
    });
    await page.goto('/');

    await expect(page).toHaveURL(/\/auth$/);
    await expect(loginForm(page).submit).toBeVisible();
    await expect(page.locator('nav')).toHaveCount(0);
  });
});

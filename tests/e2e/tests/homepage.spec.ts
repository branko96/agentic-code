import { APIRequestContext, expect, test } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function registerUser(request: APIRequestContext, email: string) {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email,
      password: 'password123',
    },
  });

  expect(response.ok()).toBeTruthy();
}

test.describe('Homepage login', () => {
  test('logs in and restores session after reload', async ({ page, request }) => {
    const email = `ada.${Date.now()}@example.com`;
    await registerUser(request, email);

    await page.goto('/');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back, Ada' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back, Ada' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('shows invalid credentials without authenticating', async ({ page, request }) => {
    const email = `grace.${Date.now()}@example.com`;
    await registerUser(request, email);

    await page.goto('/');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Welcome back, Ada' })).toHaveCount(0);
  });

  test('renders an elegant and readable login form', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const submitButton = page.getByRole('button', { name: 'Log in' });
    const main = page.locator('main');
    const card = page.locator('section').first();

    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByText('Sign in with your existing backend account.')).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    await expect(main).toHaveCSS('color', 'rgb(241, 245, 249)');
    await expect(card).toHaveCSS('backdrop-filter', /blur\(.+\)/);
    await expect(emailInput).toHaveCSS('background-color', 'rgb(248, 250, 252)');
    await expect(emailInput).toHaveCSS('color', 'rgb(2, 6, 23)');
    await expect(passwordInput).toHaveCSS('background-color', 'rgb(248, 250, 252)');
    await expect(passwordInput).toHaveCSS('color', 'rgb(2, 6, 23)');
    await expect(submitButton).toHaveCSS('background-color', 'rgb(34, 211, 238)');
    await expect(submitButton).toHaveCSS('color', 'rgb(2, 6, 23)');

    await emailInput.fill('grace@example.com');
    await passwordInput.fill('wrong-password');
    await submitButton.click();

    await expect(page.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(emailInput).toHaveValue('grace@example.com');
  });

  test('redirects protected routes back home when no valid token exists', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();

    await page.evaluate(() => {
      window.localStorage.setItem('accessToken', 'invalid-token');
    });
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });
});

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

    await expect(page.getByRole('heading', { name: 'You are logged in' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    await page.reload();

    await expect(page.getByRole('heading', { name: 'You are logged in' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'You are logged in' })).toHaveCount(0);
  });

  test('clears an invalid stored token on reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('accessToken', 'invalid-token');
    });
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    await expect(page.getByText('You are logged in')).toHaveCount(0);
  });
});

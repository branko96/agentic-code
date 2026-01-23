import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Next.js \+ NestJS Boilerplate/);

    const heading = page.getByRole('heading', { name: /Next.js \+ NestJS Boilerplate/i });
    await expect(heading).toBeVisible();

    const description = page.getByText(/Full-stack monorepo with AI agents/i);
    await expect(description).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Frontend')).toBeVisible();
    await expect(page.getByText('Backend')).toBeVisible();
    await expect(page.getByText('Testing')).toBeVisible();
    await expect(page.getByText('AI Agents')).toBeVisible();
  });
});

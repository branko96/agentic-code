import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: `PORT=${new URL(process.env.API_URL || 'http://localhost:3001').port || '3001'} pnpm dev:backend`,
      url: process.env.API_URL || 'http://localhost:3001/auth/me',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        FRONTEND_URL: baseURL,
      },
    },
    {
      command: `pnpm --filter frontend dev --port ${new URL(baseURL).port || '3000'}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        FRONTEND_URL: baseURL,
        NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3001',
      },
    },
  ],
});

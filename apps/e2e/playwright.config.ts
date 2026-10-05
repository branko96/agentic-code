import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const apiURL = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

// Set by an autonomous runner (bin/e2e.sh): it starts the stack itself and
// expects evidence under <repo>/screenshots/<E2E_RUN_ID>/.
const runId = process.env.E2E_RUN_ID;
const runnerManaged = !!runId;

const localOnlyProjects = [
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
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    // `list` prints one line per test and the final "N passed" summary on stdout.
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  // With a run id, everything Playwright writes per test (screenshots, traces)
  // goes to <repo>/screenshots/<run id>/.
  ...(runId ? { outputDir: `../../screenshots/${runId}` } : {}),
  use: {
    baseURL,
    // El trace ya incluye screenshots y DOM de cada paso; sin video para no
    // inflar los artifacts de CI (cuentan contra el storage de Actions).
    trace: 'retain-on-first-failure',
    // A run with an id keeps evidence of passing tests too.
    screenshot: runId ? 'on' : 'only-on-failure',
    video: 'off',
  },

  // En CI (o en un run con E2E_RUN_ID) solo chromium: cada browser extra
  // multiplica minutos y artifacts. Localmente siguen disponibles todos.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.env.CI || runId ? [] : localOnlyProjects),
  ],

  // A runner-managed run already has the stack up; do not start another one.
  webServer: runnerManaged
    ? undefined
    : [
        {
          command: `PORT=${new URL(apiURL).port || '3001'} pnpm dev:backend`,
          url: `${apiURL}/auth/me`,
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
            NEXT_PUBLIC_API_URL: apiURL,
          },
        },
      ],
});

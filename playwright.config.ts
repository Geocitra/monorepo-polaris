import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['apps/**/e2e/**/*.spec.ts'],
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web-portal-desktop',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: ['apps/web-portal/e2e/**/*.spec.ts'],
    },
    {
      name: 'web-portal-mobile',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: ['apps/web-portal/e2e/public-concierge.spec.ts'],
    },
    {
      name: 'web-dashboard',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: ['apps/web-dashboard/e2e/**/*.spec.ts'],
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @polaris/api-core dev',
      url: 'http://localhost:4000/api/v1/commissions',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'pnpm --filter @polaris/web-portal dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'pnpm --filter @polaris/web-dashboard dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});

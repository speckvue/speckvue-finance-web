import { defineConfig, devices } from '@playwright/test';
import loadEnv from './scripts/load-env.ts';

const env = loadEnv();

const baseURL = env.NEXT_PUBLIC_APP_URL;

export default defineConfig({
  globalSetup: './scripts/prepare-standalone.ts',
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: { baseURL: baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: {
    command: 'node .next/standalone/server.js',
    url: baseURL,
    reuseExistingServer: false,
    env: { PORT: String(env.APP_PORT), HOSTNAME: env.APP_HOST },
  },
});

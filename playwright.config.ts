import { defineConfig, devices } from '@playwright/test';
import loadEnv from './scripts/load-env.ts';
import prepareStandalone from './scripts/prepare-standalone.ts';

prepareStandalone();

const env = loadEnv();

const baseURL = `http://${env.APP_HOST}:${env.APP_PORT}`;

const protectedURL = `http://${env.APP_HOST}:${env.APP_PROTECTION_PORT}`;

export default defineConfig({
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
  webServer: [
    {
      command: 'node .next/standalone/server.js',
      url: baseURL,
      reuseExistingServer: false,
      env: {
        ENABLE_DEMO_MODE: 'true',
        PORT: String(env.APP_PORT),
        HOSTNAME: env.APP_HOST,
      },
    },
    {
      command: 'node .next/standalone/server.js',
      url: protectedURL + '/sign-in',
      reuseExistingServer: false,
      env: {
        ENABLE_DEMO_MODE: 'false',
        PORT: String(env.APP_PROTECTION_PORT),
        HOSTNAME: env.APP_HOST,
      },
    },
  ],
});

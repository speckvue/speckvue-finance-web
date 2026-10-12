/**
 * @fileoverview Configures the unit test environment, setup, and source aliases.
 *
 * Runs isolated TypeScript and component tests with centralized environment settings.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { defineConfig } from 'vitest/config';

import loadEnv from './scripts/load-env.ts';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const env = loadEnv();

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import react from '@vitejs/plugin-react';

import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    clearMocks: true,
    env: {
      NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
    },
  },
});

// ---------------------------------------------------------------------------

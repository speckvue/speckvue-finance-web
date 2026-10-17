import { defineConfig } from 'vitest/config';
import loadEnv from './scripts/load-env.ts';

const env = loadEnv();

import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    testTimeout: 15000,
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

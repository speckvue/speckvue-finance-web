/**
 * @fileoverview Initializes DOM assertions, request mocks, and per-test cleanup.
 *
 * Isolates component tests and rejects unhandled mock requests.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';

import { afterEach, beforeAll, afterAll } from 'vitest';

import server from '@/test/mocks/server';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());

// ---------------------------------------------------------------------------

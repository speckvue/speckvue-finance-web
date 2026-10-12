/**
 * @fileoverview Tests validation of browser-visible environment configuration.
 *
 * Checks that malformed public URLs are rejected.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { expect, it } from 'vitest';

import { publicEnvSchema } from './public-env';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

it('fails on missing or non-HTTP public configuration', () => {
  expect(publicEnvSchema.safeParse({}).success).toBe(false);
  expect(
    publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_NAME: 'Finance',
      NEXT_PUBLIC_APP_URL: 'javascript:alert(1)',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
    }).success,
  ).toBe(false);
});

// ---------------------------------------------------------------------------

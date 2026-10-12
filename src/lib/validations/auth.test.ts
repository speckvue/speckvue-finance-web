/**
 * @fileoverview Tests account email and password validation rules.
 *
 * Verifies accepted input and rejection of invalid credentials.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { expect, it } from 'vitest';

import signUpSchema from '@/lib/validations/auth';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

it('rejects malformed emails and weak registration passwords', () => {
  expect(
    signUpSchema.safeParse({ email: 'invalid', password: 'short' }).success,
  ).toBe(false);
  expect(
    signUpSchema.safeParse({
      email: 'person@example.com',
      password: 'a-long-unique-password',
    }).success,
  ).toBe(true);
});

// ---------------------------------------------------------------------------

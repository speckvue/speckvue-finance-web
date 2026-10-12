/**
 * @fileoverview Tests allowed local redirects and rejection of unsafe destinations.
 *
 * Protects navigation against open redirect regressions.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { expect, it } from 'vitest';

import safeRedirect from '@/lib/security/safe-redirect';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

it.each([
  'https://evil.example',
  '//evil.example',
  '/\\evil.example',
  '/%5cevil.example',
  '/%0aevil.example',
  '/%zz',
  null,
])('rejects unsafe redirect %s', (value) => {
  expect(safeRedirect(value)).toBe('/dashboard');
});

it('preserves local paths and search parameters', () => {
  expect(safeRedirect('/dashboard?view=monthly')).toBe(
    '/dashboard?view=monthly',
  );
});

// ---------------------------------------------------------------------------

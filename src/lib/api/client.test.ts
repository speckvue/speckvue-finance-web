/**
 * @fileoverview Tests API response validation, request handling, and failure mapping.
 *
 * Verifies the client contract with isolated fetch fixtures.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { afterEach, expect, it, vi } from 'vitest';

import { z } from 'zod';

import apiRequest from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

afterEach(() => vi.unstubAllGlobals());

it('validates responses and includes cookie credentials without caching', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ count: 3 }), { status: 200 }),
    );
  vi.stubGlobal('fetch', fetchMock);
  await expect(
    apiRequest('/contract-fixture', {
      schema: z.object({ count: z.number() }),
    }),
  ).resolves.toEqual({ count: 3 });
  expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
    credentials: 'include',
    cache: 'no-store',
  });
});

it('rejects malformed successful responses', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
  await expect(
    apiRequest('/contract-fixture', {
      schema: z.object({ count: z.number() }),
    }),
  ).rejects.toMatchObject({ code: 'contract' });
});

it('normalizes unauthorized errors without reflecting server text', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response('private internal details', { status: 401 }),
      ),
  );
  await expect(
    apiRequest('/contract-fixture', { schema: z.unknown() }),
  ).rejects.toMatchObject({
    status: 401,
    message: 'Please sign in to continue.',
  });
});

it('rejects requests that escape the configured origin', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  await expect(
    apiRequest('//evil.example', { schema: z.unknown() }),
  ).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
});

// ---------------------------------------------------------------------------

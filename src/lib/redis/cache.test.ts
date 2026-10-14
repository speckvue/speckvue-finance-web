// @vitest-environment node
import { beforeEach, expect, test, vi } from 'vitest';
import { z } from 'zod';
import cachedPublicData from './cache';
vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), load: vi.fn() }));
vi.mock('./client', () => ({
  default: async () => ({ get: mocks.get, set: mocks.set }),
}));
vi.mock('../logging/logger', () => ({ default: () => ({ warn: vi.fn() }) }));
const schema = z.object({ status: z.literal('ok') });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.set.mockResolvedValue('OK');
});
test('uses validated cached public values without calling the origin', async () => {
  mocks.get.mockResolvedValue(JSON.stringify({ status: 'ok' }));
  expect(await cachedPublicData('status', schema, mocks.load)).toEqual({
    status: 'ok',
  });
  expect(mocks.load).not.toHaveBeenCalled();
});
test('loads and stores a value with expiration on a cache miss', async () => {
  mocks.get.mockResolvedValue(null);
  mocks.load.mockResolvedValue({ status: 'ok' });
  await cachedPublicData('status', schema, mocks.load);
  expect(mocks.set).toHaveBeenCalledWith(
    expect.stringContaining(':public:status'),
    '{"status":"ok"}',
    { EX: 5 },
  );
});
test('rejects malformed cache data and still serves the origin when Redis fails', async () => {
  mocks.get.mockResolvedValue('{bad');
  mocks.set.mockRejectedValue(new Error('Redis unavailable'));
  mocks.load.mockResolvedValue({ status: 'ok' });
  expect(await cachedPublicData('status', schema, mocks.load)).toEqual({
    status: 'ok',
  });
});

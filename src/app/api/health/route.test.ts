// @vitest-environment node
import { beforeEach, expect, test, vi } from 'vitest';
import { GET } from './route';
vi.mock('server-only', () => ({}));
const ping = vi.hoisted(() => vi.fn());
vi.mock('@/lib/redis/client', () => ({ default: async () => ({ ping }) }));
vi.mock('@/lib/logging/logger', () => ({ default: () => ({ warn: vi.fn() }) }));
beforeEach(() => vi.clearAllMocks());
test('reports readiness without caching when Redis is available', async () => {
  ping.mockResolvedValue('PONG');
  const response = await GET();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok' });
  expect(response.headers.get('Cache-Control')).toBe('no-store');
});
test('fails readiness safely without revealing connection details', async () => {
  ping.mockRejectedValue(new Error('sensitive connection information'));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ status: 'unavailable' });
});

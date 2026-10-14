import 'server-only';
import type { z } from 'zod';
import infrastructureEnv from '../config/infrastructure-env';
import getLogger from '../logging/logger';
import getRedis from './client';

/** Cache public, non-sensitive data only; schema validation protects cache reads. */
export default async function cachedPublicData<T>(
  key: string,
  schema: z.ZodType<T>,
  load: () => Promise<T>,
): Promise<T> {
  const env = infrastructureEnv();
  const cacheKey = env.REDIS_KEY_PREFIX + ':public:' + key;
  try {
    const raw = await (await getRedis()).get(cacheKey);
    if (raw !== null) {
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    }
  } catch {
    getLogger().warn('Public cache read unavailable', {
      event: 'cache_read_failed',
    });
  }
  const value = schema.parse(await load());
  try {
    await (
      await getRedis()
    ).set(cacheKey, JSON.stringify(value), { EX: env.REDIS_CACHE_TTL_SECONDS });
  } catch {
    getLogger().warn('Public cache write unavailable', {
      event: 'cache_write_failed',
    });
  }
  return value;
}

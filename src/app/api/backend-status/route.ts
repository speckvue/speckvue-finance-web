import infrastructureEnv from '@/lib/config/infrastructure-env';
import cachedPublicData from '@/lib/redis/cache';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const statusSchema = z.object({ status: z.literal('ok') });

export async function GET() {
  try {
    const status = await cachedPublicData(
      'backend-status',
      statusSchema,
      async () => {
        const env = infrastructureEnv();
        const response = await fetch(
          new URL('/api/v1/health/ready', env.API_INTERNAL_URL),
          {
            cache: 'no-store',
            signal: AbortSignal.timeout(env.REDIS_COMMAND_TIMEOUT_MS),
          },
        );
        if (!response.ok) throw new Error('Backend unavailable');
        return statusSchema.parse(await response.json());
      },
    );
    return Response.json(status, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json(
      { status: 'unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

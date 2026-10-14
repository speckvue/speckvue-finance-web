import getLogger from '@/lib/logging/logger';
import getRedis from '@/lib/redis/client';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if ((await (await getRedis()).ping()) !== 'PONG')
      throw new Error('Redis unavailable');
    return Response.json(
      { status: 'ok' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    getLogger().warn('Web readiness failed', { event: 'readiness_failed' });
    return Response.json(
      { status: 'unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

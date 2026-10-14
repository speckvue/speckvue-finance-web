import { createClient } from 'redis';
import 'server-only';
import infrastructureEnv from '../config/infrastructure-env';
import getLogger from '../logging/logger';

const state = globalThis as typeof globalThis & {
  speckvueRedis?: ReturnType<typeof createClient>;
  speckvueRedisConnecting?: Promise<void>;
};

export default async function getRedis() {
  const env = infrastructureEnv();
  if (!state.speckvueRedis) {
    state.speckvueRedis = createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
        ...(env.REDIS_TLS
          ? { tls: true as const, rejectUnauthorized: true }
          : {}),
        reconnectStrategy: (retries) =>
          retries > 3
            ? new Error('Redis reconnect limit reached')
            : Math.min(100 * 2 ** retries, 1000),
      },
      password: env.REDIS_PASSWORD,
      database: env.REDIS_DATABASE,
      disableOfflineQueue: true,
    });
    state.speckvueRedis.on('error', () =>
      getLogger().error('Redis connection unavailable', {
        event: 'redis_error',
      }),
    );
  }
  const client = state.speckvueRedis;
  if (!client.isOpen) {
    state.speckvueRedisConnecting ??= client
      .connect()
      .then(() => {
        getLogger().info('Redis connected', { event: 'redis_connected' });
      })
      .finally(() => {
        state.speckvueRedisConnecting = undefined;
      });
    await state.speckvueRedisConnecting;
  } else if (state.speckvueRedisConnecting) await state.speckvueRedisConnecting;
  return client.withAbortSignal(
    AbortSignal.timeout(env.REDIS_COMMAND_TIMEOUT_MS),
  );
}

import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { z } from 'zod';

const port = z.coerce.number().int().min(1).max(65535);

const duration = z.string().regex(/^\d+(ms|s|m|h)$/);

const environmentSchema = z.object({
  DOCKER_LOG_DIRECTORY: z.string().regex(/^\/app\/[a-zA-Z0-9_/-]+$/),
  DOCKER_HTTP_PROXY: z.string().default(''),
  DOCKER_HTTPS_PROXY: z.string().default(''),
  DOCKER_NO_PROXY: z.string().default(''),
  LOG_LEVEL: z.enum([
    'error',
    'warn',
    'info',
    'http',
    'verbose',
    'debug',
    'silly',
    'silent',
  ]),
  LOG_DIRECTORY: z.string().min(1),
  LOG_FILE_ENABLED: z.enum(['true', 'false']),
  LOG_MAX_SIZE: z.string().regex(/^[1-9][0-9]*[kmg]$/i),
  LOG_MAX_FILES: z.string().regex(/^[1-9][0-9]*d$/),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: port,
  REDIS_PASSWORD: z
    .string()
    .min(16)
    .refine((value) => !value.includes('replace_')),
  REDIS_DATABASE: z.coerce.number().int().min(0).max(15),
  REDIS_KEY_PREFIX: z.string().min(1),
  REDIS_TLS: z.enum(['true', 'false']),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive(),
  REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive(),
  REDIS_CACHE_TTL_SECONDS: z.coerce.number().int().positive(),
  API_INTERNAL_URL: z.url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_API_URL: z.url(),
  APP_PORT: port,
  APP_HOST: z.string().regex(/^[a-zA-Z0-9.:-]+$/),
  API_PORT: port,
  APP_PROTECTION_PORT: port,
  ENABLE_DEMO_MODE: z.enum(['true', 'false']),
  DEV_NODE_ENV: z.literal('development'),
  PROD_NODE_ENV: z.literal('production'),
  NODE_IMAGE: z.string().min(1),
  DOCKER_IMAGE: z.string().min(1),
  DOCKER_HOSTNAME: z.string().min(1),
  DOCKER_BIND_HOST: z.string().regex(/^[a-zA-Z0-9.:-]+$/),
  DOCKER_UID: z.coerce.number().int().positive(),
  DOCKER_GID: z.coerce.number().int().positive(),
  DOCKER_HEALTH_INTERVAL: duration,
  DOCKER_HEALTH_TIMEOUT: duration,
  DOCKER_HEALTH_START_PERIOD: duration,
  DOCKER_DEV_HEALTH_START_PERIOD: duration,
  DOCKER_HEALTH_RETRIES: z.coerce.number().int().positive(),
  HEALTHCHECK_HOST: z.string().min(1),
  HEALTHCHECK_TIMEOUT_MS: z.coerce.number().int().positive(),
  DOCKER_POLLING: z.enum(['true', 'false']),
  DOCKER_HUSKY: z.enum(['0', '1']),
  NEXT_TELEMETRY_DISABLED: z.enum(['0', '1']),
  DOCKER_RESTART_POLICY: z.enum([
    'no',
    'always',
    'unless-stopped',
    'on-failure',
  ]),
  DOCKER_TMP_SIZE: z.string().regex(/^\d+[kmg]$/),
  DOCKER_NEXT_CACHE_SIZE: z.string().regex(/^\d+[kmg]$/),
});

const loadEnv = () => {
  const result = config({ path: '.env', quiet: true });
  if (result.error)
    throw new Error(
      'Missing .env. Copy .env.example to .env before running this project.',
    );
  expand(result);
  return environmentSchema.parse(process.env);
};

export default loadEnv;

import 'server-only';
import { z } from 'zod';

const schema = z.object({
  LOG_LEVEL: z
    .enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
      'silent',
    ])
    .default('info'),
  LOG_DIRECTORY: z.string().min(1).default('logs'),
  LOG_FILE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  LOG_MAX_SIZE: z
    .string()
    .regex(/^[1-9][0-9]*[kmg]$/i)
    .default('20m'),
  LOG_MAX_FILES: z
    .string()
    .regex(/^[1-9][0-9]*d$/)
    .default('14d'),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535),
  REDIS_PASSWORD: z
    .string()
    .min(16)
    .refine((value) => !value.includes('replace_')),
  REDIS_DATABASE: z.coerce.number().int().min(0).max(15),
  REDIS_KEY_PREFIX: z.string().regex(/^[a-z][a-z0-9:_-]*$/),
  REDIS_TLS: z.enum(['true', 'false']).transform((value) => value === 'true'),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().max(30000),
  REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive().max(30000),
  REDIS_CACHE_TTL_SECONDS: z.coerce.number().int().positive().max(300),
  API_INTERNAL_URL: z.url(),
});

/** Runtime-only validation: build workers need no Redis credentials. */
export default function infrastructureEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success)
    throw new Error(
      'Invalid server infrastructure configuration: ' +
        result.error.issues.map((issue) => issue.path.join('.')).join(', '),
    );
  return result.data;
}

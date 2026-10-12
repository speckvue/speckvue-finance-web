/**
 * @fileoverview Loads, expands, and validates centralized .env configuration.
 *
 * Shares typed ports, hosts, and runtime settings between native and Docker commands.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { config } from 'dotenv';

import { expand } from 'dotenv-expand';

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const port = z.coerce.number().int().min(1).max(65535);

const duration = z.string().regex(/^\d+(ms|s|m|h)$/);

const environmentSchema = z.object({
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

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const loadEnv = () => {
  const result = config({ path: '.env', quiet: true });
  if (result.error)
    throw new Error(
      'Missing .env. Copy .env.example to .env before running this project.',
    );
  expand(result);
  return environmentSchema.parse(process.env);
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default loadEnv;

// ---------------------------------------------------------------------------

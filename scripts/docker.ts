/**
 * @fileoverview Runs Docker build, Compose, readiness, and smoke-check commands from .env.
 *
 * Keeps container execution aligned with the central project configuration.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';

import { setTimeout } from 'node:timers/promises';

import loadEnv from './load-env';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const docker = async ({ command }: { command: string }) => {
  const env = loadEnv();
  const buildVariables = [
    'NODE_IMAGE',
    'APP_PORT',
    'DOCKER_HOSTNAME',
    'DOCKER_UID',
    'DOCKER_GID',
    'DEV_NODE_ENV',
    'PROD_NODE_ENV',
    'DOCKER_HUSKY',
    'NEXT_TELEMETRY_DISABLED',
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
    'HEALTHCHECK_HOST',
    'HEALTHCHECK_TIMEOUT_MS',
  ] as const;
  let args: string[];
  switch (command) {
    case 'build':
      args = ['build', '--target', 'production', '-t', env.DOCKER_IMAGE];
      for (const key of buildVariables)
        args.push('--build-arg', `${key}=${env[key]}`);
      args.push('.');
      break;
    case 'run':
      args = [
        'run',
        '--rm',
        '--init',
        '-p',
        `${env.DOCKER_BIND_HOST}:${env.APP_PORT}:${env.APP_PORT}`,
        '--env',
        `ENABLE_DEMO_MODE=${env.ENABLE_DEMO_MODE}`,
        '--health-interval',
        env.DOCKER_HEALTH_INTERVAL,
        '--health-timeout',
        env.DOCKER_HEALTH_TIMEOUT,
        '--health-start-period',
        env.DOCKER_HEALTH_START_PERIOD,
        '--health-retries',
        String(env.DOCKER_HEALTH_RETRIES),
        env.DOCKER_IMAGE,
      ];
      break;
    case 'up':
      args = ['compose', '--env-file', '.env', 'up', '--build'];
      break;
    case 'prod':
      args = [
        'compose',
        '--env-file',
        '.env',
        '-f',
        'docker-compose.prod.yml',
        'up',
        '--build',
        '-d',
      ];
      break;
    case 'down':
      args = ['compose', '--env-file', '.env', 'down'];
      break;
    case 'config':
      {
        const production = spawnSync(
          'docker',
          [
            'compose',
            '--env-file',
            '.env',
            '-f',
            'docker-compose.prod.yml',
            'config',
            '--quiet',
          ],
          { stdio: 'inherit', shell: false },
        );
        if (production.status !== 0) {
          process.exitCode = production.status ?? 1;
          return;
        }
      }
      args = ['compose', '--env-file', '.env', 'config', '--quiet'];
      break;
    case 'smoke': {
      const started = spawnSync(
        'docker',
        [
          'run',
          '-d',
          '--init',
          '-p',
          `${env.DOCKER_BIND_HOST}:${env.APP_PORT}:${env.APP_PORT}`,
          env.DOCKER_IMAGE,
        ],
        { encoding: 'utf8', shell: false },
      );
      if (started.status !== 0)
        throw new Error(started.stderr || 'Container could not start.');
      const id = started.stdout.trim();
      try {
        const user = spawnSync(
          'docker',
          ['inspect', '--format', '{{.Config.User}}', id],
          { encoding: 'utf8', shell: false },
        );
        if (user.stdout.trim() !== `${env.DOCKER_UID}:${env.DOCKER_GID}`)
          throw new Error(
            'Production container must run as the configured non-root user.',
          );
        for (
          let attempt = 0;
          attempt < env.DOCKER_HEALTH_RETRIES * 10;
          attempt++
        ) {
          try {
            const response = await fetch(
              `http://${env.DOCKER_BIND_HOST}:${env.APP_PORT}/api/health`,
              { signal: AbortSignal.timeout(env.HEALTHCHECK_TIMEOUT_MS) },
            );
            if (response.ok) {
              process.stdout.write(
                'Container readiness and non-root checks passed.\n',
              );
              return;
            }
          } catch {
            /* Wait for readiness. */
          }
          await setTimeout(1000);
        }
        throw new Error('Container did not become ready.');
      } finally {
        spawnSync('docker', ['logs', id], { stdio: 'inherit', shell: false });
        spawnSync('docker', ['rm', '-f', id], {
          stdio: 'inherit',
          shell: false,
        });
      }
    }
    default:
      throw new Error('Choose build, run, up, prod, down, config or smoke.');
  }
  const result = spawnSync('docker', args, { stdio: 'inherit', shell: false });
  process.exitCode = result.status ?? 1;
};

await docker({ command: process.argv[2] ?? '' });

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default docker;

// ---------------------------------------------------------------------------

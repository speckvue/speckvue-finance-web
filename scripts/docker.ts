import { spawnSync } from 'node:child_process';
import loadEnv from './load-env';

const docker = async ({ command }: { command: string }) => {
  const env = loadEnv();
  const buildVariables = [
    'NODE_IMAGE',
    'DOCKER_LOG_DIRECTORY',
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
      args.push(
        '--build-arg',
        'HTTP_PROXY=' + env.DOCKER_HTTP_PROXY,
        '--build-arg',
        'HTTPS_PROXY=' + env.DOCKER_HTTPS_PROXY,
        '--build-arg',
        'NO_PROXY=' + env.DOCKER_NO_PROXY,
      );
      args.push('.');
      break;
    case 'run':
      args = [
        'compose',
        '--env-file',
        '.env',
        '-f',
        'docker-compose.prod.yml',
        'up',
        '--no-build',
      ];
      break;
    case 'up':
      args = ['compose', '--env-file', '.env', 'up', '-d', '--build', '--wait'];
      break;
    case 'watch':
      args = ['compose', '--env-file', '.env', 'up', '--build', '--watch'];
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
      const compose = [
        'compose',
        '--env-file',
        '.env',
        '-f',
        'docker-compose.prod.yml',
      ];
      try {
        for (const step of [
          ['up', '-d', '--no-build', '--wait'],
          ['exec', '-T', 'web', 'node', 'scripts/healthcheck.ts'],
        ]) {
          const check = spawnSync('docker', [...compose, ...step], {
            stdio: 'inherit',
            shell: false,
          });
          if (check.status !== 0)
            throw new Error('Production Compose smoke check failed.');
        }
        process.stdout.write('Production Compose readiness passed.\n');
      } finally {
        spawnSync('docker', [...compose, 'down'], {
          stdio: 'inherit',
          shell: false,
        });
      }
      return;
    }
    default:
      throw new Error(
        'Choose build, run, up, watch, prod, down, config or smoke.',
      );
  }
  const result = spawnSync('docker', args, { stdio: 'inherit', shell: false });
  process.exitCode = result.status ?? 1;
};

await docker({ command: process.argv[2] ?? '' });

export default docker;

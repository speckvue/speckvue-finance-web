/**
 * @fileoverview Launches Next.js development, build, or production commands from .env.
 *
 * Applies configured hosts, ports, and runtime modes before Next.js starts.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { createRequire } from 'node:module';

import { spawn } from 'node:child_process';

import loadEnv from './load-env';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const runApp = ({ mode }: { mode: string }) => {
  if (!['dev', 'build', 'start'].includes(mode))
    throw new Error('Choose dev, build or start.');
  const env = loadEnv();
  const args = [require.resolve('next/dist/bin/next'), mode];
  if (mode !== 'build')
    args.push('--hostname', env.APP_HOST, '--port', String(env.APP_PORT));
  args.push(...process.argv.slice(3));
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      NODE_ENV: mode === 'dev' ? env.DEV_NODE_ENV : env.PROD_NODE_ENV,
      PORT: String(env.APP_PORT),
    },
  });
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  child.on('error', () => {
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    process.exitCode = code ?? 1;
  });
};

runApp({ mode: process.argv[2] ?? '' });

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default runApp;

// ---------------------------------------------------------------------------

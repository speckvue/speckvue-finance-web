/**
 * @fileoverview Loads project configuration and invokes semantic-release with CLI arguments.
 *
 * Provides a consistent entry point for release automation and dry runs.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';

import { createRequire } from 'node:module';

import { dirname, join } from 'node:path';

import loadEnv from './load-env';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const release = () => {
  loadEnv();
  const entry = join(
    dirname(require.resolve('semantic-release')),
    'bin/semantic-release.js',
  );
  const result = spawnSync(
    process.execPath,
    [entry, ...process.argv.slice(2)],
    { stdio: 'inherit', shell: false },
  );
  process.exitCode = result.status ?? 1;
};

release();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default release;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Probes the configured readiness endpoint using the native Node HTTP client.
 *
 * Supplies a lightweight container health check without extra runtime dependencies.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

// Read host, port and timeout from the injected central configuration.

const healthcheck = async () => {
  try {
    const response = await fetch(
      `http://${process.env.HEALTHCHECK_HOST}:${process.env.PORT}/api/health`,
      {
        signal: AbortSignal.timeout(Number(process.env.HEALTHCHECK_TIMEOUT_MS)),
      },
    );
    process.exitCode = response.status === 200 ? 0 : 1;
  } catch {
    process.exitCode = 1;
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  await healthcheck();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default healthcheck;

// ---------------------------------------------------------------------------

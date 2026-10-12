/**
 * @fileoverview Validates and parses the server-only demo mode setting.
 *
 * Keeps the demo access flag out of browser configuration.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import 'server-only';

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const serverEnv = z
  .object({
    ENABLE_DEMO_MODE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .parse({ ENABLE_DEMO_MODE: process.env.ENABLE_DEMO_MODE });

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default serverEnv;

// ---------------------------------------------------------------------------

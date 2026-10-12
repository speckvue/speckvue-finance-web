/**
 * @fileoverview Validates the application name and browser-visible application and API URLs.
 *
 * Provides a typed public configuration contract for browser and server consumers.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1),
  NEXT_PUBLIC_APP_URL: z
    .url()
    .refine(
      (value) => /^https?:\/\//.test(value),
      'Use an HTTP(S) application URL',
    ),
  NEXT_PUBLIC_API_URL: z
    .url()
    .refine((value) => /^https?:\/\//.test(value), 'Use an HTTP(S) API URL'),
});

const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default publicEnv;

// ---------------------------------------------------------------------------

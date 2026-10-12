/**
 * @fileoverview Copies static and public assets into the Next.js standalone output.
 *
 * Prepares the production server bundle for local browser verification.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { cpSync, existsSync } from 'node:fs';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const prepareStandalone = () => {
  if (!existsSync('.next/standalone/server.js'))
    throw new Error('Run npm run build before standalone verification.');
  cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  if (existsSync('public'))
    cpSync('public', '.next/standalone/public', { recursive: true });
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default prepareStandalone;

// ---------------------------------------------------------------------------

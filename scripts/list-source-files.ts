/**
 * @fileoverview Recursively enumerates TypeScript and JavaScript module files.
 *
 * Supplies the first-party file inventory used by source style checks.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { readdirSync } from 'node:fs';

import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const listSourceFiles = ({ directory }: { directory: string }): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listSourceFiles({ directory: join(directory, entry.name) })
      : /\.(tsx?|mjs)$/.test(entry.name)
        ? [join(directory, entry.name)]
        : [],
  );

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default listSourceFiles;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Collects installed production package license and notice files.
 *
 * Generates third-party attribution text for the application distribution.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

import { join } from 'node:path';

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const metadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  license: z.union([z.string(), z.object({ type: z.string() })]).optional(),
});

const lockSchema = z.object({
  packages: z.record(z.string(), z.object({ dev: z.boolean().optional() })),
});

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const collectLicenses = () => {
  const lock = lockSchema.parse(
    JSON.parse(readFileSync('package-lock.json', 'utf8')),
  );
  const sections: string[] = [
    'Third-party runtime dependency license texts\n\nGenerated from installed production dependencies; Speckvue first-party licensing is in LICENSE. Vendored AlignUI, Google Sans, and Poppins notices are also preserved in THIRD_PARTY_NOTICES.md.\n',
  ];
  let count = 0;
  for (const [directory, entry] of Object.entries(lock.packages)) {
    if (!directory || entry.dev || !existsSync(join(directory, 'package.json')))
      continue;
    const result = metadataSchema.safeParse(
      JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')),
    );
    if (!result.success) continue;
    const metadata = result.data;
    const files = readdirSync(directory, { withFileTypes: true }).filter(
      (file) =>
        file.isFile() &&
        /^(licen[sc]e|copying|notice)(\..*)?$/i.test(file.name),
    );
    const license =
      typeof metadata.license === 'string'
        ? metadata.license
        : (metadata.license?.type ?? 'Unspecified in package metadata');
    sections.push(
      `\n${'='.repeat(72)}\n${metadata.name}@${metadata.version}\nDeclared license: ${license}\n`,
    );
    for (const file of files)
      sections.push(
        `\n--- ${file.name} ---\n${readFileSync(join(directory, file.name), 'utf8')}\n`,
      );
    if (!files.length)
      sections.push(
        '\nNo root license text file supplied by this package; consult its original distribution and source notices.\n',
      );
    count++;
  }
  writeFileSync(
    'THIRD_PARTY_LICENSES.txt',
    sections
      .join('\n')
      .replaceAll('\r\n', '\n')
      .replace(/[\t ]+$/gm, '')
      .trimEnd() + '\n',
  );
  process.stdout.write(
    `Collected license metadata/notices for ${count} installed runtime packages.\n`,
  );
};

collectLicenses();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default collectLicenses;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Checks first-party documentation headers and source section layout.
 *
 * Detects missing purpose descriptions, incorrect divider spacing, and empty sections.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';

import ts from 'typescript';

import listSourceFiles from './list-source-files';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const checkSourceStyle = () => {
  const files = [
    ...listSourceFiles({ directory: 'src' }),
    ...listSourceFiles({ directory: 'scripts' }),
    ...listSourceFiles({ directory: 'e2e' }),
    'next.config.ts',
    'vitest.config.ts',
    'playwright.config.ts',
    'eslint.config.mjs',
    'postcss.config.mjs',
    'commitlint.config.mjs',
  ];
  const failures: string[] = [];
  for (const file of files) {
    const normalized = file.replaceAll('\\', '/');
    if (
      /src\/(components\/ui|utils)\//.test(normalized) ||
      file.endsWith('use-tab-observer.tsx')
    )
      continue;
    const source = readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
    const header = source.match(/^\/\*\*[\s\S]*?\*\//)?.[0] ?? '';
    if (
      !source.startsWith('/**\n * @fileoverview') ||
      !header.includes('@author Speckvue contributors') ||
      !header.includes('@license LicenseRef-Speckvue-Proprietary')
    )
      failures.push(`${file}: missing file documentation or attribution`);
    if (!/\* @fileoverview [^\n]+\n \*\n \* [^@\n]+\n/.test(header))
      failures.push(`${file}: describe the file's behavior and purpose`);
    if (
      /Guide:|One arrow function per file|Always export default|Prefer pure functions|Strict TypeScript/.test(
        header,
      ) ||
      /module for Speckvue Finance|configures Speckvue Finance/.test(header)
    )
      failures.push(
        `${file}: replace generic writing instructions with file documentation`,
      );
    const sections = [
      ...source.matchAll(
        /\/\/ -{20,}\n\/\/ ([^\n]+)\n\/\/ -{20,}\n([\s\S]*?)(?=\/\/ -{20,}|$)/g,
      ),
    ];
    for (const section of sections) {
      const body = section[2] ?? '';
      if (!body.startsWith('\n') || !body.endsWith('\n\n'))
        failures.push(
          `${file}: section ${section[1]} needs blank lines after/before dividers`,
        );
      const syntax = ts.createSourceFile(
        file,
        body,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      if (!syntax.statements.length)
        failures.push(`${file}: empty section ${section[1]}`);
    }
    const syntax = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    if (syntax.statements.some(ts.isFunctionDeclaration))
      failures.push(`${file}: use top-level arrow functions`);
  }
  if (failures.length) throw new Error(failures.join('\n'));
  process.stdout.write(
    'First-party purpose headers, arrow functions, section spacing, and nonempty sections passed.\n',
  );
};

checkSourceStyle();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default checkSourceStyle;

// ---------------------------------------------------------------------------

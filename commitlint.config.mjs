/**
 * @fileoverview Configures Conventional Commit message validation.
 *
 * Keeps commit history compatible with automated release analysis.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const commitlint = { extends: ['@commitlint/config-conventional'] };

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default commitlint;

// ---------------------------------------------------------------------------

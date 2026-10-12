/**
 * @fileoverview Defines stable query keys for demo data.
 *
 * Keeps cache lookup and invalidation consistent between dashboard consumers.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const queryKeys = {
  demo: {
    all: ['demo'] as const,
    transactions: () => ['demo', 'transactions'] as const,
  },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default queryKeys;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Reads sample transactions through TanStack Query.
 *
 * Exposes cached dashboard data and query status to components.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import demoTransactionsOptions from '../data/demo-query-options';

import { useQuery } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const useDemoTransactions = () => {
  return useQuery(demoTransactionsOptions);
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default useDemoTransactions;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Defines query options that validate and return sample transactions.
 *
 * Shares the demo query contract between query consumers.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { queryOptions } from '@tanstack/react-query';

import queryKeys from '@/lib/query/keys';

import { transactionSchema } from '@/features/dashboard/data/transactions';

import mockTransactions from '@/features/dashboard/data/transactions';

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const demoTransactionsOptions = queryOptions({
  queryKey: queryKeys.demo.transactions(),
  queryFn: async ({ signal }) => {
    signal.throwIfAborted();
    return z.array(transactionSchema).parse(mockTransactions);
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default demoTransactionsOptions;

// ---------------------------------------------------------------------------

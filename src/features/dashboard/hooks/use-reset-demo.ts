/**
 * @fileoverview Provides the action for resetting the demo transaction query.
 *
 * Lets dashboard recovery controls reload the sample data.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { useMutation, useQueryClient } from '@tanstack/react-query';

import queryKeys from '@/lib/query/keys';

import mockTransactions from '@/features/dashboard/data/transactions';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const useResetDemo = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      client.setQueryData(queryKeys.demo.transactions(), mockTransactions);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.demo.all }),
  });
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default useResetDemo;

// ---------------------------------------------------------------------------

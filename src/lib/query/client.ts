/**
 * @fileoverview Creates a QueryClient with cache lifetimes and selective retry behavior.
 *
 * Centralizes query defaults while avoiding retries for permanent API failures.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { QueryClient } from '@tanstack/react-query';

import ApiError from '@/lib/api/api-error';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000,
        gcTime: 5 * 60000,
        refetchOnWindowFocus: false,
        retry: (count, error) =>
          count < 2 &&
          (!(error instanceof ApiError) ||
            error.code === 'network' ||
            error.code === 'timeout' ||
            error.status >= 500),
      },
      mutations: { retry: false },
    },
  });
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default createQueryClient;

// ---------------------------------------------------------------------------

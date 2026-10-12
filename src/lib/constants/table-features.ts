/**
 * @fileoverview Assembles TanStack Table features and row models.
 *
 * Shares the sorting, filtering, pagination, visibility, and selection configuration.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
  tableFeatures,
  rowSortingFeature,
  globalFilteringFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFns,
  sortFns,
} from '@tanstack/react-table';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  globalFilteringFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default dataTableFeatures;

// ---------------------------------------------------------------------------

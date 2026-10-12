/**
 * @fileoverview Defines transaction columns and connects them to the shared data table.
 *
 * Presents sample transaction amounts, dates, and statuses consistently.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { ColumnDef } from '@tanstack/react-table';

import dataTableFeatures from '@/lib/constants/table-features';

import * as Badge from '@/components/ui/badge';

import DataTable from '@/components/shared/data-table';

import Feedback from '@/components/shared/feedback';

import useDemoTransactions from '@/features/dashboard/hooks/use-demo-transactions';

import type { Transaction } from '@/features/dashboard/data/transactions';

import formatMoney from '@/lib/utils/money';

import formatDate from '@/lib/utils/date';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const columns: ColumnDef<typeof dataTableFeatures, Transaction>[] = [
  {
    accessorKey: 'merchant',
    header: 'Transaction',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.merchant}</span>
    ),
    enableHiding: false,
  },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-text-sub-600">
        {formatDate(row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge.Root
        variant="lighter"
        color={row.original.status === 'Completed' ? 'green' : 'orange'}
        className={
          row.original.status === 'Completed'
            ? 'text-green-800 dark:text-green-300'
            : 'text-orange-800 dark:text-orange-300'
        }
      >
        {row.original.status}
      </Badge.Root>
    ),
  },
  {
    accessorKey: 'amountMinor',
    header: 'Amount',
    cell: ({ row }) => (
      <span
        className={`font-medium whitespace-nowrap tabular-nums ${row.original.amountMinor > 0 ? 'text-green-800 dark:text-green-300' : ''}`}
      >
        {row.original.amountMinor > 0 ? '+' : ''}
        {formatMoney({
          minorUnits: BigInt(row.original.amountMinor),
          currency: row.original.currency,
        })}
      </span>
    ),
  },
];

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const TransactionTable = () => {
  const query = useDemoTransactions();
  if (query.isError)
    return (
      <Feedback
        title="Could not load transactions"
        description="Please retry loading the sample data."
        action="Try again"
        onAction={() => void query.refetch()}
      />
    );
  return (
    <DataTable
      data={query.data ?? []}
      columns={columns}
      getRowId={(row) => row.id}
      caption="Sample financial transactions"
      loading={query.isPending}
    />
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default TransactionTable;

// ---------------------------------------------------------------------------

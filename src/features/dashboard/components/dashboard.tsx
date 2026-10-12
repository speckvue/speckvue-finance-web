/**
 * @fileoverview Renders sample finance metrics, charts, and transaction browsing.
 *
 * Demonstrates the dashboard experience before live financial data is connected.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import DemoNotice from '@/components/shared/demo-notice';

import TransactionTable from '@/features/dashboard/components/transaction-table';

import formatMoney from '@/lib/utils/money';

import parseMoney from '@/lib/utils/parse-money';

import {
  RiWallet3Line,
  RiArrowLeftDownLine,
  RiArrowRightUpLine,
  RiBankLine,
} from '@remixicon/react';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const summaries = [
  {
    label: 'Total balance',
    amount: '12480.50',
    detail: 'Across sample accounts',
    icon: RiWallet3Line,
  },
  {
    label: 'Income',
    amount: '6050.00',
    detail: 'This month · sample',
    icon: RiArrowLeftDownLine,
  },
  {
    label: 'Expenses',
    amount: '2480.25',
    detail: 'This month · sample',
    icon: RiArrowRightUpLine,
  },
  {
    label: 'Net cash flow',
    amount: '3569.75',
    detail: 'Income less expenses',
    icon: RiBankLine,
  },
];

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Dashboard = () => {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-widest text-text-sub-600 uppercase">
            Your money, at a glance
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Financial overview
          </h1>
          <p className="mt-2 text-sm text-text-sub-600">
            A little clarity goes a long way.
          </p>
        </div>
        <span className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs text-text-sub-600">
          October 2026 · Sample period
        </span>
      </div>
      <DemoNotice />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <section
            key={item.label}
            className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-regular-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-text-sub-600">{item.label}</h2>
              <item.icon
                className="size-5 text-text-sub-600"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight tabular-nums">
              {formatMoney(parseMoney(item.amount, 'USD'))}
            </p>
            <p className="mt-2 text-xs text-text-sub-600">{item.detail}</p>
          </section>
        ))}
      </div>
      <section className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Recent transactions</h2>
          <p className="mt-1 text-sm text-text-sub-600">
            Explore sorting, search, columns, and selection with sample data.
          </p>
        </div>
        <TransactionTable />
      </section>
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
        <h2 className="font-medium">
          Built for a more organized financial life
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-sub-600">
          This preview establishes your workspace. Account connections, real
          transactions, budgets, and savings goals will arrive with the secure
          API integration.
        </p>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Dashboard;

// ---------------------------------------------------------------------------

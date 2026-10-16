import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import TransactionForm from './components/transaction-form';
import TransactionsWorkspace from './components/transactions-workspace';
import {
  moneyUnits,
  validateTransaction,
  type Transaction,
  type TransactionInput,
} from './contracts';

const mocks = vi.hoisted(() => ({
  authenticated: vi.fn(),
  request: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('@/features/auth/client', () => ({ default: mocks.authenticated }));
vi.mock('@/lib/api/client', () => ({ default: mocks.request }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));
const accountId = '6998b6de-5871-48d0-9911-14ade667b1a5';
const transaction: Transaction = {
  id: 'f5b659d5-2da3-4863-8455-728d3ca5b184',
  accountId,
  accountName: 'Bank',
  accountArchived: false,
  currency: 'USD',
  payeeId: null,
  payeeName: null,
  kind: 'expense',
  amount: '10.1000',
  date: '2026-01-01',
  notes: 'Saved note',
  revision: 1,
  deletedAt: null,
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
  splits: [{ categoryId: null, categoryName: null, amount: '10.1000' }],
};
const accounts = {
  items: [
    {
      id: accountId,
      name: 'Bank',
      type: 'bank' as const,
      currency: 'USD',
      institution: null,
      notes: null,
      openingBalance: '100.0000',
      openingBalanceDate: '2020-01-01',
      archivedAt: null,
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    },
  ],
  nextCursor: null,
};
const options = {
  currencies: ['USD'],
  currencyDigits: { USD: 2 },
  today: '2026-01-02',
};
const value: TransactionInput = {
  accountId,
  kind: 'expense',
  amount: '10.10',
  date: '2026-01-01',
  notes: '',
  payeeId: null,
  splits: [{ categoryId: null, amount: '10.10' }],
};
const workspace = () =>
  render(
    <TransactionsWorkspace
      initial={{ items: [transaction], nextCursor: null }}
      accounts={accounts}
      options={options}
      payees={{ items: [], nextCursor: null }}
      categories={[]}
      locale="en-US"
    />,
  );
beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

test('money and split validation stay exact at large values and fractional boundaries', () => {
  expect(moneyUnits('999999999999999.99')).toBe(9999999999999999900n);
  expect(moneyUnits('1e2')).toBeNull();
  expect(moneyUnits('-1')).toBeNull();
  expect(
    validateTransaction(
      {
        ...value,
        amount: '0.30',
        splits: [
          { categoryId: null, amount: '0.10' },
          { categoryId: transaction.id, amount: '0.20' },
        ],
      },
      2,
      '2020-01-01',
      options.today,
    ),
  ).toBe('');
  expect(
    validateTransaction(
      { ...value, amount: '0' },
      2,
      '2020-01-01',
      options.today,
    ),
  ).toMatch(/positive/);
  expect(
    validateTransaction(
      { ...value, amount: '1.001' },
      2,
      '2020-01-01',
      options.today,
    ),
  ).toMatch(/2 decimal/);
  expect(
    validateTransaction(
      { ...value, date: '2026-02-30' },
      2,
      '2020-01-01',
      options.today,
    ),
  ).toMatch(/date/);
  expect(
    validateTransaction(
      { ...value, splits: [{ categoryId: null, amount: '9' }] },
      2,
      '2020-01-01',
      options.today,
    ),
  ).toMatch(/equal/);
});
test('form disables every control while saving and shows circular progress', () => {
  render(
    <TransactionForm
      initial={transaction}
      accounts={accounts}
      payees={{ items: [], nextCursor: null }}
      categories={[]}
      options={options}
      busy
      onLoading={vi.fn()}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
  for (const control of screen.getAllByRole('combobox'))
    expect(control).toBeDisabled();
  expect(screen.getByLabelText('Notes (optional)')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(
    screen
      .getByRole('button', { name: 'Saving…' })
      .querySelector('.animate-spin'),
  ).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
});
test('split editor blocks mismatched allocations before sending', async () => {
  const save = vi.fn();
  render(
    <TransactionForm
      initial={transaction}
      accounts={accounts}
      payees={{ items: [], nextCursor: null }}
      categories={[]}
      options={options}
      busy={false}
      onLoading={vi.fn()}
      onSave={save}
      onCancel={vi.fn()}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Split amount' }));
  await userEvent.type(screen.getByLabelText('Amount 2'), '1');
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(/duplicate|equal/);
});
test('edit forms send only writable posting fields, never response metadata', async () => {
  const save = vi.fn();
  render(
    <TransactionForm
      initial={transaction}
      accounts={accounts}
      payees={{ items: [], nextCursor: null }}
      categories={[]}
      options={options}
      busy={false}
      onLoading={vi.fn()}
      onSave={save}
      onCancel={vi.fn()}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(Object.keys(save.mock.calls[0]![0]).sort()).toEqual([
    'accountId',
    'amount',
    'date',
    'kind',
    'notes',
    'payeeId',
    'splits',
  ]);
});
test('uncertain create retry keeps its idempotency key and disabled form prevents duplicate submissions', async () => {
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'Add transaction' }),
  );
  const dialog = screen.getByRole('dialog', { name: 'Add transaction' });
  await userEvent.selectOptions(
    within(dialog).getByLabelText('Account'),
    accountId,
  );
  await userEvent.type(within(dialog).getByLabelText('Amount · USD'), '1.10');
  mocks.authenticated
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(transaction);
  mocks.request.mockResolvedValue({ items: [transaction], nextCursor: null });
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add transaction' }),
  );
  await waitFor(() => expect(within(dialog).getByRole('alert')).toBeVisible());
  const first = mocks.authenticated.mock.calls[0]![1].body;
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add transaction' }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(mocks.authenticated.mock.calls[1]![1].body.requestId).toBe(
    first.requestId,
  );
  expect(first.requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(mocks.refresh).toHaveBeenCalled();
});
test('confirmed save and failed refresh closes the form without offering an unsafe resubmit', async () => {
  mocks.authenticated.mockResolvedValue(transaction);
  mocks.request.mockRejectedValue(new Error('offline'));
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit transaction' }),
  );
  const dialog = screen.getByRole('dialog', { name: 'Edit transaction' });
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Save changes' }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole('heading', { name: 'Reload to view updated results' }),
  ).toBeVisible();
  expect(mocks.authenticated).toHaveBeenCalledTimes(1);
  expect(mocks.authenticated.mock.calls[0]![1].body.revision).toBe(1);
});
test('deletion requires confirmation and sends the expected revision', async () => {
  mocks.authenticated.mockResolvedValue({
    ...transaction,
    deletedAt: transaction.updatedAt,
    revision: 2,
  });
  mocks.request.mockResolvedValue({ items: [], nextCursor: null });
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'Delete transaction' }),
  );
  expect(mocks.authenticated).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm deletion' }),
  );
  await waitFor(() => expect(mocks.authenticated).toHaveBeenCalled());
  expect(mocks.authenticated.mock.calls[0]![1]).toMatchObject({
    method: 'DELETE',
    body: { revision: 1 },
  });
});
test('history displays previous snapshots and paginates older changes', async () => {
  mocks.request
    .mockResolvedValueOnce({
      items: [
        {
          revision: 2,
          action: 'updated',
          createdAt: transaction.updatedAt,
          snapshot: { ...transaction, notes: 'New note' },
        },
      ],
      nextRevision: 2,
    })
    .mockResolvedValueOnce({
      items: [
        {
          revision: 1,
          action: 'created',
          createdAt: transaction.createdAt,
          snapshot: transaction,
        },
      ],
      nextRevision: null,
    });
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'View transaction history' }),
  );
  const dialog = await screen.findByRole('dialog', {
    name: 'Transaction history',
  });
  expect(within(dialog).getByText('New note')).toBeVisible();
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Load older changes' }),
  );
  await waitFor(() =>
    expect(within(dialog).getByText('Saved note')).toBeVisible(),
  );
  expect(mocks.request.mock.calls[1]![0]).toContain('?before=2');
});

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import TransferForm from './components/transfer-form';
import TransfersWorkspace from './components/transfers-workspace';
import { rateFromAmounts, receivedFromRate, type Transfer } from './contracts';

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
const sourceId = 'b86aa1ed-0c0d-45d0-863e-40df199cfd9c',
  destinationId = 'c018f919-3db1-47e7-8601-c806cd457f92',
  euroId = '8a735927-801d-4c40-971b-f6ca4daed2a7';
const stamp = '2026-01-01T12:00:00.000Z';
const accounts = {
  items: [
    { id: sourceId, name: 'Bank', currency: 'USD' },
    { id: destinationId, name: 'Wallet', currency: 'USD' },
    { id: euroId, name: 'Euro', currency: 'EUR' },
  ].map((a) => ({
    ...a,
    type: 'bank' as const,
    institution: null,
    notes: null,
    openingBalance: '100.0000',
    openingBalanceDate: '2020-01-01',
    archivedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  })),
  nextCursor: null,
};
const options = {
  currencies: ['USD', 'EUR'],
  currencyDigits: { USD: 2, EUR: 2 },
  today: '2026-01-02',
};
const transfer: Transfer = {
  id: '33b83a2e-4ce9-45d0-be29-43153608af7e',
  sourceAccountId: sourceId,
  sourceAccountName: 'Bank',
  sourceCurrency: 'USD',
  destinationAccountId: destinationId,
  destinationAccountName: 'Wallet',
  destinationCurrency: 'USD',
  sentAmount: '10.1000',
  receivedAmount: '10.1000',
  exchangeRate: '1.' + '0'.repeat(30),
  feeAmount: '0.0000',
  feeAccountId: null,
  feeAccountName: null,
  feeCurrency: null,
  feeCategoryId: null,
  feeCategoryName: null,
  date: '2026-01-01',
  notes: 'Saved transfer note',
  revision: 1,
  accountsArchived: false,
  deletedAt: null,
  createdAt: stamp,
  updatedAt: stamp,
  movements: [
    {
      accountId: sourceId,
      accountName: 'Bank',
      currency: 'USD',
      role: 'outgoing',
      classification: 'transfer',
      amount: '-10.1000',
    },
    {
      accountId: destinationId,
      accountName: 'Wallet',
      currency: 'USD',
      role: 'incoming',
      classification: 'transfer',
      amount: '10.1000',
    },
  ],
};
const workspace = () =>
  render(
    <TransfersWorkspace
      initial={{ items: [transfer], nextCursor: null }}
      accounts={accounts}
      categories={[]}
      options={options}
      locale="en-US"
    />,
  );
const form = (props: Partial<React.ComponentProps<typeof TransferForm>> = {}) =>
  render(
    <TransferForm
      initial={transfer}
      accounts={accounts}
      categories={[]}
      options={options}
      locale="en-US"
      busy={false}
      onLoading={vi.fn()}
      onSave={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );
beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
});

test.each([0, 1, 2])(
  'Add transfer opens the dialog with %i active accounts',
  async (count) => {
    render(
      <TransfersWorkspace
        initial={{ items: [], nextCursor: null }}
        accounts={{ items: accounts.items.slice(0, count), nextCursor: null }}
        categories={[]}
        options={options}
        locale="en-US"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add transfer' }));
    const dialog = screen.getByRole('dialog', { name: 'Add transfer' });
    expect(within(dialog).getByLabelText('From account')).toBeVisible();
    const submit = within(dialog).getByRole('button', { name: 'Add transfer' });
    if (count < 2) {
      expect(submit).toBeDisabled();
      expect(
        within(dialog).getByRole('link', { name: 'Add or restore an account' }),
      ).toHaveAttribute('href', '/accounts');
      expect(submit).toHaveAccessibleDescription(/two active accounts/);
    } else {
      expect(submit).toBeEnabled();
    }
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Add transfer' })).toHaveFocus();
    expect(mocks.authenticated).not.toHaveBeenCalled();
  },
);

test('effective rates and received values use exact integer arithmetic and half-up currency rounding', () => {
  expect(rateFromAmounts('10', '9')).toBe('0.9');
  expect(rateFromAmounts('999999999999999.99', '0.001')).toBe(
    '0.000000000000000001',
  );
  expect(rateFromAmounts('0', '1')).toBe('');
  expect(receivedFromRate('1', '0.005', 2)).toBe('0.01');
  expect(receivedFromRate('1', '0.004', 2)).toBeNull();
  expect(receivedFromRate('10', '1.2345', 3)).toBe('12.345');
  expect(receivedFromRate('10', '1.25', 0)).toBe('13');
  expect(receivedFromRate('1', '1e2', 2)).toBeNull();
  expect(receivedFromRate('999999999999999.99', '2', 2)).toBeNull();
});
test('same-currency entry copies principal amounts and fixes the rate at one', async () => {
  form();
  expect(screen.getByLabelText('Amount received · USD')).toHaveAttribute(
    'readonly',
  );
  expect(screen.getByLabelText('Exchange rate · 1 USD in USD')).toHaveValue(
    '1',
  );
  await userEvent.clear(screen.getByLabelText('Amount sent · USD'));
  await userEvent.type(screen.getByLabelText('Amount sent · USD'), '12.25');
  expect(screen.getByLabelText('Amount received · USD')).toHaveValue('12.25');
});
test('FX entry accepts actual received amounts or an explicit rate and calculates the other exactly', async () => {
  form();
  await userEvent.selectOptions(screen.getByLabelText('To account'), euroId);
  await userEvent.type(screen.getByLabelText('Amount received · EUR'), '9.09');
  expect(screen.getByLabelText('Exchange rate · 1 USD in EUR')).toHaveValue(
    '0.9',
  );
  await userEvent.clear(screen.getByLabelText('Exchange rate · 1 USD in EUR'));
  await userEvent.type(
    screen.getByLabelText('Exchange rate · 1 USD in EUR'),
    '1.25',
  );
  expect(screen.getByLabelText('Amount received · EUR')).toHaveValue('12.63');
});
test('a destination fee preview reduces its receipt and fee selections clear when fee becomes zero', async () => {
  const save = vi.fn();
  form({ onSave: save });
  await userEvent.clear(screen.getByLabelText('Transfer fee'));
  await userEvent.type(screen.getByLabelText('Transfer fee'), '1.10');
  await userEvent.selectOptions(
    screen.getByLabelText('Fee charged to'),
    destinationId,
  );
  expect(screen.getByLabelText('Transfer preview')).toHaveTextContent(
    /Destination credited: USD\s9.00/,
  );
  await userEvent.clear(screen.getByLabelText('Transfer fee'));
  await userEvent.type(screen.getByLabelText('Transfer fee'), '0');
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(save.mock.calls[0]![0]).toMatchObject({
    feeAmount: '0',
    feeAccountId: null,
    feeCategoryId: null,
  });
});
test('entering actual amounts in either order preserves the received amount', async () => {
  form({ initial: null });
  await userEvent.selectOptions(
    screen.getByLabelText('From account'),
    sourceId,
  );
  await userEvent.selectOptions(screen.getByLabelText('To account'), euroId);
  await userEvent.type(screen.getByLabelText('Amount received · EUR'), '8');
  await userEvent.type(screen.getByLabelText('Amount sent · USD'), '10');
  expect(screen.getByLabelText('Amount received · EUR')).toHaveValue('8');
  expect(screen.getByLabelText('Exchange rate · 1 USD in EUR')).toHaveValue(
    '0.8',
  );
});
test('an invalid or unrepresentable rate clears the receipt instead of saving stale amounts', async () => {
  const save = vi.fn();
  form({
    initial: {
      ...transfer,
      destinationAccountId: euroId,
      destinationAccountName: 'Euro',
      destinationCurrency: 'EUR',
      receivedAmount: '9.0900',
      exchangeRate: '0.9' + '0'.repeat(29),
    },
    onSave: save,
  });
  await userEvent.clear(screen.getByLabelText('Exchange rate · 1 USD in EUR'));
  await userEvent.type(
    screen.getByLabelText('Exchange rate · 1 USD in EUR'),
    '1e2',
  );
  expect(screen.getByLabelText('Amount received · EUR')).toHaveValue('');
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(/positive amounts/);
});
test('all form items and dismissal buttons disable while submitting and spinner is visible', () => {
  form({ busy: true });
  for (const field of screen.getAllByRole('combobox'))
    expect(field).toBeDisabled();
  expect(screen.getByLabelText('Notes (optional)')).toBeDisabled();
  const save = screen.getByRole('button', { name: 'Saving…' });
  expect(save).toBeDisabled();
  expect(save.querySelector('.animate-spin')).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
});
test('blocks a self-transfer and sends only writable fields when editing', async () => {
  const save = vi.fn();
  form({ onSave: save });
  await userEvent.selectOptions(screen.getByLabelText('To account'), sourceId);
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('two different');
  await userEvent.selectOptions(
    screen.getByLabelText('To account'),
    destinationId,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(Object.keys(save.mock.calls[0]![0]).sort()).toEqual([
    'date',
    'destinationAccountId',
    'feeAccountId',
    'feeAmount',
    'feeCategoryId',
    'notes',
    'receivedAmount',
    'sentAmount',
    'sourceAccountId',
  ]);
});
test('blocks a date preceding an involved opening date', async () => {
  const save = vi.fn();
  form({ onSave: save });
  await userEvent.clear(screen.getByLabelText('Date'));
  await userEvent.type(screen.getByLabelText('Date'), '2019-01-01');
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent(/date/);
});
test('request keys persist after uncertain create retries', async () => {
  workspace();
  await userEvent.click(screen.getByRole('button', { name: 'Add transfer' }));
  const dialog = screen.getByRole('dialog', { name: 'Add transfer' });
  await userEvent.selectOptions(
    within(dialog).getByLabelText('From account'),
    sourceId,
  );
  await userEvent.selectOptions(
    within(dialog).getByLabelText('To account'),
    destinationId,
  );
  await userEvent.type(within(dialog).getByLabelText('Amount sent · USD'), '5');
  mocks.authenticated
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(transfer);
  mocks.request.mockResolvedValue({ items: [transfer], nextCursor: null });
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add transfer' }),
  );
  await waitFor(() => expect(within(dialog).getByRole('alert')).toBeVisible());
  const first = mocks.authenticated.mock.calls[0]![1].body.requestId;
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add transfer' }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(mocks.authenticated.mock.calls[1]![1].body.requestId).toBe(first);
  expect(mocks.refresh).toHaveBeenCalled();
});
test('confirmed mutation plus failed reload never offers another financial submission', async () => {
  mocks.authenticated.mockResolvedValue(transfer);
  mocks.request.mockRejectedValue(new Error('offline'));
  workspace();
  await userEvent.click(screen.getByRole('button', { name: 'Edit transfer' }));
  await userEvent.click(
    screen
      .getByRole('dialog', { name: 'Edit transfer' })
      .querySelector('button[type="submit"]')!,
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
test('deletion is a single confirmed aggregate request using the expected revision', async () => {
  mocks.authenticated.mockResolvedValue({
    ...transfer,
    deletedAt: stamp,
    revision: 2,
  });
  mocks.request.mockResolvedValue({ items: [], nextCursor: null });
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'Delete transfer' }),
  );
  expect(mocks.authenticated).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm deletion' }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(mocks.authenticated.mock.calls[0]![0]).toBe(
    '/transfers/' + transfer.id,
  );
  expect(mocks.authenticated.mock.calls[0]![1]).toMatchObject({
    method: 'DELETE',
    body: { revision: 1 },
  });
});
test('history retains both account links and paginates older snapshots', async () => {
  mocks.request
    .mockResolvedValueOnce({
      items: [
        {
          revision: 2,
          action: 'updated',
          createdAt: stamp,
          snapshot: { ...transfer, notes: 'New transfer note' },
        },
      ],
      nextRevision: 2,
    })
    .mockResolvedValueOnce({
      items: [
        {
          revision: 1,
          action: 'created',
          createdAt: stamp,
          snapshot: transfer,
        },
      ],
      nextRevision: null,
    });
  workspace();
  await userEvent.click(
    screen.getByRole('button', { name: 'View transfer history' }),
  );
  const dialog = await screen.findByRole('dialog', {
    name: 'Transfer history',
  });
  expect(within(dialog).getByText('New transfer note')).toBeVisible();
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Load older changes' }),
  );
  await waitFor(() =>
    expect(within(dialog).getByText('Saved transfer note')).toBeVisible(),
  );
  expect(mocks.request.mock.calls[1]![0]).toContain('?before=2');
});

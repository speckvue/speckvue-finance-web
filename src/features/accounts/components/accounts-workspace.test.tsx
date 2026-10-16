import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Account } from '../contracts';
import AccountsWorkspace from './accounts-workspace';

const authenticated = vi.hoisted(() => vi.fn());
const api = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/client', () => ({ default: authenticated }));
vi.mock('@/lib/api/client', () => ({ default: api }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
beforeEach(() => vi.clearAllMocks());
const account: Account = {
  id: 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Everyday bank',
  type: 'bank',
  currency: 'USD',
  institution: null,
  notes: null,
  openingBalance: '100.0000',
  openingBalanceDate: '2026-01-01',
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const props = {
  initial: { items: [], nextCursor: null },
  currency: 'USD',
  currencies: ['USD', 'JPY', 'KWD'],
  locale: 'en-US',
  today: '2026-01-01',
};

test('saving locks all financial account controls, shows a spinner, and recovers without losing input', async () => {
  let rejectRequest!: (reason: Error) => void;
  authenticated.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  );
  render(<AccountsWorkspace {...props} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add account' }));
  expect(screen.getByRole('dialog', { name: 'Add an account' })).toBeVisible();
  await userEvent.type(screen.getByLabelText('Account name'), account.name);
  await userEvent.click(screen.getByRole('button', { name: 'Add account' }));
  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByLabelText('Account name')).toBeDisabled();
  expect(screen.getByLabelText('Currency')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'Close account form' }),
  ).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeVisible();
  await act(async () => rejectRequest(new Error('offline')));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to complete this request.',
  );
  expect(screen.getByLabelText('Account name')).toHaveValue(account.name);
  expect(screen.getByLabelText('Account name')).toBeEnabled();
  authenticated.mockResolvedValueOnce(account);
  await userEvent.click(screen.getByRole('button', { name: 'Add account' }));
  expect(
    await screen.findByRole('heading', { name: account.name }),
  ).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Account added.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('archiving requires confirmation and archived accounts can be restored', async () => {
  const archived = { ...account, archivedAt: '2026-10-16T00:00:00.000Z' };
  authenticated.mockResolvedValueOnce(archived).mockResolvedValueOnce(account);
  api.mockResolvedValueOnce({ items: [archived], nextCursor: null });
  render(
    <AccountsWorkspace
      {...props}
      initial={{ items: [account], nextCursor: null }}
    />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: /Archive.*Everyday bank/ }),
  );
  expect(authenticated).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Archive account' }),
  );
  await waitFor(() =>
    expect(authenticated).toHaveBeenCalledWith(
      '/accounts/' + account.id + '/archive',
      expect.objectContaining({ method: 'POST', body: {} }),
    ),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Archived' }));
  expect(api).toHaveBeenCalledWith(
    '/accounts?status=archived',
    expect.anything(),
  );
  await userEvent.click(
    await screen.findByRole('button', { name: /Restore.*Everyday bank/ }),
  );
  expect(authenticated).toHaveBeenLastCalledWith(
    '/accounts/' + account.id + '/restore',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'No archived accounts' }),
  ).toBeVisible();
});

test('editing preserves optional details and locks the account currency', async () => {
  render(
    <AccountsWorkspace
      {...props}
      initial={{
        items: [{ ...account, institution: 'Saved bank', notes: 'Saved note' }],
        nextCursor: null,
      }}
    />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: /Edit.*Everyday bank/ }),
  );
  expect(screen.getByRole('dialog', { name: 'Edit account' })).toBeVisible();
  expect(screen.getByLabelText('Currency')).toBeDisabled();
  expect(screen.getByLabelText('Institution (optional)')).toHaveValue(
    'Saved bank',
  );
  expect(screen.getByLabelText('Notes (optional)')).toHaveValue('Saved note');
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(
    screen.getByRole('button', { name: /Edit.*Everyday bank/ }),
  ).toHaveFocus();
});

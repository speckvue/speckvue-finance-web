import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import type { Account } from '../contracts';
import AccountDetails from './account-details';

const authenticated = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/client', () => ({ default: authenticated }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
const account: Account = {
  id: 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Card',
  type: 'credit_card',
  currency: 'USD',
  institution: 'Bank',
  notes: 'Personal card',
  openingBalance: '-25.5000',
  openingBalanceDate: '2026-01-01',
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
test('details archive only after confirmation, remain readable and restore before editing', async () => {
  authenticated
    .mockResolvedValueOnce({
      ...account,
      archivedAt: '2026-01-02T00:00:00.000Z',
    })
    .mockResolvedValueOnce(account);
  render(
    <AccountDetails
      initial={account}
      locale="en-US"
      options={{
        currencies: ['USD'],
        currencyDigits: { USD: 2 },
        today: '2026-01-02',
      }}
    />,
  );
  expect(screen.getByText('Personal card')).toBeVisible();
  expect(screen.getAllByText(/USD.*25.50/)).toHaveLength(2);
  await userEvent.click(
    screen.getByRole('button', { name: 'Archive account' }),
  );
  expect(authenticated).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm archive' }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Edit account' }),
    ).not.toBeInTheDocument(),
  );
  expect(screen.getByText('Personal card')).toBeVisible();
  await userEvent.click(
    screen.getByRole('button', { name: 'Restore account' }),
  );
  expect(
    await screen.findByRole('button', { name: 'Edit account' }),
  ).toBeEnabled();
  expect(authenticated).toHaveBeenLastCalledWith(
    '/accounts/' + account.id + '/restore',
    expect.objectContaining({ method: 'POST' }),
  );
});

test('opening calendar dates stay unchanged while audit dates follow the saved timezone', () => {
  render(
    <AccountDetails
      initial={account}
      locale="en-US"
      timezone="America/Los_Angeles"
      options={{
        currencies: ['USD'],
        currencyDigits: { USD: 2 },
        today: '2026-01-02',
      }}
    />,
  );
  expect(screen.getByText(/Opening balance.*Jan 1, 2026/)).toBeVisible();
  expect(screen.getByText('Created').nextElementSibling).toHaveTextContent(
    'Dec 31, 2025',
  );
});

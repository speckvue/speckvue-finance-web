import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Payee } from '../contracts';
import PayeesWorkspace from './payees-workspace';

const authenticated = vi.hoisted(() => vi.fn());
const api = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/client', () => ({ default: authenticated }));
vi.mock('@/lib/api/client', () => ({ default: api }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
beforeEach(() => {
  authenticated.mockReset();
  api.mockReset();
});
const target: Payee = {
  id: 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Target',
  kind: 'merchant',
  notes: 'Target notes',
  archivedAt: null,
  mergedIntoId: null,
  mergedIntoName: null,
  mergedAt: null,
  mergedNameCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const source: Payee = {
  ...target,
  id: 'c07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Source',
  notes: 'Source notes',
};

test('saving locks all fields and dismissal, and failed saves retain the draft', async () => {
  let rejectRequest!: (reason: Error) => void;
  authenticated.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  );
  render(<PayeesWorkspace initial={{ items: [], nextCursor: null }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add payee' }));
  const dialog = screen.getByRole('dialog', { name: 'Add a payee' });
  await userEvent.type(within(dialog).getByLabelText('Payee name'), 'Target');
  await userEvent.type(
    within(dialog).getByLabelText('Notes (optional)'),
    'Draft notes',
  );
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add payee' }),
  );
  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  for (const label of ['Payee name', 'Type', 'Notes (optional)'])
    expect(within(dialog).getByLabelText(label)).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(
    within(dialog).getByRole('button', { name: 'Close add a payee' }),
  ).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeVisible();
  await act(async () => rejectRequest(new Error('offline')));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your changes have not been confirmed',
  );
  expect(screen.getByLabelText('Notes (optional)')).toHaveValue('Draft notes');
  authenticated.mockResolvedValueOnce(target);
  api.mockResolvedValueOnce({ items: [target], nextCursor: null });
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add payee' }),
  );
  expect(await screen.findByRole('heading', { name: 'Target' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('a saved write with a failed refresh is not offered as an unsaved form retry', async () => {
  authenticated.mockResolvedValueOnce(target);
  api.mockRejectedValueOnce(new Error('offline'));
  render(<PayeesWorkspace initial={{ items: [], nextCursor: null }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add payee' }));
  await userEvent.type(screen.getByLabelText('Payee name'), 'Target');
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Add payee',
    }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your change was saved',
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', {
      name: 'Reload payees to view updated results',
    }),
  ).toBeVisible();
  api.mockResolvedValueOnce({ items: [target], nextCursor: null });
  await userEvent.click(screen.getByRole('button', { name: 'Reload payees' }));
  expect(await screen.findByRole('heading', { name: 'Target' })).toBeVisible();
  expect(authenticated).toHaveBeenCalledTimes(1);
});

test('search and load-more keep filters and deduplicate returned IDs', async () => {
  api
    .mockResolvedValueOnce({ items: [target], nextCursor: target.id })
    .mockResolvedValueOnce({ items: [target, source], nextCursor: null });
  render(<PayeesWorkspace initial={{ items: [target], nextCursor: null }} />);
  await userEvent.type(screen.getByLabelText('Search payees'), 'A&B');
  await userEvent.click(screen.getByRole('button', { name: 'Search' }));
  expect(api).toHaveBeenCalledWith(
    '/payees?status=active&q=A%26B',
    expect.anything(),
  );
  await userEvent.click(
    await screen.findByRole('button', { name: 'Load more payees' }),
  );
  await waitFor(() =>
    expect(api).toHaveBeenLastCalledWith(
      '/payees?status=active&q=A%26B&after=' + target.id,
      expect.anything(),
    ),
  );
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
});

test('merging requires a selected survivor and acknowledgement, locks the dialog and retains sources as read-only', async () => {
  let finish!: (value: Payee) => void;
  authenticated.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  api
    .mockResolvedValueOnce({ items: [target], nextCursor: null })
    .mockResolvedValueOnce({
      items: [{ ...target, mergedNameCount: 1 }],
      nextCursor: null,
    });
  render(
    <PayeesWorkspace initial={{ items: [source, target], nextCursor: null }} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Merge Source' }));
  const dialog = screen.getByRole('dialog', { name: 'Merge payees' });
  const radio = await within(dialog).findByRole('radio');
  await waitFor(() => expect(radio).toBeEnabled());
  expect(
    within(dialog).getByRole('button', { name: 'Confirm merge' }),
  ).toBeDisabled();
  await userEvent.click(radio);
  expect(
    within(dialog).getByRole('button', { name: 'Confirm merge' }),
  ).toBeDisabled();
  await userEvent.click(
    within(dialog).getByRole('checkbox', {
      name: 'I understand this merge cannot be undone.',
    }),
  );
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Confirm merge' }),
  );
  expect(
    await screen.findByRole('button', { name: 'Merging…' }),
  ).toBeDisabled();
  expect(within(dialog).getByLabelText('Search active payees')).toBeDisabled();
  expect(
    within(dialog).getByRole('button', { name: 'Close merge payees' }),
  ).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  expect(dialog).toBeVisible();
  await act(async () => finish({ ...target, mergedNameCount: 1 }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(authenticated).toHaveBeenCalledWith(
    '/payees/' + source.id + '/merge',
    expect.objectContaining({ method: 'POST', body: { targetId: target.id } }),
  );
  const merged = {
    ...source,
    archivedAt: source.createdAt,
    mergedIntoId: target.id,
    mergedIntoName: target.name,
    mergedAt: source.createdAt,
  };
  api.mockResolvedValueOnce({ items: [merged], nextCursor: null });
  await userEvent.click(screen.getByRole('button', { name: 'Merged' }));
  expect(await screen.findByText('Source notes')).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Restore Source' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Edit Source' }),
  ).not.toBeInTheDocument();
});

test('archive is confirmed and restore keeps the same payee identity', async () => {
  const archived = { ...target, archivedAt: target.createdAt };
  authenticated.mockResolvedValueOnce(archived).mockResolvedValueOnce(target);
  api
    .mockResolvedValueOnce({ items: [], nextCursor: null })
    .mockResolvedValueOnce({ items: [archived], nextCursor: null })
    .mockResolvedValueOnce({ items: [], nextCursor: null });
  render(<PayeesWorkspace initial={{ items: [target], nextCursor: null }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Archive Target' }));
  expect(authenticated).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm archive' }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('heading', { name: 'Target' }),
    ).not.toBeInTheDocument(),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Archived' }));
  await userEvent.click(
    await screen.findByRole('button', { name: 'Restore Target' }),
  );
  await waitFor(() =>
    expect(authenticated).toHaveBeenLastCalledWith(
      '/payees/' + target.id + '/restore',
      expect.objectContaining({ method: 'POST' }),
    ),
  );
});

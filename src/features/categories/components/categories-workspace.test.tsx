import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Category } from '../contracts';
import CategoriesWorkspace from './categories-workspace';

const authenticated = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/client', () => ({ default: authenticated }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
beforeEach(() => authenticated.mockReset());
const food: Category = {
  id: 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Food',
  kind: 'expense',
  parentId: null,
  description: 'Everyday meals',
  icon: 'food',
  color: 'orange',
  position: 0,
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const child: Category = {
  ...food,
  id: 'c07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Groceries',
  parentId: food.id,
  description: null,
};
const travel: Category = {
  ...food,
  id: 'b07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Travel',
  position: 1,
};
const salary: Category = {
  ...food,
  id: 'a07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  name: 'Salary',
  kind: 'income',
};

test('dialog locks every control and dismissal while saving and preserves the draft after failure', async () => {
  let rejectRequest!: (reason: Error) => void;
  authenticated.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
  );
  render(<CategoriesWorkspace initial={{ items: [] }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add category' }));
  const dialog = screen.getByRole('dialog', { name: 'Add a category' });
  await userEvent.type(within(dialog).getByLabelText('Category name'), 'Food');
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add category' }),
  );
  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  for (const label of [
    'Category name',
    'Type',
    'Parent category',
    'Color',
    'Icon',
    'Description (optional)',
  ])
    expect(within(dialog).getByLabelText(label)).toBeDisabled();
  expect(
    within(dialog).getByRole('button', { name: 'Close category form' }),
  ).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  expect(screen.getByRole('dialog')).toBeVisible();
  await act(async () => rejectRequest(new Error('offline')));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your changes have not been confirmed',
  );
  expect(screen.getByLabelText('Category name')).toHaveValue('Food');
  authenticated.mockResolvedValueOnce({ items: [food] });
  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Add category' }),
  );
  expect(await screen.findByRole('heading', { name: 'Food' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('parent archive is confirmed and children must wait for the parent before restoration', async () => {
  const old = '2026-01-02T00:00:00.000Z';
  authenticated
    .mockResolvedValueOnce({
      items: [
        { ...food, archivedAt: old },
        { ...child, archivedAt: old },
      ],
    })
    .mockResolvedValueOnce({ items: [food, { ...child, archivedAt: old }] })
    .mockResolvedValueOnce({ items: [food, child] });
  render(<CategoriesWorkspace initial={{ items: [food, child] }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Archive Food' }));
  expect(authenticated).not.toHaveBeenCalled();
  expect(
    screen.getByText(/Its active subcategories will also be archived/),
  ).toBeVisible();
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm archive' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Archived' }));
  expect(
    screen.getByRole('button', { name: 'Restore Groceries' }),
  ).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Restore Food' }));
  expect(
    await screen.findByRole('button', {
      name: 'Restore Groceries',
    }),
  ).toBeEnabled();
  await userEvent.click(
    screen.getByRole('button', { name: 'Restore Groceries' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'No archived categories' }),
  ).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Active' }));
  expect(screen.getByRole('heading', { name: 'Groceries' })).toBeVisible();
});

test('reorders siblings and locks category type and parent nesting when editing a branch', async () => {
  authenticated.mockResolvedValueOnce({
    items: [
      { ...travel, position: 0 },
      { ...food, position: 1 },
      child,
      salary,
    ],
  });
  render(
    <CategoriesWorkspace initial={{ items: [food, child, travel, salary] }} />,
  );
  expect(screen.getByRole('button', { name: 'Move Food up' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Move Travel up' }));
  await waitFor(() =>
    expect(authenticated).toHaveBeenCalledWith(
      '/categories/' + travel.id + '/move',
      expect.objectContaining({ method: 'POST', body: { direction: 'up' } }),
    ),
  );
  expect(
    screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent),
  ).toEqual(['Travel', 'Food', 'Groceries']);
  await userEvent.click(screen.getByRole('button', { name: 'Edit Food' }));
  expect(screen.getByLabelText('Type')).toBeDisabled();
  expect(screen.getByLabelText('Parent category')).toBeDisabled();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(
    screen.getByRole('button', {
      name: 'Add subcategory to Food',
    }),
  );
  expect(screen.getByLabelText('Parent category')).toHaveValue(food.id);
  expect(
    screen.queryByRole('option', { name: 'Salary' }),
  ).not.toBeInTheDocument();
});

test('creating an income category switches to income so the saved record is visible', async () => {
  authenticated.mockResolvedValueOnce({ items: [salary] });
  render(<CategoriesWorkspace initial={{ items: [] }} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add category' }));
  await userEvent.type(screen.getByLabelText('Category name'), 'Salary');
  await userEvent.selectOptions(screen.getByLabelText('Type'), 'income');
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Add category',
    }),
  );
  expect(await screen.findByRole('heading', { name: 'Salary' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Income' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

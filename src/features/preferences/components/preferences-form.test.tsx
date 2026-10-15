import type { User } from '@/lib/auth/contracts';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import PreferencesForm from './preferences-form';

const request = vi.hoisted(() => vi.fn());
const setTheme = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
vi.mock('@/features/auth/client', () => ({ default: request }));
vi.mock('next-themes', () => ({ useTheme: () => ({ setTheme }) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));
beforeEach(() => vi.clearAllMocks());
const user: User = {
  id: 'd07a6c6d-5ea4-4a1b-9b6b-b9716a4f22b6',
  email: 'person@example.com',
  displayName: 'Alex',
  baseCurrency: 'USD',
  locale: 'en-US',
  timezone: 'UTC',
  theme: 'light',
  weekStartsOn: 1,
  onboardedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

test('settings saves appearance before applying it and locks the whole form while pending', async () => {
  let resolve!: (value: User) => void;
  request.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  render(
    <PreferencesForm
      user={user}
      options={{ currencies: ['USD'], timezones: ['UTC'] }}
    />,
  );
  await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark');
  await userEvent.click(
    screen.getByRole('button', { name: 'Save preferences' }),
  );
  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByLabelText('Your name')).toBeDisabled();
  expect(screen.getByLabelText('Appearance')).toBeDisabled();
  expect(setTheme).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledWith(
    '/users/me/preferences',
    expect.objectContaining({
      method: 'PATCH',
      body: expect.objectContaining({ theme: 'dark' }),
    }),
  );
  await act(async () => resolve({ ...user, theme: 'dark' }));
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Preferences saved.',
  );
  expect(setTheme).toHaveBeenCalledWith('dark');
  expect(replace).toHaveBeenCalledWith('/settings');
});

test('a failed appearance save keeps the selection for retry without applying an unsaved theme', async () => {
  request.mockRejectedValueOnce(new Error('offline'));
  render(
    <PreferencesForm
      user={user}
      options={{ currencies: ['USD'], timezones: ['UTC'] }}
    />,
  );
  await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark');
  await userEvent.click(
    screen.getByRole('button', { name: 'Save preferences' }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not save your preferences.',
  );
  expect(screen.getByLabelText('Appearance')).toHaveValue('dark');
  expect(screen.getByLabelText('Appearance')).toBeEnabled();
  expect(setTheme).not.toHaveBeenCalled();
});

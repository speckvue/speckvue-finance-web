import AuthForm from '@/features/auth/components/auth-form';
import ApiError from '@/lib/api/api-error';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

const api = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api/client', () => ({ default: api }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));
beforeEach(() => vi.clearAllMocks());

test('validates signup before requesting an account', async () => {
  render(<AuthForm mode="signup" />);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(await screen.findByText('Enter a valid email address.')).toBeVisible();
  expect(api).not.toHaveBeenCalled();
});

test('signin uses the real API and redirects only after success', async () => {
  api.mockResolvedValue({ csrfToken: 'token' });
  render(<AuthForm mode="signin" />);
  await userEvent.type(
    screen.getByLabelText('Email address'),
    'person@example.com',
  );
  await userEvent.type(
    screen.getByLabelText('Password', { exact: true }),
    'correct-password',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Signin' }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/workspace'));
  expect(api).toHaveBeenCalledWith(
    '/auth/signin',
    expect.objectContaining({
      method: 'POST',
      body: { email: 'person@example.com', password: 'correct-password' },
    }),
  );
});

test('incorrect credentials show safe feedback without redirecting', async () => {
  api.mockRejectedValue(new ApiError(401, 'unauthorized'));
  render(<AuthForm mode="signin" />);
  await userEvent.type(
    screen.getByLabelText('Email address'),
    'person@example.com',
  );
  await userEvent.type(
    screen.getByLabelText('Password', { exact: true }),
    'wrong',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Signin' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Email or password is incorrect.',
  );
  expect(replace).not.toHaveBeenCalled();
});

test('password visibility preserves input without submitting the form', async () => {
  render(<AuthForm mode="signin" />);
  const password = screen.getByLabelText('Password', { exact: true });
  await userEvent.type(password, 'private-passphrase');
  await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('private-passphrase');
  await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(password).toHaveAttribute('type', 'password');
  expect(api).not.toHaveBeenCalled();
});

test.each(['signin', 'signup'] as const)(
  '%s locks every control and shows loading until a failed request settles',
  async (mode) => {
    let rejectRequest!: (reason: Error) => void;
    api.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    const { container } = render(<AuthForm mode={mode} />);
    const email = screen.getByLabelText('Email address');
    const password = screen.getByLabelText('Password', { exact: true });
    await userEvent.type(email, 'person@example.com');
    await userEvent.type(password, 'private-passphrase');
    await userEvent.click(
      screen.getByRole('button', {
        name: mode === 'signup' ? 'Create account' : 'Signin',
      }),
    );

    const submit = await screen.findByRole('button', { name: 'Please wait…' });
    expect(submit).toBeDisabled();
    expect(submit.querySelector('.animate-spin')).toBeInTheDocument();
    expect(email).toBeDisabled();
    expect(password).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeDisabled();
    expect(container.querySelector('form')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(container.querySelector('.auth-form-secondary')).toHaveAttribute(
      'inert',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Please wait.');
    await userEvent.click(submit);
    expect(api).toHaveBeenCalledTimes(1);

    await act(async () => rejectRequest(new ApiError(500, 'http')));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to continue.',
    );
    await waitFor(() => expect(email).toBeEnabled());
    expect(password).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Show password' })).toBeEnabled();
    expect(container.querySelector('.auth-form-secondary')).not.toHaveAttribute(
      'inert',
    );
    expect(container.querySelector('form')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(password).toHaveValue('private-passphrase');
  },
);

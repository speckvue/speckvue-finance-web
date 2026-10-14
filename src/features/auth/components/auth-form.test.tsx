import AuthForm from '@/features/auth/components/auth-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';

it('shows field errors without pretending to authenticate', async () => {
  render(<AuthForm mode="sign-up" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email address'), 'invalid');
  await user.type(screen.getByLabelText('Password'), 'short');
  await user.click(
    screen.getByRole('button', { name: 'Validate registration form' }),
  );
  expect(await screen.findByText('Enter a valid email address.')).toBeVisible();
  expect(screen.getByText('Use at least 12 characters.')).toBeVisible();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

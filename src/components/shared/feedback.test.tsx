import Feedback from '@/components/shared/feedback';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

it('provides an accessible recovery action', async () => {
  const recover = vi.fn();
  render(
    <Feedback
      title="Unable to load"
      description="Please try again."
      action="Retry"
      onAction={recover}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(recover).toHaveBeenCalledOnce();
});

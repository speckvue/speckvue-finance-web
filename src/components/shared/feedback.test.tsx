/**
 * @fileoverview Tests shared feedback messages and recovery actions.
 *
 * Verifies accessible status presentation and retry behavior.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { expect, it, vi } from 'vitest';

import Feedback from '@/components/shared/feedback';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------

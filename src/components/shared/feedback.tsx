/**
 * @fileoverview Renders shared loading, empty, error, and success feedback.
 *
 * Keeps status messages and recovery actions consistent across features.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import * as Button from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Feedback = ({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) => {
  return (
    <section
      className="flex flex-col items-center gap-3 p-10 text-center"
      aria-live="polite"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-text-sub-600">{description}</p>
      {action && onAction && (
        <Button.Root variant="neutral" mode="stroke" onClick={onAction}>
          {action}
        </Button.Root>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Feedback;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Displays a recoverable route error with a retry action.
 *
 * Lets users recover from rendering failures within the application shell.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Feedback from '@/components/shared/feedback';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const ErrorPage = ({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) => {
  return (
    <Feedback
      title="Something went wrong"
      description="We could not load this page. Please try again."
      action="Try again"
      onAction={reset}
    />
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default ErrorPage;

// ---------------------------------------------------------------------------

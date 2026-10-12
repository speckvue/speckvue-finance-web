/**
 * @fileoverview Displays loading, unauthorized, and forbidden access states.
 *
 * Explains access outcomes and offers sign-in when a session is required.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Link from 'next/link';

import * as Button from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const AccessState = ({
  status,
}: {
  status: 'loading' | 'unauthorized' | 'forbidden';
}) => {
  const text = {
    loading: 'Checking your session',
    unauthorized: 'Please sign in to continue',
    forbidden: 'You do not have access to this resource',
  }[status];
  return (
    <section className="space-y-4 p-8" aria-live="polite">
      <h1 className="text-xl font-semibold">{text}</h1>
      {status === 'unauthorized' && (
        <Button.Root asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button.Root>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default AccessState;

// ---------------------------------------------------------------------------

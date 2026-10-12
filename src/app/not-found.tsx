/**
 * @fileoverview Displays the missing-page state and a navigation action.
 *
 * Helps users return to the application from an unknown URL.
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

const NotFound = () => {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-text-sub-600">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-text-sub-600">
        This page may have moved or does not exist yet.
      </p>
      <Button.Root asChild>
        <Link href="/dashboard">Back to workspace</Link>
      </Button.Root>
    </main>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default NotFound;

// ---------------------------------------------------------------------------

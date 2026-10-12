/**
 * @fileoverview Provides the shared layout and navigation for legal pages.
 *
 * Makes policy pages accessible outside the protected application shell.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Link from 'next/link';

import Brand from '@/components/shared/brand';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-5">
        <Brand />
        <Link href="/dashboard" className="text-sm text-primary-base underline">
          Back to workspace
        </Link>
      </header>
      <main className="py-16">{children}</main>
      <nav
        aria-label="Legal pages"
        className="flex flex-wrap gap-6 border-t border-stroke-soft-200 pt-6 text-sm text-text-sub-600"
      >
        <Link href="/privacy-policy" className="underline">
          Privacy
        </Link>
        <Link href="/terms-of-service" className="underline">
          Terms
        </Link>
        <Link href="/cookie-policy" className="underline">
          Cookies
        </Link>
      </nav>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default LegalLayout;

// ---------------------------------------------------------------------------

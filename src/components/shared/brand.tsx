/**
 * @fileoverview Renders the Speckvue Finance brand link.
 *
 * Keeps product identity and home navigation consistent across layouts.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Link from 'next/link';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Brand = () => {
  return (
    <Link
      href="/dashboard"
      aria-label="Speckvue Finance home"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-primary-base"
    >
      <span
        className="flex size-9 items-center justify-center rounded-10 bg-blue-700 font-bold text-static-white"
        aria-hidden="true"
      >
        s.
      </span>
      <span className="text-lg font-semibold tracking-tight">
        speckvue
        <span className="block text-xs font-normal tracking-normal text-text-sub-600">
          Finance
        </span>
      </span>
    </Link>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Brand;

// ---------------------------------------------------------------------------

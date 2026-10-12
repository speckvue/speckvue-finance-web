/**
 * @fileoverview Renders the cookie policy placeholder route.
 *
 * Reserves a clearly marked location for reviewed cookie policy content.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';

import LegalPlaceholder from '@/components/shared/legal-placeholder';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'Cookie policy' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Page = () => {
  return <LegalPlaceholder title="Cookie policy" />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Page;

// ---------------------------------------------------------------------------

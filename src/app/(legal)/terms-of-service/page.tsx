/**
 * @fileoverview Renders the terms of service placeholder route.
 *
 * Reserves a clearly marked location for reviewed customer terms.
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

export const metadata: Metadata = { title: 'Terms of service' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Page = () => {
  return <LegalPlaceholder title="Terms of service" />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Page;

// ---------------------------------------------------------------------------

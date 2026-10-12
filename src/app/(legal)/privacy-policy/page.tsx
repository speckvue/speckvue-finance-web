/**
 * @fileoverview Renders the privacy policy placeholder route.
 *
 * Reserves a clearly marked location for reviewed privacy policy content.
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

export const metadata: Metadata = { title: 'Privacy policy' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Page = () => {
  return <LegalPlaceholder title="Privacy policy" />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Page;

// ---------------------------------------------------------------------------

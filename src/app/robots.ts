/**
 * @fileoverview Defines crawler rules for the application routes.
 *
 * Requests that crawlers leave all application routes unindexed before launch.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { MetadataRoute } from 'next';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const robots = (): MetadataRoute.Robots => {
  return { rules: { userAgent: '*', disallow: '/' } };
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default robots;

// ---------------------------------------------------------------------------

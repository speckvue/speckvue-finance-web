/**
 * @fileoverview Checks session access and renders the dashboard route.
 *
 * Protects dashboard content at the page boundary during concurrent rendering.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';

import Dashboard from '@/features/dashboard/components/dashboard';

import requireSessionState from '@/lib/auth/require-session';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'Overview' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const DashboardPage = async () => {
  await requireSessionState();
  return <Dashboard />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default DashboardPage;

// ---------------------------------------------------------------------------

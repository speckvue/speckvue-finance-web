/**
 * @fileoverview Checks session access before rendering the authenticated application shell.
 *
 * Provides shared navigation and an access boundary for protected routes.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';

import requireSessionState from '@/lib/auth/require-session';

import AppShell from '@/components/layouts/app-shell';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const metadata: Metadata = { robots: { index: false, follow: false } };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireSessionState();
  return <AppShell>{children}</AppShell>;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default MainLayout;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Renders application navigation links and their active states.
 *
 * Helps users identify and move between available application destinations.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Link from 'next/link';

import useShellStore from '@/stores/shell-store';

import * as Button from '@/components/ui/button';

import { RiDashboardLine } from '@remixicon/react';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Navigation = () => {
  return (
    <nav aria-label="Main navigation" className="space-y-2">
      <p className="px-3 pb-2 text-xs font-medium tracking-wider text-text-sub-600 uppercase">
        Workspace
      </p>
      <Button.Root
        asChild
        mode="lighter"
        className="w-full justify-start text-blue-800 dark:text-blue-300"
      >
        <Link
          href="/dashboard"
          aria-current="page"
          onClick={() => useShellStore.getState().setMenuOpen(false)}
        >
          <Button.Icon as={RiDashboardLine} />
          Overview
        </Link>
      </Button.Root>
      <p className="px-3 pt-5 text-xs leading-5 text-text-sub-600">
        Accounts, budgets, and reports will be added after the backend
        integration.
      </p>
    </nav>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Navigation;

// ---------------------------------------------------------------------------

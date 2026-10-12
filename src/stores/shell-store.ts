/**
 * @fileoverview Stores transient application shell state in Zustand.
 *
 * Coordinates mobile navigation without mixing it with server data or theme preferences.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

// Ephemeral UI state only. Never persist session credentials or financial records here.
const useShellStore = create<{
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default useShellStore;

// ---------------------------------------------------------------------------

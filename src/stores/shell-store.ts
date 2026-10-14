'use client';

import { create } from 'zustand';

// Ephemeral UI state only. Never persist session credentials or financial records here.
const useShellStore = create<{
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

export default useShellStore;

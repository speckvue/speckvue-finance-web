/**
 * @fileoverview Renders the theme preference control using next-themes.
 *
 * Lets users switch appearance while preserving their selected preference.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import subscribe from '@/lib/utils/noop-subscribe';

import nextTheme from '@/lib/theme/next-theme';

import { useSyncExternalStore } from 'react';

import { useTheme } from 'next-themes';

import * as Button from '@/components/ui/button';

import { RiMoonLine, RiSunLine, RiComputerLine } from '@remixicon/react';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const ThemeSwitcher = () => {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const current = mounted ? theme : 'system';
  const next = nextTheme({ preference: current ?? 'system' });
  return (
    <Button.Root
      variant="neutral"
      mode="ghost"
      size="small"
      aria-label={`Theme: ${current}. Switch to ${next}`}
      onClick={() => setTheme(next)}
    >
      <Button.Icon
        as={
          current === 'dark'
            ? RiMoonLine
            : current === 'light'
              ? RiSunLine
              : RiComputerLine
        }
      />
      <span className="hidden sm:inline">
        {current === 'dark' ? 'Dark' : current === 'light' ? 'Light' : 'System'}
      </span>
    </Button.Root>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default ThemeSwitcher;

// ---------------------------------------------------------------------------

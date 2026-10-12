/**
 * @fileoverview Calculates the next theme preference in the appearance cycle.
 *
 * Shares switch ordering while next-themes manages persistence and DOM appearance.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export type ThemePreference = 'light' | 'dark' | 'system';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const nextTheme = ({ preference }: { preference: string }): ThemePreference =>
  preference === 'system'
    ? 'light'
    : preference === 'light'
      ? 'dark'
      : 'system';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default nextTheme;

// ---------------------------------------------------------------------------

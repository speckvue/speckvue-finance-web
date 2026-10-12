/**
 * @fileoverview Formats a numeric value as a localized percentage.
 *
 * Keeps percentage labels consistent across finance views.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

export const formatPercent = (value: number, locale = 'en-US') =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default formatPercent;

// ---------------------------------------------------------------------------

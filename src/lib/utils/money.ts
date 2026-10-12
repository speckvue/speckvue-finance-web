/**
 * @fileoverview Formats integer minor-unit amounts as localized currency text.
 *
 * Displays financial values without converting calculations to floating point.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Money } from '@/types/money';

import currencyDigits from './currency-digits';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const formatMoney = (
  { minorUnits, currency }: Money,
  locale = 'en-US',
): string => {
  const digits = currencyDigits(currency);
  // Convert for Intl display only, never for calculations; reject unsafe magnitudes.
  if (
    minorUnits > BigInt(Number.MAX_SAFE_INTEGER) ||
    minorUnits < BigInt(Number.MIN_SAFE_INTEGER)
  )
    throw new RangeError('Amount is outside the supported display range.');
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    Number(minorUnits) / 10 ** digits,
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default formatMoney;

// ---------------------------------------------------------------------------

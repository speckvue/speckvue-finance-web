/**
 * @fileoverview Determines the fraction digit count for a currency.
 *
 * Supports currency-specific conversion between major and minor units.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const currencyDigits = (currency: string): number => {
  return (
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default currencyDigits;

// ---------------------------------------------------------------------------

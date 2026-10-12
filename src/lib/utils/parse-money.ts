/**
 * @fileoverview Parses decimal currency input into integer minor units.
 *
 * Rejects invalid precision and avoids floating-point monetary parsing.
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

const parseMoney = (value: string, currency: string): Money => {
  const digits = currencyDigits(currency);
  if (!/^-?\d+(\.\d+)?$/.test(value))
    throw new Error('Enter a decimal amount without separators.');
  const negative = value.startsWith('-');
  const [whole = '0', fraction = ''] = value.replace(/^-/, '').split('.');
  if (fraction.length > digits)
    throw new Error(`This currency supports ${digits} decimal places.`);
  const minorUnits =
    BigInt(whole) * 10n ** BigInt(digits) +
    BigInt(fraction.padEnd(digits, '0') || '0');
  return { minorUnits: negative ? -minorUnits : minorUnits, currency };
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default parseMoney;

// ---------------------------------------------------------------------------

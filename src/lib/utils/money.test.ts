/**
 * @fileoverview Tests monetary parsing, addition, and currency formatting.
 *
 * Protects precision and currency-specific minor-unit behavior.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { describe, expect, it } from 'vitest';

import addMoney from '@/lib/utils/add-money';

import formatMoney from '@/lib/utils/money';

import parseMoney from '@/lib/utils/parse-money';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

describe('money', () => {
  it('adds decimal amounts exactly using integer minor units', () => {
    expect(
      addMoney(parseMoney('0.10', 'USD'), parseMoney('0.20', 'USD')).minorUnits,
    ).toBe(30n);
  });
  it('formats configurable currencies and locales', () => {
    expect(formatMoney(parseMoney('1234.56', 'USD'))).toBe('$1,234.56');
    expect(parseMoney('10', 'JPY').minorUnits).toBe(10n);
    expect(parseMoney('1.234', 'KWD').minorUnits).toBe(1234n);
  });
  it('rejects excess precision and mixed currencies', () => {
    expect(() => parseMoney('1.001', 'USD')).toThrow();
    expect(() =>
      addMoney(parseMoney('1', 'USD'), parseMoney('1', 'EUR')),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------

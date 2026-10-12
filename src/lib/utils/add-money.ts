/**
 * @fileoverview Adds monetary values expressed in integer minor units.
 *
 * Preserves precision and prevents combining incompatible currencies.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Money } from '@/types/money';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency)
    throw new Error('Cannot add different currencies.');
  return { currency: a.currency, minorUnits: a.minorUnits + b.minorUnits };
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default addMoney;

// ---------------------------------------------------------------------------

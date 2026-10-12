/**
 * @fileoverview Defines the currency and integer minor-unit monetary value type.
 *
 * Makes financial precision explicit in application data contracts.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export type Money = { minorUnits: bigint; currency: string };

// ---------------------------------------------------------------------------

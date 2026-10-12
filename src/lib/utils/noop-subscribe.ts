/**
 * @fileoverview Provides an inert subscription for external-store consumers.
 *
 * Supports hydration-aware rendering without introducing another mutable store.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const subscribe = () => () => {};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default subscribe;

// ---------------------------------------------------------------------------

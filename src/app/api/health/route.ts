/**
 * @fileoverview Returns an uncached readiness response without application data.
 *
 * Allows container and deployment probes to check that the web process responds.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

// No dependencies.

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const health = () =>
  Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// Next.js route handlers require a named HTTP-method export, with no default.
export { health as GET };

// ---------------------------------------------------------------------------

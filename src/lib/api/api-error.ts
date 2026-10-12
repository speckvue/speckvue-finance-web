/**
 * @fileoverview Defines typed API failures with HTTP status and a safe error code.
 *
 * Lets callers handle failures without exposing arbitrary backend messages.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code:
      | 'network'
      | 'timeout'
      | 'unauthorized'
      | 'forbidden'
      | 'validation'
      | 'http'
      | 'contract',
    public readonly fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(
      code === 'unauthorized'
        ? 'Please sign in to continue.'
        : code === 'forbidden'
          ? 'You do not have access to this resource.'
          : code === 'timeout'
            ? 'The request took too long. Please try again.'
            : 'We could not complete this request. Please try again.',
    );
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default ApiError;

// ---------------------------------------------------------------------------

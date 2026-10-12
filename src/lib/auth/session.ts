/**
 * @fileoverview Caches server-side session state for the current request.
 *
 * Provides explicit demo or anonymous access until a verified session adapter is implemented.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import 'server-only';

import { cache } from 'react';

import serverEnv from '@/lib/config/server-env';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export type Session = {
  userId: string;
  roles: readonly string[];
  permissions: readonly string[];
};

export type SessionState =
  | { status: 'demo' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; session: Session };

// Replace anonymous with a verified server-side NestJS cookie/session adapter.
// Never infer authentication from client state or from the presence of a cookie.
const getSessionState = cache(async (): Promise<SessionState> => {
  if (serverEnv.ENABLE_DEMO_MODE || process.env.NODE_ENV === 'development')
    return { status: 'demo' };
  return { status: 'anonymous' };
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

// Invoke at protected page/data boundaries as well as layouts: RSC children
// can render concurrently before a parent layout's redirect completes.

export default getSessionState;

// ---------------------------------------------------------------------------

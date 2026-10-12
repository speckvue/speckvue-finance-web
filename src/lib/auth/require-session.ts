/**
 * @fileoverview Redirects anonymous requests to sign-in and returns allowed session state.
 *
 * Guards protected layouts and page boundaries against unauthorized rendering.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import 'server-only';

import { redirect } from 'next/navigation';

import getSessionState from './session';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const requireSessionState = async () => {
  const state = await getSessionState();
  if (state.status === 'anonymous') redirect('/sign-in');
  return state;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default requireSessionState;

// ---------------------------------------------------------------------------

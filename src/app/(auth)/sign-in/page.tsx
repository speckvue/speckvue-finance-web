/**
 * @fileoverview Renders the sign-in form route.
 *
 * Provides the account entry screen while backend authentication is pending.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';

import AuthForm from '@/features/auth/components/auth-form';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'Sign in' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Page = () => {
  return <AuthForm mode="sign-in" />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Page;

// ---------------------------------------------------------------------------

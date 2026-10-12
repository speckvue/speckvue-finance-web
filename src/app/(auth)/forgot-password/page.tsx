/**
 * @fileoverview Renders the password recovery request route.
 *
 * Provides the email entry screen for the future account recovery flow.
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

export const metadata: Metadata = { title: 'Forgot password' };

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Page = () => {
  return <AuthForm mode="forgot-password" />;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Page;

// ---------------------------------------------------------------------------

/**
 * @fileoverview Defines the root HTML document, metadata, fonts, and application providers.
 *
 * Applies shared rendering and theme setup to every route.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';

import { headers } from 'next/headers';

import '@fontsource-variable/inter';

import '@/styles/globals.css';

import AppProviders from '@/lib/providers/app-providers';

import publicEnv from '@/lib/config/public-env';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: publicEnv.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description: 'A clear, organized workspace for your personal finances.',
  openGraph: {
    title: publicEnv.NEXT_PUBLIC_APP_NAME,
    description: 'A clear view of your money.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-white-0 font-sans text-text-strong-950 antialiased">
        <AppProviders nonce={nonce}>{children}</AppProviders>
      </body>
    </html>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default RootLayout;

// ---------------------------------------------------------------------------

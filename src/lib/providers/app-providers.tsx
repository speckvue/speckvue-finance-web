/**
 * @fileoverview Composes query caching, next-themes, and application notifications.
 *
 * Makes shared client services available beneath the root layout.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from 'next-themes';

import createQueryClient from '@/lib/query/client';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const AppProviders = ({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) => {
  const [client] = useState(createQueryClient);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default AppProviders;

// ---------------------------------------------------------------------------

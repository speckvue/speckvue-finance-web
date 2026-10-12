/**
 * @fileoverview Adds a request-specific nonce and Content Security Policy to responses.
 *
 * Restricts script execution and connection origins for application pages.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import publicEnv from '@/lib/config/public-env';

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const proxy = (request: NextRequest) => {
  const nonce = btoa(crypto.randomUUID());
  const apiOrigin = new URL(publicEnv.NEXT_PUBLIC_API_URL).origin;
  const dev = process.env.NODE_ENV === 'development';
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // AlignUI/Radix positioning and progress use inline styles; scripts still require a nonce.
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${apiOrigin}${dev ? ' ws: wss:' : ''}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default proxy;

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)',
  ],
};

// ---------------------------------------------------------------------------

import type { NextConfig } from 'next';
import publicEnv from './src/lib/config/public-env';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  allowedDevOrigins: [
    new URL(publicEnv.NEXT_PUBLIC_APP_URL).hostname,
    ...[process.env.APP_HOST, process.env.DOCKER_BIND_HOST].filter(
      (host): host is string => !!host && host !== '0.0.0.0' && host !== '::',
    ),
  ],
  poweredByHeader: false,
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;

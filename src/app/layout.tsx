import publicEnv from '@/lib/config/public-env';
import AppProviders from '@/lib/providers/app-providers';
import '@/styles/fonts.css';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const appDescription =
  'Web application for Speckvue Finance, providing an intuitive interface to manage personal finances, track expenses, monitor income, and organize budgets.';

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: publicEnv.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description: appDescription,
  openGraph: {
    title: publicEnv.NEXT_PUBLIC_APP_NAME,
    description: appDescription,
    type: 'website',
  },
  robots: { index: false, follow: false },
};

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

export default RootLayout;

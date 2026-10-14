import AppShell from '@/components/layouts/app-shell';
import requireSessionState from '@/lib/auth/require-session';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireSessionState();
  return <AppShell>{children}</AppShell>;
};

export default MainLayout;

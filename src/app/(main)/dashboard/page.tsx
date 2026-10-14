import Dashboard from '@/features/dashboard/components/dashboard';
import requireSessionState from '@/lib/auth/require-session';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Overview' };

const DashboardPage = async () => {
  await requireSessionState();
  return <Dashboard />;
};

export default DashboardPage;

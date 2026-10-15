import AppShell from '@/components/shared/app-shell';
import requireUser from '@/lib/auth/session';
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(false);
  return <AppShell user={user}>{children}</AppShell>;
}

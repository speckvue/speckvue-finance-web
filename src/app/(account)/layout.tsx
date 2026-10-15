import Brand from '@/components/shared/brand';
import SignoutButton from '@/features/auth/components/signout-button';
import AccountTheme from '@/features/preferences/components/account-theme';
import requireUser from '@/lib/auth/session';
import Link from 'next/link';
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(false);
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke-soft-200 p-6">
        <Brand />
        <nav
          aria-label="Account"
          className="flex flex-wrap items-center gap-4 text-sm"
        >
          <Link href="/workspace">Overview</Link>
          <Link href="/settings">Settings</Link>
          <AccountTheme user={user} />
          <SignoutButton />
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
    </div>
  );
}

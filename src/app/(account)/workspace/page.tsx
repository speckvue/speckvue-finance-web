import requireUser from '@/lib/auth/session';
import Link from 'next/link';
export default async function WorkspacePage() {
  const user = await requireUser();
  return (
    <div>
      <p className="mb-2 text-sm text-text-sub-600">Your workspace</p>
      <h1 className="text-3xl font-semibold">Welcome, {user.displayName}</h1>
      <p className="mt-3 text-text-sub-600">
        Your personal finance profile is ready.
      </p>
      <dl className="mt-8 grid gap-6 rounded-xl border border-stroke-soft-200 p-6 sm:grid-cols-2">
        {[
          ['Base currency', user.baseCurrency],
          ['Timezone', user.timezone],
          ['Number format', user.locale],
          ['Account', user.email],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-text-sub-600">{label}</dt>
            <dd className="mt-1 font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href="/settings"
        className="mt-6 inline-block text-primary-base underline"
      >
        Manage preferences and security
      </Link>
    </div>
  );
}

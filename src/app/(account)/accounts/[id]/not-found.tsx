import Link from 'next/link';

const AccountNotFound = () => (
  <section className="space-y-4 py-12">
    <h1 className="text-2xl font-medium">Account not found</h1>
    <p className="text-text-sub-600">
      This account is unavailable or you do not have access to it.
    </p>
    <Link href="/accounts" className="text-sm underline underline-offset-4">
      Back to accounts
    </Link>
  </section>
);
export default AccountNotFound;

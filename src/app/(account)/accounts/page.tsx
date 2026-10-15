import AccountsWorkspace from '@/features/accounts/components/accounts-workspace';
import { accountsSchema } from '@/features/accounts/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';
import preferenceOptions from '@/lib/preferences/options';

export const metadata = { title: 'Accounts' };

export default async function AccountsPage() {
  const user = await requireUser();
  const response = await backendFetch('/accounts');
  if (!response.ok) throw new Error('Unable to load financial accounts');
  return (
    <AccountsWorkspace
      currencies={preferenceOptions().currencies}
      initial={accountsSchema.parse(await response.json())}
      currency={user.baseCurrency!}
      locale={user.locale!}
      today={new Date().toISOString().slice(0, 10)}
    />
  );
}

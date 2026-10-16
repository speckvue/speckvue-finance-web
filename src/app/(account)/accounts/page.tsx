import AccountsWorkspace from '@/features/accounts/components/accounts-workspace';
import {
  accountOptionsSchema,
  accountsSchema,
} from '@/features/accounts/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';

export const metadata = { title: 'Accounts' };

export default async function AccountsPage() {
  const user = await requireUser();
  const [response, optionsResponse] = await Promise.all([
    backendFetch('/accounts'),
    backendFetch('/accounts/options'),
  ]);
  if (!response.ok || !optionsResponse.ok)
    throw new Error('Unable to load financial accounts');
  const options = accountOptionsSchema.parse(await optionsResponse.json());
  return (
    <AccountsWorkspace
      currencies={options.currencies}
      currencyDigits={options.currencyDigits}
      initial={accountsSchema.parse(await response.json())}
      currency={user.baseCurrency!}
      locale={user.locale!}
      today={options.today}
    />
  );
}

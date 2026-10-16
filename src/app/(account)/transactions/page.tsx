import {
  accountOptionsSchema,
  accountsSchema,
} from '@/features/accounts/contracts';
import { categoriesSchema } from '@/features/categories/contracts';
import { payeesSchema } from '@/features/payees/contracts';
import TransactionsWorkspace from '@/features/transactions/components/transactions-workspace';
import { transactionsSchema } from '@/features/transactions/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { z } from 'zod';

export const metadata = { title: 'Transactions' };
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const accountId = z.uuid().safeParse(params.accountId).success
    ? params.accountId!
    : '';
  const paths = [
    '/transactions' + (accountId ? '?accountId=' + accountId : ''),
    '/accounts',
    '/accounts/options',
    '/categories',
    '/payees',
  ];
  const responses = await Promise.all(paths.map((path) => backendFetch(path)));
  if (responses[0]!.status === 404) notFound();
  if (responses.some((r) => !r.ok))
    throw new Error('Unable to load transactions');
  const [transactions, accounts, options, categories, payees] =
    await Promise.all(responses.map((r) => r.json()));
  return (
    <TransactionsWorkspace
      key={accountId}
      initial={transactionsSchema.parse(transactions)}
      accounts={accountsSchema.parse(accounts)}
      options={accountOptionsSchema.parse(options)}
      categories={categoriesSchema.parse(categories).items}
      payees={payeesSchema.parse(payees)}
      locale={user.locale ?? 'en-US'}
      initialAccountId={accountId}
    />
  );
}

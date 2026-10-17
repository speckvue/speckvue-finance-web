import {
  accountOptionsSchema,
  accountsSchema,
} from '@/features/accounts/contracts';
import { categoriesSchema } from '@/features/categories/contracts';
import TransfersWorkspace from '@/features/transfers/components/transfers-workspace';
import { transfersSchema } from '@/features/transfers/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { z } from 'zod';

export const metadata = { title: 'Transfers' };
export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const accountId = z.uuid().safeParse(params.accountId).success
    ? params.accountId!
    : '';
  const responses = await Promise.all(
    [
      '/transfers' + (accountId ? '?accountId=' + accountId : ''),
      '/accounts',
      '/accounts/options',
      '/categories',
    ].map((path) => backendFetch(path)),
  );
  if (responses[0]!.status === 404) notFound();
  if (responses.some((r) => !r.ok)) throw new Error('Unable to load transfers');
  const [transfers, accounts, options, categories] = await Promise.all(
    responses.map((r) => r.json()),
  );
  return (
    <TransfersWorkspace
      key={accountId}
      initial={transfersSchema.parse(transfers)}
      accounts={accountsSchema.parse(accounts)}
      options={accountOptionsSchema.parse(options)}
      categories={categoriesSchema.parse(categories).items}
      locale={user.locale ?? 'en-US'}
      initialAccountId={accountId}
    />
  );
}

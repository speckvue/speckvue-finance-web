import AccountDetails from '@/features/accounts/components/account-details';
import {
  accountOptionsSchema,
  accountSchema,
} from '@/features/accounts/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Account details' };

/** Resolves account ownership on the API before rendering private financial details. */
export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!accountSchema.shape.id.safeParse(id).success) notFound();
  const [response, options] = await Promise.all([
    backendFetch('/accounts/' + id),
    backendFetch('/accounts/options'),
  ]);
  if (response.status === 404) notFound();
  if (!response.ok || !options.ok) throw new Error('Unable to load account');
  return (
    <AccountDetails
      initial={accountSchema.parse(await response.json())}
      options={accountOptionsSchema.parse(await options.json())}
      locale={user.locale!}
      timezone={user.timezone!}
    />
  );
}

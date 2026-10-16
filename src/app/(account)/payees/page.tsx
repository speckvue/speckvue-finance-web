import PayeesWorkspace from '@/features/payees/components/payees-workspace';
import { payeesSchema } from '@/features/payees/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';

export const metadata = { title: 'Payees' };
export default async function PayeesPage() {
  await requireUser();
  const response = await backendFetch('/payees');
  if (!response.ok) throw new Error('Unable to load payees');
  return (
    <PayeesWorkspace initial={payeesSchema.parse(await response.json())} />
  );
}

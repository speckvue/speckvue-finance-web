import AuthForm from '@/features/auth/components/auth-form';
import { getUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export default async function Page() {
  const user = await getUser();
  if (user) redirect(user.onboardedAt ? '/workspace' : '/onboarding');
  return <AuthForm mode="signin" />;
}

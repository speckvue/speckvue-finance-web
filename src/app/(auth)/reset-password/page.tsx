import AuthForm from '@/features/auth/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reset password' };

const Page = () => {
  return <AuthForm mode="reset-password" />;
};

export default Page;

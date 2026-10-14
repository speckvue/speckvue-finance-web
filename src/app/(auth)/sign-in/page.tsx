import AuthForm from '@/features/auth/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in' };

const Page = () => {
  return <AuthForm mode="sign-in" />;
};

export default Page;

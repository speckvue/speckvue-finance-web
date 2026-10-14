import AuthForm from '@/features/auth/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign up' };

const Page = () => {
  return <AuthForm mode="sign-up" />;
};

export default Page;

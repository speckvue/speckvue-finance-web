import AuthForm from '@/features/auth/components/auth-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Forgot password' };

const Page = () => {
  return <AuthForm mode="forgot-password" />;
};

export default Page;

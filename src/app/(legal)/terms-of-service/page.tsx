import LegalPlaceholder from '@/components/shared/legal-placeholder';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of service' };

const Page = () => {
  return <LegalPlaceholder title="Terms of service" />;
};

export default Page;

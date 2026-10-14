import LegalPlaceholder from '@/components/shared/legal-placeholder';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie policy' };

const Page = () => {
  return <LegalPlaceholder title="Cookie policy" />;
};

export default Page;

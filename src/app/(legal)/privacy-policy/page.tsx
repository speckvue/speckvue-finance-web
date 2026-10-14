import LegalPlaceholder from '@/components/shared/legal-placeholder';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy policy' };

const Page = () => {
  return <LegalPlaceholder title="Privacy policy" />;
};

export default Page;

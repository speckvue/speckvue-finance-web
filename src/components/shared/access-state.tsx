import * as Button from '@/components/ui/button';
import Link from 'next/link';

const AccessState = ({
  status,
}: {
  status: 'loading' | 'unauthorized' | 'forbidden';
}) => {
  const text = {
    loading: 'Checking your session',
    unauthorized: 'Please sign in to continue',
    forbidden: 'You do not have access to this resource',
  }[status];
  return (
    <section className="space-y-4 p-8" aria-live="polite">
      <h1 className="text-xl font-semibold">{text}</h1>
      {status === 'unauthorized' && (
        <Button.Root asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button.Root>
      )}
    </section>
  );
};

export default AccessState;

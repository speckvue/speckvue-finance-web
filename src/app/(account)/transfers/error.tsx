'use client';

import * as Button from '@/components/ui/button';
import { RiLoader4Line } from '@remixicon/react';
import { useTransition } from 'react';

const TransfersError = ({ reset }: { reset: () => void }) => {
  const [pending, startTransition] = useTransition();
  return (
    <section className="space-y-4 py-12">
      <h1 className="text-2xl font-medium">Transfers are unavailable</h1>
      <p className="text-text-sub-600">
        We couldn’t load your transfers. Please try again.
      </p>
      <Button.Root disabled={pending} onClick={() => startTransition(reset)}>
        {pending && (
          <RiLoader4Line
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />
        )}
        Try again
      </Button.Root>
    </section>
  );
};
export default TransfersError;

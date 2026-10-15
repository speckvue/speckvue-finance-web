'use client';

import * as Button from '@/components/ui/button';
import { RiLoader4Line } from '@remixicon/react';
import { useTransition } from 'react';

export default function AccountsError({ reset }: { reset: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <section className="space-y-4 py-12">
      <h1 className="text-2xl font-medium">Accounts are unavailable</h1>
      <p className="text-text-sub-600">
        We couldn’t load your accounts. Please try again.
      </p>
      <Button.Root disabled={pending} onClick={() => startTransition(reset)}>
        {pending && (
          <RiLoader4Line
            className="animate-spin"
            size={18}
            aria-hidden="true"
          />
        )}
        Try again
      </Button.Root>
    </section>
  );
}

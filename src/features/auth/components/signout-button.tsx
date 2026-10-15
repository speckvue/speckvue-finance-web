'use client';
import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
export default function SignoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();
  return (
    <div>
      <Button.Root
        variant="neutral"
        mode="ghost"
        size="small"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError('');
          try {
            await authenticatedRequest('/auth/signout', {
              method: 'POST',
              body: {},
              schema: z.undefined(),
            });
            queryClient.clear();
            router.replace('/signin');
            router.refresh();
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              queryClient.clear();
              router.replace('/signin');
              router.refresh();
              return;
            }
            setError('Unable to signout. Try again.');
          } finally {
            setPending(false);
          }
        }}
      >
        Signout
      </Button.Root>
      {error && (
        <p role="alert" className="text-xs text-error-base">
          {error}
        </p>
      )}
    </div>
  );
}

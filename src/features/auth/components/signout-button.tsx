'use client';

import * as Button from '@/components/ui/button';
import * as Dropdown from '@/components/ui/dropdown';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import { RiLoader4Line, RiLogoutBoxRLine } from '@remixicon/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

export default function SignoutButton({
  menuItem = false,
}: {
  menuItem?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();
  const signout = async () => {
    if (pending) return;
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
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        queryClient.clear();
        router.replace('/signin');
        router.refresh();
        return;
      }
      setError('Unable to signout. Try again.');
    } finally {
      setPending(false);
    }
  };
  const label = (
    <>
      {pending ? (
        <RiLoader4Line className="animate-spin" size={18} aria-hidden="true" />
      ) : (
        <RiLogoutBoxRLine size={18} aria-hidden="true" />
      )}
      {pending ? 'Signing out...' : 'Signout'}
    </>
  );
  return (
    <>
      {menuItem ? (
        <Dropdown.Item
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            void signout();
          }}
        >
          {label}
        </Dropdown.Item>
      ) : (
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="small"
          disabled={pending}
          onClick={() => void signout()}
        >
          {label}
        </Button.Root>
      )}
      {error && (
        <p role="alert" className="px-2 text-xs text-red-800 dark:text-red-300">
          {error}
        </p>
      )}
    </>
  );
}

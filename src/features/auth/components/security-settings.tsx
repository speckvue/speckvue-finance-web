'use client';
import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import { sessionsSchema } from '@/lib/auth/contracts';
import { passwordSchema } from '@/lib/validations/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

export default function SecuritySettings({
  locale,
  timezone,
}: {
  locale: string;
  timezone: string;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const sessions = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => apiRequest('/auth/sessions', { schema: sessionsSchema }),
    retry: false,
  });
  const leave = () => {
    cache.clear();
    router.replace('/signin');
    router.refresh();
  };
  const mutate = async (path: string, body: unknown = {}, method = 'POST') => {
    setPending(true);
    setMessage('');
    try {
      await authenticatedRequest(path, { method, body, schema: z.undefined() });
      if (path === '/auth/password' || path === '/auth/signout-all') leave();
      else await sessions.refetch();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        path !== '/auth/password'
      ) {
        leave();
        return;
      }
      setMessage(
        'Unable to update security settings. Check your password or signin again.',
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="mt-12 space-y-6 border-t border-stroke-soft-200 pt-8">
      <h2 className="text-xl font-semibold">Security</h2>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const values = new FormData(form);
          const parsed = passwordSchema.safeParse(values.get('newPassword'));
          if (!parsed.success) {
            setMessage(
              parsed.error.issues[0]?.message ?? 'Choose a stronger password.',
            );
            return;
          }
          if (parsed.data !== values.get('confirmPassword')) {
            setMessage('New passwords do not match.');
            return;
          }
          void mutate('/auth/password', {
            currentPassword: values.get('currentPassword'),
            newPassword: parsed.data,
          });
        }}
      >
        <h3 className="font-medium">Change password</h3>
        <TextField
          id="currentPassword"
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
        <TextField
          id="newPassword"
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
        />
        <TextField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          maxLength={128}
        />
        <p className="text-xs text-text-sub-600">
          Changing your password signs out all sessions, including this one.
        </p>
        <Button.Root type="submit" disabled={pending}>
          Change password
        </Button.Root>
      </form>
      {message && (
        <p role="alert" className="text-sm text-error-base">
          {message}
        </p>
      )}
      <h3 className="font-medium">Active sessions</h3>
      {sessions.isPending ? (
        <p role="status">Loading sessions…</p>
      ) : sessions.isError ? (
        <p role="alert">
          Unable to load sessions.{' '}
          <button className="underline" onClick={() => void sessions.refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.data.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stroke-soft-200 p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {session.current ? 'This session' : 'Other session'}
                </p>
                <p className="text-xs text-text-sub-600">
                  Started{' '}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: timezone,
                  }).format(new Date(session.createdAt))}
                </p>
              </div>
              {!session.current && (
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  size="small"
                  disabled={pending}
                  onClick={() =>
                    void mutate('/auth/sessions/' + session.id, {}, 'DELETE')
                  }
                >
                  Revoke session
                </Button.Root>
              )}
            </li>
          ))}
        </ul>
      )}
      <Button.Root
        variant="neutral"
        mode="stroke"
        disabled={pending}
        onClick={() => {
          if (window.confirm('Signout from every device, including this one?'))
            void mutate('/auth/signout-all');
        }}
      >
        Signout all sessions
      </Button.Root>
    </section>
  );
}

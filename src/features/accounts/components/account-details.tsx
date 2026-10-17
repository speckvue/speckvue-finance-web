'use client';

import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import { RiLoader4Line } from '@remixicon/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  accountSchema,
  accountTypes,
  type Account,
  type AccountInput,
  type AccountOptions,
} from '../contracts';
import formatMoney from '../format-money';
import AccountEditor from './account-editor';

/** Displays one owned account, including archived details, without mixing currencies or inventing ledger balances. */
const AccountDetails = ({
  initial,
  options,
  locale,
  timezone = 'UTC',
}: {
  initial: Account;
  options: AccountOptions;
  locale: string;
  timezone?: string;
}) => {
  const router = useRouter();
  const [account, setAccount] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<'save' | 'status' | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const mutate = async (
    path: string,
    method: 'POST' | 'PATCH',
    body: AccountInput | Record<string, never>,
    saving: boolean,
  ) => {
    if (busy) return;
    setBusy(saving ? 'save' : 'status');
    setError('');
    setNotice('');
    try {
      const saved = await authenticatedRequest(
        '/accounts/' + account.id + path,
        { method, body, schema: accountSchema },
      );
      setAccount(saved);
      setEditing(false);
      setConfirm(false);
      setNotice(
        saving
          ? 'Account updated.'
          : saved.archivedAt
            ? 'Account archived.'
            : 'Account restored.',
      );
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401)
        router.replace('/signin');
      else
        setError(
          reason instanceof ApiError && [404, 409].includes(reason.status)
            ? 'This account has changed or is unavailable. Reload the page to see its latest details.'
            : 'Unable to save changes. Your changes have not been confirmed. Please try again.',
        );
    } finally {
      setBusy(null);
    }
  };
  const date = (value: string, calendarDate = false) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: calendarDate ? 'UTC' : timezone,
    }).format(new Date(value));
  return (
    <section aria-busy={busy !== null} className="space-y-6">
      <Link href="/accounts" className="text-sm underline underline-offset-4">
        Back to accounts
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-sm text-text-sub-600">
            {accountTypes[account.type]} · {account.currency} ·{' '}
            {account.archivedAt ? 'Archived' : 'Active'}
          </p>
          <h1 className="text-3xl font-medium break-words">{account.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {!account.archivedAt && (
            <Button.Root
              disabled={busy !== null}
              variant="neutral"
              mode="stroke"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setError('');
                setEditing(true);
              }}
            >
              Edit account
            </Button.Root>
          )}
          <Button.Root
            disabled={busy !== null}
            variant="neutral"
            mode="stroke"
            onClick={() => {
              setError('');
              if (account.archivedAt)
                void mutate('/restore', 'POST', {}, false);
              else setConfirm(true);
            }}
          >
            {busy === 'status' && (
              <RiLoader4Line
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {account.archivedAt ? 'Restore account' : 'Archive account'}
          </Button.Root>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href={'/transactions?accountId=' + account.id}
          className="text-sm underline underline-offset-4"
        >
          View account transactions
        </Link>
        <Link
          href={'/transfers?accountId=' + account.id}
          className="text-sm underline underline-offset-4"
        >
          View account transfers
        </Link>
      </div>
      {account.hasTransactions && (
        <p className="text-sm text-text-sub-600">
          Opening balance and date are locked because this account has
          transaction history.
        </p>
      )}
      {confirm && (
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
          <p className="mb-4 text-sm">
            Archive this account? Its details and opening balance will be kept.
            You can restore it later.
          </p>
          <div className="flex gap-3">
            <Button.Root
              disabled={busy !== null}
              variant="neutral"
              mode="stroke"
              onClick={() => void mutate('/archive', 'POST', {}, false)}
            >
              {busy === 'status' && (
                <RiLoader4Line
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              Confirm archive
            </Button.Root>
            <Button.Root
              disabled={busy !== null}
              variant="neutral"
              mode="ghost"
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button.Root>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-bg-white-0 p-6">
        <p className="text-sm text-text-sub-600">Current balance</p>
        <p className="mt-3 text-3xl font-medium break-words tabular-nums">
          {formatMoney(
            account.currentBalance ?? account.openingBalance,
            account.currency,
            locale,
            options.currencyDigits[account.currency],
          )}
        </p>
        <p className="mt-2 text-sm text-text-sub-600">
          Opening balance{' '}
          {formatMoney(
            account.openingBalance,
            account.currency,
            locale,
            options.currencyDigits[account.currency],
          )}{' '}
          · {date(account.openingBalanceDate + 'T00:00:00Z', true)}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-text-sub-600">
          Opening balance plus posted transactions. Amounts owed are negative;
          money or credit in your favor is positive.
        </p>
      </div>
      <dl className="grid gap-6 rounded-2xl bg-bg-white-0 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-text-sub-600">Institution</dt>
          <dd className="mt-2 break-words">
            {account.institution || 'Not specified'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-sub-600">Currency</dt>
          <dd className="mt-2">{account.currency} · Fixed after creation</dd>
        </div>
        <div>
          <dt className="text-sm text-text-sub-600">Created</dt>
          <dd className="mt-2">{date(account.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-sub-600">Last updated</dt>
          <dd className="mt-2">{date(account.updatedAt)}</dd>
        </div>
        {account.archivedAt && (
          <div>
            <dt className="text-sm text-text-sub-600">Archived</dt>
            <dd className="mt-2">
              {date(account.archivedAt)} · Restore before editing
            </dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="text-sm text-text-sub-600">Notes</dt>
          <dd className="mt-2 break-words whitespace-pre-wrap">
            {account.notes || 'No notes'}
          </dd>
        </div>
      </dl>
      <AccountEditor
        editor={editing ? account : null}
        currency={account.currency}
        {...options}
        busy={busy === 'save'}
        error={error}
        opener={opener}
        onSave={(value) => mutate('', 'PATCH', value, true)}
        onClose={() => {
          setEditing(false);
          setError('');
        }}
      />
      {!editing && error && (
        <p role="alert" className="text-sm text-error-base">
          {error}
        </p>
      )}
      <p role="status" className="text-sm text-text-sub-600">
        {notice}
      </p>
    </section>
  );
};

export default AccountDetails;

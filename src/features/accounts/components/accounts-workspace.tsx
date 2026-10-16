'use client';

import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';

import {
  RiAddLine,
  RiArchiveLine,
  RiArrowGoBackLine,
  RiBankLine,
  RiLoader4Line,
  RiPencilLine,
  RiWallet3Line,
} from '@remixicon/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  accountSchema,
  accountsSchema,
  accountTypes,
  type Account,
  type AccountInput,
  type AccountsPage,
} from '../contracts';
import formatMoney from '../format-money';
import AccountEditor from './account-editor';

/** Manages real financial accounts, preserving each account's currency and archived history. */
const AccountsWorkspace = ({
  initial,
  currency,
  currencies,
  currencyDigits,
  locale,
  today,
}: {
  initial: AccountsPage;
  currency: string;
  currencies: string[];
  currencyDigits?: Record<string, number>;
  locale: string;
  today: string;
}) => {
  const router = useRouter();
  const opener = useRef<HTMLButtonElement | null>(null);
  const [page, setPage] = useState(initial);
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [busy, setBusy] = useState<'save' | 'list' | string | null>(null);
  const [editor, setEditor] = useState<Account | 'new' | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fail = (reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 401) {
      router.replace('/signin');
      return;
    }
    setError(
      reason instanceof ApiError && reason.status === 404
        ? 'This account is no longer active. Reload accounts to see its latest status.'
        : reason instanceof ApiError && reason.status === 400
          ? 'Check the account details and try again.'
          : 'Unable to complete this request. Your changes have not been confirmed. Please try again.',
    );
  };
  const load = async (nextStatus: typeof status, more = false) => {
    if (busy) return;
    setBusy('list');
    setError('');
    setNotice('');
    try {
      const result = await apiRequest(
        '/accounts?status=' +
          nextStatus +
          (more && page.nextCursor ? '&after=' + page.nextCursor : ''),
        { schema: accountsSchema },
      );
      setPage((previous) =>
        more
          ? {
              ...result,
              items: [
                ...new Map(
                  [...previous.items, ...result.items].map((account) => [
                    account.id,
                    account,
                  ]),
                ).values(),
              ],
            }
          : result,
      );
      setStatus(nextStatus);
      setConfirm(null);
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(null);
    }
  };
  const save = async (value: AccountInput) => {
    if (busy) return;
    setBusy('save');
    setError('');
    setNotice('');
    const editing = editor && editor !== 'new' ? editor : null;
    try {
      const saved = await authenticatedRequest(
        editing ? '/accounts/' + editing.id : '/accounts',
        {
          method: editing ? 'PATCH' : 'POST',
          body: value,
          schema: accountSchema,
        },
      );
      setPage((previous) => ({
        ...previous,
        items: editing
          ? previous.items.map((account) =>
              account.id === saved.id ? saved : account,
            )
          : [saved, ...previous.items],
      }));
      setEditor(null);
      setNotice(editing ? 'Account updated.' : 'Account added.');
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(null);
    }
  };
  const changeStatus = async (account: Account) => {
    if (busy) return;
    setBusy(account.id);
    setError('');
    setNotice('');
    try {
      await authenticatedRequest(
        '/accounts/' +
          account.id +
          (account.archivedAt ? '/restore' : '/archive'),
        { method: 'POST', body: {}, schema: accountSchema },
      );
      setPage((previous) => ({
        ...previous,
        items: previous.items.filter((item) => item.id !== account.id),
      }));
      setConfirm(null);
      setNotice(
        account.archivedAt
          ? 'Account restored. Find it under Active.'
          : 'Account archived. Find it under Archived.',
      );
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(null);
    }
  };
  return (
    <section aria-busy={busy !== null}>
      <fieldset disabled={busy !== null} className="min-w-0">
        <legend className="sr-only">Financial accounts</legend>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-2 text-sm text-text-sub-600">
              Your financial foundation
            </p>
            <h1 className="text-3xl font-medium tracking-tight">Accounts</h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-sub-600">
              Give every part of your money a place. Start with the accounts you
              use and the balances you already have.
            </p>
          </div>
          {status === 'active' && (
            <Button.Root
              className="finance-primary"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setEditor('new');
                setError('');
                setNotice('');
              }}
            >
              <RiAddLine size={18} aria-hidden="true" />
              Add account
            </Button.Root>
          )}
        </div>
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stroke-soft-200 pb-4">
            <div
              className="flex gap-2"
              role="group"
              aria-label="Account status"
            >
              {(['active', 'archived'] as const).map((value) => (
                <Button.Root
                  key={value}
                  size="small"
                  variant="neutral"
                  mode={status === value ? 'filled' : 'ghost'}
                  aria-pressed={status === value}
                  onClick={() => void load(value)}
                >
                  {value === 'active' ? 'Active' : 'Archived'}
                </Button.Root>
              ))}
            </div>
            <button
              type="button"
              className="text-xs text-text-sub-600 underline underline-offset-4 disabled:opacity-50"
              onClick={() => void load(status)}
            >
              Reload accounts
            </button>
          </div>
          {busy === 'list' && (
            <p
              className="mb-5 flex items-center gap-2 text-sm text-text-sub-600"
              role="status"
            >
              <RiLoader4Line
                className="animate-spin"
                size={18}
                aria-hidden="true"
              />
              Loading accounts…
            </p>
          )}
          {page.items.length === 0 ? (
            <div className="rounded-2xl bg-bg-weak-50 px-6 py-14 text-center">
              <RiWallet3Line
                size={32}
                className="mx-auto mb-4 text-text-sub-600"
                aria-hidden="true"
              />
              <h2 className="text-xl font-medium">
                {status === 'active'
                  ? 'Start with your first account'
                  : 'No archived accounts'}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-sub-600">
                {status === 'active'
                  ? 'Add a bank account, cash wallet, credit card, or another account. Your opening balance gives you a starting point.'
                  : 'Archived accounts stay here with their saved details. You can restore them whenever you need.'}
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {page.items.map((account) => (
                <li
                  key={account.id}
                  className="min-w-0 rounded-2xl bg-bg-white-0 p-6"
                >
                  <div className="mb-6 flex items-start gap-3">
                    <span className="rounded-xl bg-bg-weak-50 p-3">
                      <RiBankLine size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-sans text-base font-medium break-words">
                        <Link
                          href={'/accounts/' + account.id}
                          className="underline-offset-4 hover:underline"
                        >
                          {account.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-text-sub-600">
                        {accountTypes[account.type]} · {account.currency}
                        {account.archivedAt ? ' · Archived' : ''}
                      </p>
                      {account.institution && (
                        <p className="mt-1 text-xs break-words text-text-sub-600">
                          {account.institution}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-sub-600">Current balance</p>
                  <p className="mt-2 text-2xl font-medium break-words tabular-nums">
                    {formatMoney(
                      account.currentBalance ?? account.openingBalance,
                      account.currency,
                      locale,
                      currencyDigits?.[account.currency],
                    )}
                  </p>
                  <p className="mt-2 text-xs text-text-sub-600">
                    As of{' '}
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeZone: 'UTC',
                    }).format(
                      new Date(account.openingBalanceDate + 'T00:00:00Z'),
                    )}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stroke-soft-200 pt-4">
                    <Link
                      href={'/accounts/' + account.id}
                      className="px-2 text-xs underline underline-offset-4"
                    >
                      Details<span className="sr-only"> {account.name}</span>
                    </Link>
                    {account.archivedAt ? (
                      <Button.Root
                        variant="neutral"
                        mode="ghost"
                        size="small"
                        onClick={() => void changeStatus(account)}
                      >
                        {busy === account.id ? (
                          <RiLoader4Line
                            className="animate-spin"
                            size={16}
                            aria-hidden="true"
                          />
                        ) : (
                          <RiArrowGoBackLine size={16} aria-hidden="true" />
                        )}
                        Restore
                        <span className="sr-only"> {account.name}</span>
                      </Button.Root>
                    ) : confirm === account.id ? (
                      <div className="space-y-3">
                        <p className="text-xs leading-relaxed text-text-sub-600">
                          Archive this account? Its details will be kept, and
                          you can restore it later.
                        </p>
                        <div className="flex gap-2">
                          <Button.Root
                            variant="neutral"
                            mode="stroke"
                            size="small"
                            onClick={() => void changeStatus(account)}
                          >
                            {busy === account.id && (
                              <RiLoader4Line
                                className="animate-spin"
                                size={16}
                                aria-hidden="true"
                              />
                            )}
                            Archive account
                          </Button.Root>
                          <Button.Root
                            variant="neutral"
                            mode="ghost"
                            size="small"
                            onClick={() => setConfirm(null)}
                          >
                            Cancel
                          </Button.Root>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button.Root
                          variant="neutral"
                          mode="ghost"
                          size="small"
                          onClick={(event) => {
                            opener.current = event.currentTarget;
                            setEditor(account);
                            setError('');
                            setNotice('');
                          }}
                        >
                          <RiPencilLine size={16} aria-hidden="true" />
                          Edit<span className="sr-only"> {account.name}</span>
                        </Button.Root>
                        <Button.Root
                          variant="neutral"
                          mode="ghost"
                          size="small"
                          onClick={() => setConfirm(account.id)}
                        >
                          <RiArchiveLine size={16} aria-hidden="true" />
                          Archive
                          <span className="sr-only"> {account.name}</span>
                        </Button.Root>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {page.nextCursor && (
            <Button.Root
              className="mt-6"
              variant="neutral"
              mode="stroke"
              onClick={() => void load(status, true)}
            >
              {busy === 'list' && (
                <RiLoader4Line
                  className="animate-spin"
                  size={18}
                  aria-hidden="true"
                />
              )}
              Load more accounts
            </Button.Root>
          )}
          <p className="mt-6 text-xs leading-relaxed text-text-sub-600">
            Current balances are shown in each account’s own currency.
          </p>
        </>
      </fieldset>
      <AccountEditor
        editor={editor}
        currency={currency}
        currencies={currencies}
        currencyDigits={currencyDigits}
        today={today}
        busy={busy === 'save'}
        error={error}
        opener={opener}
        onSave={save}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
      />
      {!editor && error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-error-base p-4 text-sm text-error-base"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-4 text-sm text-text-sub-600">
        {notice}
      </p>
    </section>
  );
};
export default AccountsWorkspace;

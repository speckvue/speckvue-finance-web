'use client';

import FormDialog from '@/components/shared/form-dialog';
import * as Button from '@/components/ui/button';
import {
  AccountOptions,
  AccountsPage,
  accountsSchema,
} from '@/features/accounts/contracts';
import formatMoney from '@/features/accounts/format-money';
import authenticatedRequest from '@/features/auth/client';
import type { Category } from '@/features/categories/contracts';
import type { PayeesPage } from '@/features/payees/contracts';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import { RiAddLine, RiLoader4Line, RiReceiptLine } from '@remixicon/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { z } from 'zod';
import {
  transactionHistorySchema,
  transactionKinds,
  transactionSchema,
  transactionsSchema,
  type Transaction,
  type TransactionInput,
  type TransactionsPage,
} from '../contracts';
import TransactionForm from './transaction-form';

/** Keeps confirmations separate from reload errors and preserves the create key across uncertain retries. */
const TransactionsWorkspace = ({
  initial,
  accounts,
  payees,
  categories,
  options,
  locale,
  initialAccountId = '',
}: {
  initial: TransactionsPage;
  accounts: AccountsPage;
  payees: PayeesPage;
  categories: Category[];
  options: AccountOptions;
  locale: string;
  initialAccountId?: string;
}) => {
  const router = useRouter();
  const [page, setPage] = useState(initial);
  const [moreAccounts, setMoreAccounts] = useState<AccountsPage | null>(null);
  const choices = moreAccounts ?? accounts;
  const [editor, setEditor] = useState<Transaction | 'new' | null>(null);
  const [confirm, setConfirm] = useState<Transaction | null>(null);
  const [history, setHistory] = useState<{
    transaction: Transaction;
    items: z.infer<typeof transactionHistorySchema>['items'];
    nextRevision: number | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [choicesLoading, setChoicesLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [status, setStatus] = useState('active');
  const [accountId, setAccountId] = useState(initialAccountId);
  const opener = useRef<HTMLButtonElement | null>(null);
  const inFlight = useRef(false);
  const requestId = useRef('');
  const path = (
    nextStatus = status,
    nextAccount = accountId,
    after?: string,
  ) => {
    const query = new URLSearchParams({ status: nextStatus });
    if (nextAccount) query.set('accountId', nextAccount);
    if (after) query.set('after', after);
    return '/transactions?' + query;
  };
  const failure = (reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 401) {
      router.replace('/signin');
      return 'Your session expired. Please signin again.';
    }
    if (reason instanceof ApiError && [400, 404, 409].includes(reason.status))
      return 'The transaction or its selections are no longer valid. Check the date, category amounts and active account, or reload to get the latest revision.';
    return 'Unable to confirm this change. Check the transaction list before starting a new entry. Retrying this entry will not create a duplicate.';
  };
  const loadAccounts = async () => {
    if (inFlight.current || !choices.nextCursor) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest('/accounts?after=' + choices.nextCursor, {
        schema: accountsSchema,
      });
      setMoreAccounts({
        items: [...choices.items, ...result.items],
        nextCursor: result.nextCursor,
      });
    } catch {
      setError('Unable to load more accounts. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const load = async (
    nextStatus = status,
    nextAccount = accountId,
    after?: string,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest(path(nextStatus, nextAccount, after), {
        schema: transactionsSchema,
      });
      setPage((prev) =>
        after ? { ...result, items: [...prev.items, ...result.items] } : result,
      );
      setStatus(nextStatus);
      setAccountId(nextAccount);
      setRefreshFailed(false);
    } catch {
      setError('Unable to load transactions. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const save = async (value: TransactionInput) => {
    if (inFlight.current || !editor) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    let confirmed = false;
    try {
      await authenticatedRequest(
        editor === 'new' ? '/transactions' : '/transactions/' + editor.id,
        {
          method: editor === 'new' ? 'POST' : 'PATCH',
          schema: transactionSchema,
          body:
            editor === 'new'
              ? { ...value, requestId: requestId.current }
              : { ...value, revision: editor.revision },
        },
      );
      confirmed = true;
      setEditor(null);
      setNotice('Transaction saved. Account balances updated.');
      router.refresh();
      setPage(await apiRequest(path(), { schema: transactionsSchema }));
      setRefreshFailed(false);
    } catch (reason) {
      if (confirmed) {
        setPage({ items: [], nextCursor: null });
        setRefreshFailed(true);
        setNotice(
          'Transaction saved. Reload the list to view the latest results.',
        );
      } else setError(failure(reason));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const remove = async () => {
    if (inFlight.current || !confirm) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    let confirmed = false;
    try {
      await authenticatedRequest('/transactions/' + confirm.id, {
        method: 'DELETE',
        body: { revision: confirm.revision },
        schema: transactionSchema,
      });
      confirmed = true;
      setConfirm(null);
      setNotice(
        'Transaction deleted. Its balance effect was reversed; history is retained.',
      );
      router.refresh();
      setPage(await apiRequest(path(), { schema: transactionsSchema }));
      setRefreshFailed(false);
    } catch (reason) {
      if (confirmed) {
        setPage({ items: [], nextCursor: null });
        setRefreshFailed(true);
        setNotice(
          'Transaction deleted. Reload the list to view the latest results.',
        );
      } else setError(failure(reason));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const showHistory = async (transaction: Transaction, before?: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest(
        '/transactions/' +
          transaction.id +
          '/history' +
          (before ? '?before=' + before : ''),
        { schema: transactionHistorySchema },
      );
      setHistory((previous) => ({
        transaction,
        items: before
          ? [...(previous?.items ?? []), ...result.items]
          : result.items,
        nextRevision: result.nextRevision,
      }));
    } catch {
      setError('Unable to load transaction history. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const money = (amount: string, currency: string) =>
    formatMoney(amount, currency, locale, options.currencyDigits[currency]);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value + 'T00:00:00Z'));
  return (
    <section
      className="space-y-6 [&_button]:transition-none [&_input]:transition-none [&_select]:transition-none"
      aria-busy={busy}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Transactions</h1>
          <Link
            href="/transfers"
            className="mt-2 inline-block text-sm underline underline-offset-4"
          >
            Record a transfer between accounts.
          </Link>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-sub-600">
            Record income, expenses and refunds. Every saved entry updates its
            account balance.
          </p>
        </div>
        <Button.Root
          id="transaction-add"
          className="finance-primary"
          disabled={busy || accounts.items.length === 0}
          onClick={(e) => {
            opener.current = e.currentTarget;
            requestId.current = crypto.randomUUID();
            setError('');
            setEditor('new');
          }}
        >
          <RiAddLine size={18} aria-hidden="true" />
          Add transaction
        </Button.Root>
      </div>
      {!accounts.items.length && (
        <p className="rounded-xl bg-bg-white-0 p-5 text-sm">
          Add or restore an account before recording transactions.{' '}
          <Link href="/accounts" className="underline">
            Manage accounts
          </Link>
        </p>
      )}
      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-bg-white-0 p-4">
        <div>
          <label htmlFor="transactions-status" className="account-field-label">
            Show
          </label>
          <select
            id="transactions-status"
            disabled={busy}
            className="account-select"
            value={status}
            onChange={(e) => void load(e.target.value, accountId)}
          >
            <option value="active">Posted transactions</option>
            <option value="deleted">Deleted transactions</option>
          </select>
        </div>
        <div className="min-w-0 sm:min-w-52">
          <label htmlFor="transactions-account" className="account-field-label">
            Account
          </label>
          <select
            id="transactions-account"
            disabled={busy}
            className="account-select"
            value={accountId}
            onChange={(e) => void load(status, e.target.value)}
          >
            <option value="">All accounts</option>
            {choices.items.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.currency}
              </option>
            ))}
            {accountId && !choices.items.some((a) => a.id === accountId) && (
              <option value={accountId}>Selected account</option>
            )}
          </select>
        </div>
        {choices.nextCursor && (
          <Button.Root
            disabled={busy}
            variant="neutral"
            mode="stroke"
            onClick={() => void loadAccounts()}
          >
            Load more accounts
          </Button.Root>
        )}
        <Button.Root
          disabled={busy}
          variant="neutral"
          mode="stroke"
          onClick={() => void load()}
        >
          Reload
        </Button.Root>
      </div>
      {busy && (
        <p role="status" className="flex items-center gap-2 text-sm">
          <RiLoader4Line
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />
          Updating transactions…
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-bg-white-0 p-4 text-sm">
          {notice}
        </p>
      )}
      {error && !editor && !confirm && (
        <p role="alert" className="text-sm text-error-base">
          {error}
        </p>
      )}
      <div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-2xl bg-bg-white-0">
        {page.items.map((t) => (
          <article
            key={t.id}
            data-transaction-id={t.id}
            className="flex min-w-0 flex-col gap-4 p-5 lg:flex-row lg:items-start"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="min-w-0 text-base font-medium break-words">
                  {t.payeeName ?? transactionKinds[t.kind]}
                </h2>
                <p className="max-w-full shrink-0 text-lg font-medium [overflow-wrap:anywhere] tabular-nums">
                  {t.kind === 'expense' ? '−' : '+'}
                  {money(t.amount, t.currency)}
                </p>
              </div>
              <p className="mt-1 text-sm break-words text-text-sub-600">
                {date(t.date)} · {t.accountName} · {transactionKinds[t.kind]}
                {t.deletedAt ? ' · Deleted' : ''}
              </p>
              <p className="mt-2 text-sm break-words">
                {t.splits
                  .map(
                    (s) =>
                      (s.categoryName ?? 'Uncategorized') +
                      (t.splits.length > 1
                        ? ' ' + money(s.amount, t.currency)
                        : ''),
                  )
                  .join(' · ')}
              </p>
              {t.notes && (
                <p className="mt-2 text-sm break-words whitespace-pre-wrap text-text-sub-600">
                  {t.notes}
                </p>
              )}
              {t.accountArchived && (
                <p className="mt-2 text-xs text-text-sub-600">
                  This account is archived.{' '}
                  <Link href={'/accounts/' + t.accountId} className="underline">
                    Restore the account
                  </Link>{' '}
                  before changing its transactions.
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {!t.deletedAt && !t.accountArchived && (
                <>
                  <Button.Root
                    size="xsmall"
                    variant="neutral"
                    mode="stroke"
                    disabled={busy}
                    aria-label="Edit transaction"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setError('');
                      setEditor(t);
                    }}
                  >
                    Edit
                  </Button.Root>
                  <Button.Root
                    size="xsmall"
                    variant="neutral"
                    mode="stroke"
                    disabled={busy}
                    aria-label="Delete transaction"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setError('');
                      setConfirm(t);
                    }}
                  >
                    Delete
                  </Button.Root>
                </>
              )}
              <Button.Root
                size="xsmall"
                variant="neutral"
                mode="stroke"
                disabled={busy}
                aria-label="View transaction history"
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  void showHistory(t);
                }}
              >
                History
              </Button.Root>
            </div>
          </article>
        ))}
        {!page.items.length && (
          <div className="p-8">
            <RiReceiptLine
              size={28}
              className="mb-4 text-text-sub-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-medium">
              {refreshFailed
                ? 'Reload to view updated results'
                : status === 'deleted'
                  ? 'No deleted transactions'
                  : 'No transactions yet'}
            </h2>
            <p className="mt-2 text-sm text-text-sub-600">
              {refreshFailed
                ? 'Your change was saved. Reload the list to continue.'
                : status === 'deleted'
                  ? 'Deleted entries and their histories will appear here.'
                  : 'Add an income, expense or refund to start your transaction history.'}
            </p>
          </div>
        )}
      </div>
      {page.nextCursor && (
        <Button.Root
          disabled={busy}
          variant="neutral"
          mode="stroke"
          onClick={() => void load(status, accountId, page.nextCursor!)}
        >
          Load more transactions
        </Button.Root>
      )}
      <FormDialog
        open={editor !== null}
        title={editor === 'new' ? 'Add transaction' : 'Edit transaction'}
        description="Choose the account, amount and category allocation. All amounts use the account’s currency."
        busy={busy || choicesLoading}
        error={error}
        initialFocusId="transaction-kind"
        fallbackFocusId="transaction-add"
        opener={opener}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
      >
        {editor && (
          <TransactionForm
            key={editor === 'new' ? 'new' : editor.id}
            initial={editor === 'new' ? null : editor}
            accounts={choices}
            payees={payees}
            categories={categories}
            options={options}
            busy={busy}
            onLoading={setChoicesLoading}
            onSave={save}
            onCancel={() => {
              setEditor(null);
              setError('');
            }}
          />
        )}
      </FormDialog>
      <FormDialog
        open={confirm !== null}
        title="Delete transaction"
        description="This reverses the transaction’s effect on the account balance. The entry and its revision history remain available under Deleted transactions."
        busy={busy}
        error={error}
        initialFocusId="transaction-delete-cancel"
        fallbackFocusId="transaction-add"
        opener={opener}
        onClose={() => {
          setConfirm(null);
          setError('');
        }}
      >
        <fieldset disabled={busy} className="min-w-0">
          <legend className="sr-only">Confirm deletion</legend>
          {confirm && (
            <p className="mb-5 text-sm">
              {transactionKinds[confirm.kind]} ·{' '}
              {money(confirm.amount, confirm.currency)} · {date(confirm.date)}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              id="transaction-delete-cancel"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type="button"
              className="finance-primary"
              onClick={() => void remove()}
            >
              {busy && (
                <RiLoader4Line
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              Confirm deletion
            </Button.Root>
          </div>
        </fieldset>
      </FormDialog>
      <FormDialog
        open={history !== null}
        title="Transaction history"
        description="Saved snapshots show the values and names recorded at each change. Newest changes appear first."
        busy={busy}
        error={error}
        initialFocusId="transaction-history-close"
        fallbackFocusId="transaction-add"
        opener={opener}
        onClose={() => setHistory(null)}
      >
        <ol className="space-y-4">
          {history?.items.map((h) => (
            <li
              key={h.revision}
              className="rounded-xl border border-stroke-soft-200 p-4"
            >
              <p className="text-sm font-medium capitalize">
                {h.action} · Revision {h.revision}
              </p>
              <p className="mt-1 text-xs text-text-sub-600">
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(h.createdAt))}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-text-sub-600">Transaction</dt>
                  <dd>
                    {transactionKinds[h.snapshot.kind]} ·{' '}
                    {money(h.snapshot.amount, h.snapshot.currency)} ·{' '}
                    {date(h.snapshot.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-sub-600">Account / payee</dt>
                  <dd className="break-words">
                    {h.snapshot.accountName} /{' '}
                    {h.snapshot.payeeName ?? 'No payee'}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-sub-600">Categories</dt>
                  <dd className="break-words">
                    {h.snapshot.splits
                      .map(
                        (s) =>
                          (s.categoryName ?? 'Uncategorized') +
                          ' ' +
                          money(s.amount, h.snapshot.currency),
                      )
                      .join(' · ')}
                  </dd>
                </div>
                {h.snapshot.notes && (
                  <div>
                    <dt className="text-text-sub-600">Notes</dt>
                    <dd className="break-words whitespace-pre-wrap">
                      {h.snapshot.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ol>
        {history?.nextRevision && (
          <Button.Root
            disabled={busy}
            type="button"
            variant="neutral"
            mode="stroke"
            className="mt-5"
            onClick={() =>
              void showHistory(history.transaction, history.nextRevision!)
            }
          >
            {busy && (
              <RiLoader4Line
                className="animate-spin"
                size={18}
                aria-hidden="true"
              />
            )}
            Load older changes
          </Button.Root>
        )}
        <Button.Root
          id="transaction-history-close"
          disabled={busy}
          type="button"
          className="mt-5"
          variant="neutral"
          mode="stroke"
          onClick={() => setHistory(null)}
        >
          Close history
        </Button.Root>
      </FormDialog>
    </section>
  );
};
export default TransactionsWorkspace;

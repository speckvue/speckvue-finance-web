'use client';

import FormDialog from '@/components/shared/form-dialog';
import * as Button from '@/components/ui/button';
import {
  accountsSchema,
  type AccountOptions,
  type AccountsPage,
} from '@/features/accounts/contracts';
import authenticatedRequest from '@/features/auth/client';
import type { Category } from '@/features/categories/contracts';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import {
  RiAddLine,
  RiArrowLeftRightLine,
  RiLoader4Line,
} from '@remixicon/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { z } from 'zod';
import {
  transferHistorySchema,
  transferSchema,
  transfersSchema,
  type Transfer,
  type TransferInput,
  type TransfersPage,
} from '../contracts';
import TransferDetails from './transfer-details';
import TransferForm from './transfer-form';

/** Sends one aggregate mutation and refreshes both linked sides without retrying a confirmed save. */
const TransfersWorkspace = ({
  initial,
  accounts,
  categories,
  options,
  locale,
  initialAccountId = '',
}: {
  initial: TransfersPage;
  accounts: AccountsPage;
  categories: Category[];
  options: AccountOptions;
  locale: string;
  initialAccountId?: string;
}) => {
  const router = useRouter();
  const [page, setPage] = useState(initial);
  const [moreAccounts, setMoreAccounts] = useState<AccountsPage | null>(null);
  const choices = moreAccounts ?? accounts;
  const [editor, setEditor] = useState<Transfer | 'new' | null>(null);
  const [confirm, setConfirm] = useState<Transfer | null>(null);
  const [history, setHistory] = useState<
    ({ transfer: Transfer } & z.infer<typeof transferHistorySchema>) | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [status, setStatus] = useState('active');
  const [accountId, setAccountId] = useState(initialAccountId);
  const opener = useRef<HTMLButtonElement | null>(null),
    inFlight = useRef(false),
    requestId = useRef('');
  const path = (
    nextStatus = status,
    nextAccount = accountId,
    after?: string,
  ) => {
    const query = new URLSearchParams({ status: nextStatus });
    if (nextAccount) query.set('accountId', nextAccount);
    if (after) query.set('after', after);
    return '/transfers?' + query;
  };
  const fail = (reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 401) {
      router.replace('/signin');
      return 'Your session expired. Please signin again.';
    }
    if (reason instanceof ApiError && [400, 404, 409].includes(reason.status))
      return 'The transfer or its selections have changed. Check the amounts, fee, date and active accounts, or reload the latest revision.';
    return 'Unable to confirm this change. Check the list before starting another transfer. Retrying this entry will not create a duplicate.';
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
        schema: transfersSchema,
      });
      setPage((previous) =>
        after
          ? { ...result, items: [...previous.items, ...result.items] }
          : result,
      );
      setStatus(nextStatus);
      setAccountId(nextAccount);
      setRefreshFailed(false);
    } catch {
      setError('Unable to load transfers. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
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
  const save = async (value: TransferInput) => {
    if (inFlight.current || !editor) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    let confirmed = false;
    try {
      await authenticatedRequest(
        editor === 'new' ? '/transfers' : '/transfers/' + editor.id,
        {
          method: editor === 'new' ? 'POST' : 'PATCH',
          schema: transferSchema,
          body:
            editor === 'new'
              ? { ...value, requestId: requestId.current }
              : { ...value, revision: editor.revision },
        },
      );
      confirmed = true;
      setEditor(null);
      setStatus('active');
      const nextAccount =
        accountId &&
        ![
          value.sourceAccountId,
          value.destinationAccountId,
          value.feeAccountId,
        ].includes(accountId)
          ? value.sourceAccountId
          : accountId;
      setAccountId(nextAccount);
      setNotice(
        'Transfer saved. Both accounts and any fee were updated together.',
      );
      router.refresh();
      setPage(
        await apiRequest(path('active', nextAccount), {
          schema: transfersSchema,
        }),
      );
      setRefreshFailed(false);
    } catch (reason) {
      if (confirmed) {
        setPage({ items: [], nextCursor: null });
        setRefreshFailed(true);
        setNotice(
          'Transfer saved. Reload the list to view the latest results.',
        );
      } else setError(fail(reason));
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
      await authenticatedRequest('/transfers/' + confirm.id, {
        method: 'DELETE',
        body: { revision: confirm.revision },
        schema: transferSchema,
      });
      confirmed = true;
      setConfirm(null);
      setNotice(
        'Transfer deleted. Both principal movements and the fee were reversed; history is retained.',
      );
      router.refresh();
      setPage(await apiRequest(path(), { schema: transfersSchema }));
      setRefreshFailed(false);
    } catch (reason) {
      if (confirmed) {
        setPage({ items: [], nextCursor: null });
        setRefreshFailed(true);
        setNotice(
          'Transfer deleted. Reload the list to view the latest results.',
        );
      } else setError(fail(reason));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const showHistory = async (transfer: Transfer, before?: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest(
        '/transfers/' +
          transfer.id +
          '/history' +
          (before ? '?before=' + before : ''),
        { schema: transferHistorySchema },
      );
      setHistory((previous) => ({
        transfer,
        ...result,
        items: before
          ? [...(previous?.items ?? []), ...result.items]
          : result.items,
      }));
    } catch {
      setError('Unable to load transfer history. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value + 'T00:00:00Z'));
  return (
    <section
      aria-busy={busy}
      className="space-y-6 [&_button]:transition-none [&_input]:transition-none [&_select]:transition-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium">Transfers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-sub-600">
            Move money between your accounts. The linked principal movements
            stay separate from income and expenses.
          </p>
        </div>
        <Button.Root
          id="transfer-add"
          className="finance-primary"
          disabled={busy}
          onClick={(e) => {
            opener.current = e.currentTarget;
            requestId.current = crypto.randomUUID();
            setError('');
            setEditor('new');
          }}
        >
          <RiAddLine size={18} aria-hidden="true" />
          Add transfer
        </Button.Root>
      </div>
      {choices.items.length < 2 && (
        <p className="rounded-xl bg-bg-white-0 p-5 text-sm">
          You need two active accounts to record a transfer.{' '}
          <Link href="/accounts" className="underline">
            Manage accounts
          </Link>
        </p>
      )}
      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-bg-white-0 p-4">
        <div>
          <label htmlFor="transfers-status" className="account-field-label">
            Show
          </label>
          <select
            id="transfers-status"
            className="account-select"
            disabled={busy}
            value={status}
            onChange={(e) => void load(e.target.value, accountId)}
          >
            <option value="active">Posted transfers</option>
            <option value="deleted">Deleted transfers</option>
          </select>
        </div>
        <div className="min-w-0 sm:min-w-52">
          <label htmlFor="transfers-account" className="account-field-label">
            Account
          </label>
          <select
            id="transfers-account"
            className="account-select"
            disabled={busy}
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
            variant="neutral"
            mode="stroke"
            disabled={busy}
            onClick={() => void loadAccounts()}
          >
            Load more accounts
          </Button.Root>
        )}
        <Button.Root
          variant="neutral"
          mode="stroke"
          disabled={busy}
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
          Updating transfers…
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-bg-white-0 p-4 text-sm">
          {notice}
        </p>
      )}
      {error && !editor && !confirm && !history && (
        <p role="alert" className="text-sm text-error-base">
          {error}
        </p>
      )}
      <div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-2xl bg-bg-white-0">
        {page.items.map((t) => (
          <article
            key={t.id}
            data-transfer-id={t.id}
            className="flex min-w-0 flex-col gap-4 p-5 lg:flex-row lg:items-start"
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-medium [overflow-wrap:anywhere]">
                {t.sourceAccountName} → {t.destinationAccountName}
              </h2>
              <p className="mt-1 mb-4 text-sm text-text-sub-600">
                {date(t.date)} · Transfer{t.deletedAt ? ' · Deleted' : ''}
              </p>
              <TransferDetails
                transfer={t}
                locale={locale}
                currencyDigits={options.currencyDigits}
              />
              {t.accountsArchived && (
                <p className="mt-3 text-xs text-text-sub-600">
                  An involved account is archived.{' '}
                  <Link href="/accounts" className="underline">
                    Restore accounts
                  </Link>{' '}
                  before changing this transfer.
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {!t.deletedAt && !t.accountsArchived && (
                <>
                  <Button.Root
                    size="xsmall"
                    variant="neutral"
                    mode="stroke"
                    disabled={busy}
                    aria-label="Edit transfer"
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
                    aria-label="Delete transfer"
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
                aria-label="View transfer history"
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
            <RiArrowLeftRightLine
              size={28}
              className="mb-4 text-text-sub-600"
              aria-hidden="true"
            />
            <h2 className="text-lg font-medium">
              {refreshFailed
                ? 'Reload to view updated results'
                : status === 'deleted'
                  ? 'No deleted transfers'
                  : 'No transfers yet'}
            </h2>
            <p className="mt-2 text-sm text-text-sub-600">
              {refreshFailed
                ? 'Your change was saved. Reload the list to continue.'
                : status === 'deleted'
                  ? 'Deleted transfers keep both sides and their change history.'
                  : 'Record a movement between two accounts, including any separate fee.'}
            </p>
          </div>
        )}
      </div>
      {page.nextCursor && (
        <Button.Root
          variant="neutral"
          mode="stroke"
          disabled={busy}
          onClick={() => void load(status, accountId, page.nextCursor!)}
        >
          Load more transfers
        </Button.Root>
      )}
      <FormDialog
        open={editor !== null}
        title={editor === 'new' ? 'Add transfer' : 'Edit transfer'}
        description="Both account movements and any fee are saved together. Enter actual amounts in each account’s currency."
        busy={busy || loadingChoices}
        error={error}
        initialFocusId="transfer-source"
        fallbackFocusId="transfer-add"
        opener={opener}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
      >
        {editor && (
          <TransferForm
            key={editor === 'new' ? 'new' : editor.id}
            initial={editor === 'new' ? null : editor}
            accounts={choices}
            categories={categories}
            options={options}
            locale={locale}
            busy={busy}
            onLoading={setLoadingChoices}
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
        title="Delete transfer"
        description="This reverses both principal movements and the separate fee together. The transfer and its history remain available under Deleted transfers."
        busy={busy}
        error={error}
        initialFocusId="transfer-delete-cancel"
        fallbackFocusId="transfer-add"
        opener={opener}
        onClose={() => {
          setConfirm(null);
          setError('');
        }}
      >
        <fieldset disabled={busy} className="min-w-0">
          <legend className="sr-only">Confirm transfer deletion</legend>
          {confirm && (
            <TransferDetails
              transfer={confirm}
              locale={locale}
              currencyDigits={options.currencyDigits}
            />
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button.Root
              id="transfer-delete-cancel"
              type="button"
              variant="neutral"
              mode="stroke"
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
        title="Transfer history"
        description="Each snapshot keeps the linked accounts, amounts, effective rate and fee saved at that time. Newest changes appear first."
        busy={busy}
        error={error}
        initialFocusId="transfer-history-close"
        fallbackFocusId="transfer-add"
        opener={opener}
        onClose={() => {
          setHistory(null);
          setError('');
        }}
      >
        <ol className="space-y-4">
          {history?.items.map((h) => (
            <li
              key={h.revision}
              className="rounded-xl border border-stroke-soft-200 p-4"
            >
              <h3 className="text-sm font-medium capitalize">
                {h.action} · Revision {h.revision}
              </h3>
              <p className="mt-1 mb-4 text-xs text-text-sub-600">
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(h.createdAt))}{' '}
                · Transfer date: {date(h.snapshot.date)}
              </p>
              <TransferDetails
                transfer={h.snapshot}
                locale={locale}
                currencyDigits={options.currencyDigits}
              />
            </li>
          ))}
        </ol>
        {history?.nextRevision && (
          <Button.Root
            type="button"
            disabled={busy}
            variant="neutral"
            mode="stroke"
            className="mt-5"
            onClick={() =>
              void showHistory(history.transfer, history.nextRevision!)
            }
          >
            {busy && (
              <RiLoader4Line
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            Load older changes
          </Button.Root>
        )}
        <Button.Root
          id="transfer-history-close"
          type="button"
          disabled={busy}
          variant="neutral"
          mode="stroke"
          className="mt-5"
          onClick={() => setHistory(null)}
        >
          Close history
        </Button.Root>
      </FormDialog>
    </section>
  );
};
export default TransfersWorkspace;

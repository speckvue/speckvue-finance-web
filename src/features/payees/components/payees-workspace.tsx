'use client';

import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import {
  RiAddLine,
  RiBuildingLine,
  RiContactsBookLine,
  RiLoader4Line,
  RiStore2Line,
  RiUserLine,
} from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  payeeKinds,
  payeeSchema,
  payeesSchema,
  type Payee,
  type PayeeFilters,
  type PayeeInput,
  type PayeesPage,
} from '../contracts';
import payeesPath from '../payees-path';
import MergePayeesDialog from './merge-payees-dialog';
import PayeeEditor from './payee-editor';

const initialFilters: PayeeFilters = { status: 'active', kind: 'all', q: '' };
const icons = {
  person: RiUserLine,
  merchant: RiStore2Line,
  organization: RiBuildingLine,
};

/** Separates saved mutations from refresh failures so a confirmed save is never offered as a retry. */
const PayeesWorkspace = ({ initial }: { initial: PayeesPage }) => {
  const router = useRouter();
  const [page, setPage] = useState(initial);
  const [filters, setFilters] = useState(initialFilters);
  const [searchText, setSearchText] = useState('');
  const [busy, setBusy] = useState<'load' | 'save' | 'merge' | 'status' | null>(
    null,
  );
  const [editor, setEditor] = useState<Payee | 'new' | null>(null);
  const [source, setSource] = useState<Payee | null>(null);
  const [confirm, setConfirm] = useState<Payee | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshFailed, setRefreshFailed] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const inFlight = useRef(false);
  const fail = (reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 401) {
      router.replace('/signin');
      return;
    }
    setError(
      reason instanceof ApiError && [404, 409].includes(reason.status)
        ? 'This payee or merge target has changed or is unavailable. Reload payees or search for an active target and try again.'
        : reason instanceof ApiError && reason.status === 400
          ? 'Check the payee details and try again.'
          : 'Unable to complete this request. Your changes have not been confirmed. Please try again.',
    );
  };
  const load = async (next: PayeeFilters, more = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy('load');
    setError('');
    setNotice('');
    try {
      const result = await apiRequest(
        payeesPath(next, more ? page.nextCursor : null),
        { schema: payeesSchema },
      );
      setPage((previous) =>
        more
          ? {
              ...result,
              items: [
                ...new Map(
                  [...previous.items, ...result.items].map((item) => [
                    item.id,
                    item,
                  ]),
                ).values(),
              ],
            }
          : result,
      );
      setFilters(next);
      setRefreshFailed(false);
      setSearchText(next.q);
      setConfirm(null);
    } catch (reason) {
      fail(reason);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };
  const mutate = async (
    path: string,
    method: 'POST' | 'PATCH',
    body: unknown,
    operation: 'save' | 'merge' | 'status',
    message: string,
    removedId?: string,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(operation);
    setError('');
    setNotice('');
    try {
      const saved = await authenticatedRequest(path, {
        method,
        body,
        schema: payeeSchema,
      });
      const nextFilters = path === '/payees' ? initialFilters : filters;
      setEditor(null);
      setSource(null);
      setConfirm(null);
      setNotice(message);
      setFilters(nextFilters);
      setSearchText(nextFilters.q);
      setPage((previous) => ({
        ...previous,
        items: previous.items
          .filter((item) => item.id !== removedId)
          .map((item) => (item.id === saved.id ? saved : item)),
      }));
      try {
        setPage(
          await apiRequest(payeesPath(nextFilters), { schema: payeesSchema }),
        );
        setRefreshFailed(false);
      } catch {
        setPage({ items: [], nextCursor: null });
        setRefreshFailed(true);
        setError(
          'Your change was saved, but the list could not be refreshed. Reload payees to see the latest results.',
        );
      }
    } catch (reason) {
      fail(reason);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };
  const save = (value: PayeeInput) =>
    mutate(
      '/payees' + (editor && editor !== 'new' ? '/' + editor.id : ''),
      editor === 'new' ? 'POST' : 'PATCH',
      value,
      'save',
      editor === 'new' ? 'Payee added.' : 'Payee updated.',
    );
  const openEditor = (button: HTMLButtonElement, value: Payee | 'new') => {
    opener.current = button;
    setEditor(value);
    setError('');
    setNotice('');
  };
  return (
    <section
      aria-busy={busy !== null}
      className="[&_button]:transition-none [&_input]:transition-none [&_select]:transition-none"
    >
      <fieldset disabled={busy !== null} className="min-w-0">
        <legend className="sr-only">Manage payees</legend>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Payees</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-sub-600">
              Keep people, merchants and organizations organized in one place.
            </p>
          </div>
          <Button.Root
            id="payee-add"
            className="finance-primary"
            onClick={(event) => openEditor(event.currentTarget, 'new')}
          >
            <RiAddLine size={18} aria-hidden="true" />
            Add payee
          </Button.Root>
        </div>
        <form
          className="mb-5"
          onSubmit={(event) => {
            event.preventDefault();
            void load({ ...filters, q: searchText.trim() });
          }}
        >
          <label htmlFor="payee-search" className="account-field-label">
            Search payees
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="payee-search"
              type="search"
              maxLength={100}
              className="account-select min-w-0 flex-1"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Name, notes or a merged name"
            />
            <Button.Root type="submit" variant="neutral" mode="stroke">
              Search
            </Button.Root>
            {filters.q && (
              <Button.Root
                type="button"
                variant="neutral"
                mode="ghost"
                onClick={() => void load({ ...filters, q: '' })}
              >
                Clear search
              </Button.Root>
            )}
          </div>
        </form>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-stroke-soft-200 pb-4">
          <div
            role="group"
            aria-label="Payee status"
            className="flex flex-wrap gap-2"
          >
            {(['active', 'archived', 'merged'] as const).map((status) => (
              <Button.Root
                key={status}
                className="transition-none"
                size="small"
                variant="neutral"
                mode={filters.status === status ? 'filled' : 'ghost'}
                aria-pressed={filters.status === status}
                onClick={() => void load({ ...filters, status })}
              >
                {status[0]!.toUpperCase() + status.slice(1)}
              </Button.Root>
            ))}
          </div>
          <div>
            <label htmlFor="payee-filter-kind" className="account-field-label">
              Payee type
            </label>
            <select
              id="payee-filter-kind"
              className="account-select"
              value={filters.kind}
              onChange={(event) =>
                void load({
                  ...filters,
                  kind: event.target.value as PayeeFilters['kind'],
                })
              }
            >
              <option value="all">All types</option>
              {Object.entries(payeeKinds).map(([kind, label]) => (
                <option key={kind} value={kind}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="text-xs text-text-sub-600 underline underline-offset-4 disabled:opacity-50"
            onClick={() => void load(filters)}
          >
            Reload payees
          </button>
        </div>
        {filters.q && (
          <p className="mb-4 text-sm break-words text-text-sub-600">
            Results for “{filters.q}”
          </p>
        )}
        {busy && !editor && !source && (
          <p
            role="status"
            className="mb-5 flex items-center gap-2 text-sm text-text-sub-600"
          >
            <RiLoader4Line
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
            {busy === 'load'
              ? 'Loading payees…'
              : busy === 'status'
                ? 'Updating payee…'
                : 'Refreshing payees…'}
          </p>
        )}
        {confirm && (
          <div className="mb-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
            <h2 className="text-base font-medium break-words">
              Archive {confirm.name}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-sub-600">
              Its details and merged names will be kept. Restore it whenever you
              need to use it again.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button.Root
                variant="neutral"
                mode="stroke"
                onClick={() =>
                  void mutate(
                    '/payees/' + confirm.id + '/archive',
                    'POST',
                    {},
                    'status',
                    'Payee archived.',
                  )
                }
              >
                Confirm archive
              </Button.Root>
              <Button.Root
                variant="neutral"
                mode="ghost"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </Button.Root>
            </div>
          </div>
        )}
        {refreshFailed ? (
          <div className="rounded-2xl bg-bg-white-0 px-6 py-12">
            <h2 className="text-xl font-medium">
              Reload payees to view updated results
            </h2>
            <p className="mt-3 text-sm text-text-sub-600">
              Your change is saved. Reloading the list will not repeat it.
            </p>
          </div>
        ) : page.items.length ? (
          <ul className="divide-y divide-stroke-soft-200 rounded-2xl bg-bg-white-0">
            {page.items.map((item) => {
              const Icon = icons[item.kind];
              return (
                <li
                  key={item.id}
                  data-payee-id={item.id}
                  className="flex flex-col items-stretch gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 text-text-sub-600">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-sans text-base font-medium break-words">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-xs text-text-sub-600">
                        {payeeKinds[item.kind]}
                      </p>
                      {item.notes && (
                        <p className="mt-3 text-sm break-words whitespace-pre-wrap text-text-sub-600">
                          {item.notes}
                        </p>
                      )}
                      {item.mergedIntoId ? (
                        <p className="mt-3 text-xs break-words text-text-sub-600">
                          Merged into {item.mergedIntoName}. This source is
                          read-only.
                        </p>
                      ) : (
                        item.mergedNameCount > 0 && (
                          <p className="mt-3 text-xs text-text-sub-600">
                            {item.mergedNameCount} merged{' '}
                            {item.mergedNameCount === 1 ? 'name' : 'names'} ·
                            Searchable under this payee
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  {!item.mergedIntoId && (
                    <div className="flex shrink-0 flex-wrap items-center gap-1">
                      {item.archivedAt ? (
                        <Button.Root
                          size="small"
                          variant="neutral"
                          mode="stroke"
                          aria-label={'Restore ' + item.name}
                          onClick={() =>
                            void mutate(
                              '/payees/' + item.id + '/restore',
                              'POST',
                              {},
                              'status',
                              'Payee restored.',
                            )
                          }
                        >
                          Restore
                        </Button.Root>
                      ) : (
                        <>
                          <Button.Root
                            size="small"
                            variant="neutral"
                            mode="ghost"
                            aria-label={'Edit ' + item.name}
                            onClick={(event) =>
                              openEditor(event.currentTarget, item)
                            }
                          >
                            Edit
                          </Button.Root>
                          <Button.Root
                            size="small"
                            variant="neutral"
                            mode="ghost"
                            aria-label={'Archive ' + item.name}
                            onClick={() => {
                              setConfirm(item);
                              setError('');
                              setNotice('');
                            }}
                          >
                            Archive
                          </Button.Root>
                        </>
                      )}
                      <Button.Root
                        size="small"
                        variant="neutral"
                        mode="ghost"
                        aria-label={'Merge ' + item.name}
                        onClick={(event) => {
                          opener.current = event.currentTarget;
                          setSource(item);
                          setError('');
                          setNotice('');
                        }}
                      >
                        Merge
                      </Button.Root>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl bg-bg-white-0 px-6 py-14 text-center">
            <RiContactsBookLine
              size={32}
              className="mx-auto mb-4 text-text-sub-600"
              aria-hidden="true"
            />
            <h2 className="text-xl font-medium">
              {filters.q || filters.kind !== 'all'
                ? 'No matching payees'
                : filters.status === 'active'
                  ? 'Add your first payee'
                  : filters.status === 'archived'
                    ? 'No archived payees'
                    : 'No merged payees'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-sub-600">
              {filters.q || filters.kind !== 'all'
                ? 'Try another name, change the type or clear the search.'
                : 'Save the names you use, and merge duplicates when you find them.'}
            </p>
          </div>
        )}
        {page.nextCursor && (
          <Button.Root
            className="mt-6"
            variant="neutral"
            mode="stroke"
            onClick={() => void load(filters, true)}
          >
            Load more payees
          </Button.Root>
        )}
        <p className="mt-6 text-xs text-text-sub-600">
          {page.items.length} shown · Newest first · Search also finds merged
          names
        </p>
      </fieldset>
      <PayeeEditor
        editor={editor}
        defaultKind={filters.kind === 'all' ? 'merchant' : filters.kind}
        busy={busy === 'save'}
        error={error}
        opener={opener}
        onSave={save}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
      />
      {source && (
        <MergePayeesDialog
          source={source}
          busy={busy === 'merge'}
          error={error}
          opener={opener}
          onMerge={(target) =>
            mutate(
              '/payees/' + source.id + '/merge',
              'POST',
              { targetId: target.id },
              'merge',
              'Payees merged. The surviving payee keeps its original details.',
              source.id,
            )
          }
          onClose={() => {
            setSource(null);
            setError('');
          }}
        />
      )}
      {!editor && !source && error && (
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
export default PayeesWorkspace;

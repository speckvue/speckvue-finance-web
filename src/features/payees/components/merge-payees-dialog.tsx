'use client';

import FormDialog from '@/components/shared/form-dialog';
import * as Button from '@/components/ui/button';
import apiRequest from '@/lib/api/client';
import { RiLoader4Line } from '@remixicon/react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  payeeKinds,
  payeesSchema,
  type Payee,
  type PayeesPage,
} from '../contracts';
import payeesPath from '../payees-path';

/** Reviews the survivor explicitly and keeps its details intact when merging duplicates. */
const MergePayeesDialog = ({
  source,
  busy,
  error,
  opener,
  onMerge,
  onClose,
}: {
  source: Payee;
  busy: boolean;
  error: string;
  opener: RefObject<HTMLButtonElement | null>;
  onMerge: (target: Payee) => Promise<void>;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [page, setPage] = useState<PayeesPage>({ items: [], nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [target, setTarget] = useState<Payee | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const loadingRef = useRef(false);
  useEffect(() => {
    const abort = new AbortController();
    apiRequest(
      payeesPath({ status: 'active', kind: 'all', q: '' }, null, source.id),
      { schema: payeesSchema, signal: abort.signal },
    )
      .then((result) => {
        if (!abort.signal.aborted) setPage(result);
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setSearchError(
            'Unable to load active payees. Search again to retry.',
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [source.id]);
  const search = async (more = false) => {
    if (loading || busy || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setSearchError('');
    if (!more) {
      setTarget(null);
      setConfirmed(false);
    }
    const nextQuery = more ? appliedQuery : query;
    try {
      const result = await apiRequest(
        payeesPath(
          { status: 'active', kind: 'all', q: nextQuery },
          more ? page.nextCursor : null,
          source.id,
        ),
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
      setAppliedQuery(nextQuery);
    } catch {
      setSearchError('Unable to search active payees. Please try again.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };
  const pending = busy || loading;
  return (
    <FormDialog
      open
      title="Merge payees"
      description="Choose the payee to keep. Its name, type and notes will stay unchanged."
      busy={pending}
      error={error || searchError}
      initialFocusId="payee-merge-search"
      opener={opener}
      onClose={onClose}
    >
      <p className="mb-5 text-sm leading-relaxed break-words">
        Merge <strong>{source.name}</strong> ({payeeKinds[source.kind]}) into
        another active payee. The source remains read-only in Merged, with its
        notes and old name preserved.
      </p>
      <form
        className="mb-5"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <fieldset disabled={pending} className="min-w-0">
          <legend className="sr-only">Find a surviving payee</legend>
          <label htmlFor="payee-merge-search" className="account-field-label">
            Search active payees
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="payee-merge-search"
              className="account-select min-w-0 flex-1"
              maxLength={100}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button.Root type="submit" variant="neutral" mode="stroke">
              Search targets
            </Button.Root>
          </div>
        </fieldset>
      </form>
      {loading && (
        <p
          role="status"
          className="mb-4 flex items-center gap-2 text-sm text-text-sub-600"
        >
          <RiLoader4Line
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />
          Loading active payees…
        </p>
      )}
      <fieldset disabled={pending} className="min-w-0 space-y-3">
        <legend className="mb-3 text-sm font-medium">Payee to keep</legend>
        {page.items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-stroke-soft-200 p-3"
          >
            <input
              type="radio"
              name="merge-target"
              className="mt-1 shrink-0"
              value={item.id}
              checked={target?.id === item.id}
              onChange={() => {
                setTarget(item);
                setConfirmed(false);
              }}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium break-words">
                {item.name}
              </span>
              <span className="mt-1 block text-xs text-text-sub-600">
                {payeeKinds[item.kind]}
              </span>
              {item.notes && (
                <span className="mt-2 block text-xs break-words whitespace-pre-wrap text-text-sub-600">
                  {item.notes}
                </span>
              )}
            </span>
          </label>
        ))}
        {!page.items.length && !loading && (
          <p className="text-sm text-text-sub-600">
            No matching active payees. Create or restore a different payee
            first, or change the search.
          </p>
        )}
        {page.nextCursor && (
          <Button.Root
            type="button"
            variant="neutral"
            mode="stroke"
            size="small"
            onClick={() => void search(true)}
          >
            Load more targets
          </Button.Root>
        )}
        {target && (
          <div className="rounded-xl bg-bg-weak-50 p-4">
            <p className="text-sm leading-relaxed break-words">
              <strong>{target.name}</strong> will survive. {source.name} and its
              merged names will point to this payee. This merge cannot be
              undone.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 shrink-0"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              I understand this merge cannot be undone.
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button.Root
            type="button"
            className="finance-primary"
            disabled={pending || !target || !confirmed}
            onClick={() => {
              if (target && confirmed && !pending) void onMerge(target);
            }}
          >
            {busy && (
              <RiLoader4Line
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {busy ? 'Merging…' : 'Confirm merge'}
          </Button.Root>
          <Button.Root
            type="button"
            variant="neutral"
            mode="stroke"
            onClick={onClose}
          >
            Cancel
          </Button.Root>
        </div>
      </fieldset>
    </FormDialog>
  );
};
export default MergePayeesDialog;

'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import {
  accountsSchema,
  type AccountOptions,
  type AccountsPage,
} from '@/features/accounts/contracts';
import type { Category } from '@/features/categories/contracts';
import { payeesSchema, type PayeesPage } from '@/features/payees/contracts';
import apiRequest from '@/lib/api/client';
import { RiLoader4Line } from '@remixicon/react';
import { useState } from 'react';
import {
  transactionKinds,
  validateTransaction,
  type Transaction,
  type TransactionInput,
} from '../contracts';

/** Edits one exact-decimal posting with paginated reference choices and balanced category lines. */
const TransactionForm = ({
  initial,
  accounts: initialAccounts,
  payees: initialPayees,
  categories,
  options,
  busy,
  onLoading,
  onSave,
  onCancel,
}: {
  initial: Transaction | null;
  accounts: AccountsPage;
  payees: PayeesPage;
  categories: Category[];
  options: AccountOptions;
  busy: boolean;
  onLoading: (value: boolean) => void;
  onSave: (value: TransactionInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState<TransactionInput>(
    initial
      ? {
          accountId: initial.accountId,
          payeeId: initial.payeeId,
          kind: initial.kind,
          amount: initial.amount,
          date: initial.date,
          notes: initial.notes ?? '',
          splits: initial.splits.map((s) => ({
            categoryId: s.categoryId,
            amount: s.amount,
          })),
        }
      : {
          accountId: '',
          payeeId: null,
          kind: 'expense',
          amount: '',
          date: options.today,
          notes: '',
          splits: [{ categoryId: null, amount: '' }],
        },
  );
  const [accounts, setAccounts] = useState(initialAccounts);
  const [payees, setPayees] = useState(initialPayees);
  const [payeeSearch, setPayeeSearch] = useState('');
  const [appliedPayeeSearch, setAppliedPayeeSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const account = accounts.items.find((a) => a.id === value.accountId);
  const digits =
    options.currencyDigits[account?.currency ?? initial?.currency ?? 'USD'] ??
    2;
  const kind = value.kind === 'income' ? 'income' : 'expense';
  const available = categories.filter(
    (c) =>
      c.kind === kind &&
      (!c.archivedAt || initial?.splits.some((s) => s.categoryId === c.id)),
  );
  const change = <K extends keyof TransactionInput>(
    key: K,
    next: TransactionInput[K],
  ) => setValue((v) => ({ ...v, [key]: next }));
  const load = async (target: 'accounts' | 'payees', more: boolean) => {
    if (loading || busy) return;
    setLoading(true);
    onLoading(true);
    setError('');
    try {
      if (target === 'accounts') {
        const result = await apiRequest(
          '/accounts?after=' + accounts.nextCursor,
          { schema: accountsSchema },
        );
        setAccounts({
          items: [...accounts.items, ...result.items],
          nextCursor: result.nextCursor,
        });
      } else {
        const query = new URLSearchParams({
          q: more ? appliedPayeeSearch : payeeSearch,
        });
        if (more && payees.nextCursor) query.set('after', payees.nextCursor);
        const result = await apiRequest('/payees?' + query, {
          schema: payeesSchema,
        });
        if (!more) setAppliedPayeeSearch(payeeSearch);
        setPayees({
          items: more ? [...payees.items, ...result.items] : result.items,
          nextCursor: result.nextCursor,
        });
      }
    } catch {
      setError('Unable to load choices. Please try again.');
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };
  return (
    <form
      noValidate
      aria-busy={busy || loading}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || loading) return;
        const message = validateTransaction(
          value,
          digits,
          account?.openingBalanceDate ?? '0001-01-01',
          options.today,
        );
        setError(message);
        if (!message) void onSave(value);
      }}
    >
      <fieldset disabled={busy || loading} className="min-w-0 space-y-5">
        <legend className="sr-only">
          {initial ? 'Edit transaction' : 'Add transaction'}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="transaction-kind" className="account-field-label">
              Transaction type
            </label>
            <select
              id="transaction-kind"
              className="account-select"
              value={value.kind}
              onChange={(e) =>
                setValue((v) => ({
                  ...v,
                  kind: e.target.value as TransactionInput['kind'],
                  splits: [{ categoryId: null, amount: v.amount }],
                }))
              }
            >
              {Object.entries(transactionKinds).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="transaction-account"
              className="account-field-label"
            >
              Account
            </label>
            <select
              id="transaction-account"
              className="account-select"
              value={value.accountId}
              onChange={(e) => change('accountId', e.target.value)}
            >
              <option value="">Select an account</option>
              {accounts.items
                .filter((a) => !initial || a.currency === initial.currency)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.currency}
                  </option>
                ))}
              {initial &&
                !accounts.items.some((a) => a.id === initial.accountId) && (
                  <option value={initial.accountId}>
                    {initial.accountName} · {initial.currency} (saved)
                  </option>
                )}
            </select>
            {accounts.nextCursor && (
              <button
                type="button"
                className="mt-2 text-sm underline"
                onClick={() => void load('accounts', true)}
              >
                Load more accounts
              </button>
            )}
          </div>
          <TextField
            id="transaction-amount"
            label={'Amount' + (account ? ' · ' + account.currency : '')}
            inputMode="decimal"
            autoComplete="off"
            value={value.amount}
            onChange={(e) =>
              setValue((v) => ({
                ...v,
                amount: e.target.value,
                splits:
                  v.splits.length === 1
                    ? [{ ...v.splits[0]!, amount: e.target.value }]
                    : v.splits,
              }))
            }
          />
          <TextField
            id="transaction-date"
            label="Date"
            type="date"
            min={account?.openingBalanceDate}
            max={options.today}
            value={value.date}
            onChange={(e) => change('date', e.target.value)}
          />
        </div>
        <p className="text-xs leading-relaxed text-text-sub-600">
          {value.kind === 'expense'
            ? 'Expenses reduce this account’s balance.'
            : value.kind === 'refund'
              ? 'Refunds increase the balance and reduce spending in an expense category.'
              : 'Income increases this account’s balance.'}{' '}
          Use a positive amount.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Categories</h3>
            <button
              type="button"
              className="text-sm underline disabled:opacity-50"
              disabled={value.splits.length >= 20}
              onClick={() =>
                change('splits', [
                  ...value.splits,
                  { categoryId: null, amount: '' },
                ])
              }
            >
              Split amount
            </button>
          </div>
          {value.splits.map((split, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-end gap-2"
            >
              <div>
                <label
                  htmlFor={'transaction-category-' + index}
                  className="account-field-label"
                >
                  {value.splits.length > 1
                    ? `Category ${index + 1}`
                    : 'Category'}
                </label>
                <select
                  id={'transaction-category-' + index}
                  className="account-select"
                  value={split.categoryId ?? ''}
                  onChange={(e) =>
                    change(
                      'splits',
                      value.splits.map((s, i) =>
                        i === index
                          ? { ...s, categoryId: e.target.value || null }
                          : s,
                      ),
                    )
                  }
                >
                  <option value="">Uncategorized</option>
                  {available.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parentId
                        ? (categories.find((p) => p.id === c.parentId)?.name ??
                            '') + ' / '
                        : ''}
                      {c.name}
                      {c.archivedAt ? ' (archived)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <TextField
                id={'transaction-split-' + index}
                label={'Amount ' + (index + 1)}
                inputMode="decimal"
                value={split.amount}
                readOnly={value.splits.length === 1}
                onChange={(e) =>
                  change(
                    'splits',
                    value.splits.map((s, i) =>
                      i === index ? { ...s, amount: e.target.value } : s,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label={'Remove category line ' + (index + 1)}
                disabled={value.splits.length === 1}
                className="mb-1 rounded-lg p-2 text-lg disabled:opacity-40"
                onClick={() => {
                  const next = value.splits.filter((_, i) => i !== index);
                  change(
                    'splits',
                    next.length === 1
                      ? [{ ...next[0]!, amount: value.amount }]
                      : next,
                  );
                }}
              >
                ×
              </button>
            </div>
          ))}
          <p className="text-xs text-text-sub-600">
            Category amounts must add up to the total. Keep a line uncategorized
            when needed.
          </p>
        </div>
        <div>
          <label htmlFor="transaction-payee" className="account-field-label">
            Payee (optional)
          </label>
          <select
            id="transaction-payee"
            className="account-select"
            value={value.payeeId ?? ''}
            onChange={(e) => change('payeeId', e.target.value || null)}
          >
            <option value="">No payee</option>
            {payees.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.kind}
              </option>
            ))}
            {value.payeeId &&
              !payees.items.some((p) => p.id === value.payeeId) && (
                <option value={value.payeeId}>
                  {initial?.payeeName ?? 'Selected payee'} (saved selection)
                </option>
              )}
          </select>
          <div className="mt-3 flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextField
                id="transaction-payee-search"
                label="Find a payee"
                maxLength={100}
                value={payeeSearch}
                onChange={(e) => setPayeeSearch(e.target.value)}
              />
            </div>
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              onClick={() => void load('payees', false)}
            >
              Search
            </Button.Root>
          </div>
          {payees.nextCursor && (
            <button
              type="button"
              className="mt-2 text-sm underline"
              onClick={() => void load('payees', true)}
            >
              Load more payees
            </button>
          )}
        </div>
        <div>
          <label htmlFor="transaction-notes" className="account-field-label">
            Notes (optional)
          </label>
          <textarea
            id="transaction-notes"
            className="account-select min-h-24 resize-y"
            maxLength={2000}
            value={value.notes}
            onChange={(e) => change('notes', e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button.Root type="submit" className="finance-primary">
            {busy && (
              <RiLoader4Line
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Add transaction'}
          </Button.Root>
          <Button.Root
            type="button"
            variant="neutral"
            mode="stroke"
            onClick={onCancel}
          >
            Cancel
          </Button.Root>
        </div>
      </fieldset>
      {loading && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm">
          <RiLoader4Line
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />
          Loading choices…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-error-base">
          {error}
        </p>
      )}
    </form>
  );
};
export default TransactionForm;

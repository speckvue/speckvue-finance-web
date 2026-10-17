'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import {
  accountsSchema,
  type AccountOptions,
  type AccountsPage,
} from '@/features/accounts/contracts';
import formatMoney from '@/features/accounts/format-money';
import type { Category } from '@/features/categories/contracts';
import { moneyUnits } from '@/features/transactions/contracts';
import apiRequest from '@/lib/api/client';
import { RiLoader4Line } from '@remixicon/react';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import {
  formatUnits,
  rateFromAmounts,
  receivedFromRate,
  type Transfer,
  type TransferInput,
} from '../contracts';

/** Collects actual currency amounts and exposes exact rate/fee previews without posting individual sides. */
const TransferForm = ({
  initial,
  accounts: initialAccounts,
  categories,
  options,
  locale,
  busy,
  onLoading,
  onSave,
  onCancel,
}: {
  initial: Transfer | null;
  accounts: AccountsPage;
  categories: Category[];
  options: AccountOptions;
  locale: string;
  busy: boolean;
  onLoading: (loading: boolean) => void;
  onSave: (value: TransferInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const needsAccounts = !initial && accounts.items.length < 2;
  const [value, setValue] = useState<TransferInput>(
    initial
      ? {
          sourceAccountId: initial.sourceAccountId,
          destinationAccountId: initial.destinationAccountId,
          sentAmount: initial.sentAmount,
          receivedAmount: initial.receivedAmount,
          feeAmount: initial.feeAmount,
          feeAccountId: initial.feeAccountId,
          feeCategoryId: initial.feeCategoryId,
          date: initial.date,
          notes: initial.notes ?? '',
        }
      : {
          sourceAccountId: '',
          destinationAccountId: '',
          sentAmount: '',
          receivedAmount: '',
          feeAmount: '0',
          feeAccountId: null,
          feeCategoryId: null,
          date: options.today,
          notes: '',
        },
  );
  const [rate, setRate] = useState(
    initial ? rateFromAmounts(initial.sentAmount, initial.receivedAmount) : '',
  );
  const [rateDriven, setRateDriven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const source = accounts.items.find((a) => a.id === value.sourceAccountId),
    destination = accounts.items.find(
      (a) => a.id === value.destinationAccountId,
    ),
    charged = accounts.items.find((a) => a.id === value.feeAccountId);
  const sourceCurrency =
    source?.currency ??
    (initial?.sourceAccountId === value.sourceAccountId
      ? initial.sourceCurrency
      : undefined);
  const destinationCurrency =
    destination?.currency ??
    (initial?.destinationAccountId === value.destinationAccountId
      ? initial.destinationCurrency
      : undefined);
  const feeCurrency =
    charged?.currency ??
    (initial?.feeAccountId === value.feeAccountId
      ? initial?.feeCurrency
      : undefined);
  const sameCurrency =
    !!sourceCurrency && sourceCurrency === destinationCurrency;
  const feeUnits = moneyUnits(value.feeAmount);
  const hasFee = feeUnits !== null && feeUnits > 0n;
  const changeAccount = (
    key: 'sourceAccountId' | 'destinationAccountId',
    id: string,
  ) => {
    const next = { ...value, [key]: id };
    const s = accounts.items.find((a) => a.id === next.sourceAccountId),
      d = accounts.items.find((a) => a.id === next.destinationAccountId);
    const same = !!s && s.currency === d?.currency;
    next.receivedAmount = same ? next.sentAmount : '';
    setValue(next);
    setRateDriven(false);
    setRate(same ? '1' : '');
  };
  const loadAccounts = async () => {
    if (loading || busy || !accounts.nextCursor) return;
    setLoading(true);
    onLoading(true);
    setError('');
    try {
      const result = await apiRequest(
        '/accounts?after=' + accounts.nextCursor,
        { schema: accountsSchema },
      );
      setAccounts({
        items: [...accounts.items, ...result.items],
        nextCursor: result.nextCursor,
      });
    } catch {
      setError('Unable to load more accounts. Please try again.');
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };
  const select = (
    id: string,
    label: string,
    selected: string,
    onChange: (id: string) => void,
    saved?: { id: string; name: string; currency: string } | null,
  ) => (
    <div>
      <label htmlFor={id} className="account-field-label">
        {label}
      </label>
      <select
        id={id}
        className="account-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select an account</option>
        {accounts.items.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} · {a.currency}
          </option>
        ))}
        {saved?.id === selected &&
          !accounts.items.some((a) => a.id === selected) && (
            <option value={selected}>
              {saved.name} · {saved.currency} (saved)
            </option>
          )}
      </select>
    </div>
  );
  const money = (units: bigint, currency: string) =>
    formatMoney(
      formatUnits(units),
      currency,
      locale,
      options.currencyDigits[currency],
    );
  const sentUnits = moneyUnits(value.sentAmount),
    receivedUnits = moneyUnits(value.receivedAmount);
  return (
    <form
      noValidate
      aria-busy={busy || loading}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy || loading || needsAccounts) return;
        let message = '';
        const valid = (
          amount: string,
          currency: string | undefined,
          zero = false,
        ) => {
          const units = moneyUnits(amount);
          return (
            !!currency &&
            units !== null &&
            (zero ? units >= 0n : units > 0n) &&
            (amount.split('.')[1] ?? '').replace(/0+$/, '').length <=
              (options.currencyDigits[currency] ?? 2)
          );
        };
        if (
          !sourceCurrency ||
          !destinationCurrency ||
          !z.uuid().safeParse(value.sourceAccountId).success ||
          !z.uuid().safeParse(value.destinationAccountId).success
        )
          message = 'Select both accounts.';
        else if (value.sourceAccountId === value.destinationAccountId)
          message = 'Choose two different accounts.';
        else if (
          !valid(value.sentAmount, sourceCurrency) ||
          !valid(value.receivedAmount, destinationCurrency)
        )
          message =
            'Enter positive amounts using each account’s currency precision.';
        else if (sameCurrency && sentUnits !== receivedUnits)
          message =
            'Same-currency amounts must match. Record a fee separately.';
        else if (
          feeUnits === null ||
          (hasFee &&
            (!value.feeAccountId ||
              !valid(value.feeAmount, feeCurrency ?? undefined, true)))
        )
          message = 'Enter a valid fee and select the account charged.';
        else if (
          !z.iso.date().safeParse(value.date).success ||
          value.date > options.today ||
          [source, destination, ...(hasFee ? [charged] : [])].some(
            (a) => a && value.date < a.openingBalanceDate,
          )
        )
          message =
            'Choose a date between all involved opening dates and today.';
        else if (
          value.notes.length > 2000 ||
          Array.from(value.notes).some(
            (c) => /\p{Cc}/u.test(c) && !'\n\r\t'.includes(c),
          )
        )
          message = 'Use plain text notes of up to 2,000 characters.';
        setError(message);
        if (!message)
          void onSave({
            ...value,
            feeAccountId: hasFee ? value.feeAccountId : null,
            feeCategoryId: hasFee ? value.feeCategoryId : null,
          });
      }}
    >
      <fieldset disabled={busy || loading} className="min-w-0 space-y-5">
        <legend className="sr-only">Transfer details</legend>
        {needsAccounts && (
          <p
            id="transfer-account-requirement"
            className="rounded-xl bg-bg-weak-50 p-4 text-sm"
          >
            You need two active accounts to save a transfer.{' '}
            <Link href="/accounts" className="underline">
              Add or restore an account
            </Link>{' '}
            in Accounts, then return here to record the transfer.
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {select(
            'transfer-source',
            'From account',
            value.sourceAccountId,
            (id) => changeAccount('sourceAccountId', id),
            initial
              ? {
                  id: initial.sourceAccountId,
                  name: initial.sourceAccountName,
                  currency: initial.sourceCurrency,
                }
              : null,
          )}
          {select(
            'transfer-destination',
            'To account',
            value.destinationAccountId,
            (id) => changeAccount('destinationAccountId', id),
            initial
              ? {
                  id: initial.destinationAccountId,
                  name: initial.destinationAccountName,
                  currency: initial.destinationCurrency,
                }
              : null,
          )}
        </div>
        {accounts.nextCursor && (
          <button
            type="button"
            className="text-sm underline"
            onClick={() => void loadAccounts()}
          >
            Load more accounts
          </button>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="transfer-sent"
            label={
              'Amount sent' + (sourceCurrency ? ' · ' + sourceCurrency : '')
            }
            inputMode="decimal"
            value={value.sentAmount}
            onChange={(e) => {
              const sent = e.target.value;
              const received = sameCurrency
                ? sent
                : destinationCurrency && rateDriven
                  ? (receivedFromRate(
                      sent,
                      rate,
                      options.currencyDigits[destinationCurrency] ?? 2,
                    ) ?? '')
                  : value.receivedAmount;
              setValue({
                ...value,
                sentAmount: sent,
                receivedAmount: received,
              });
              if (!sameCurrency && !rateDriven)
                setRate(rateFromAmounts(sent, received));
            }}
          />
          <TextField
            id="transfer-received"
            label={
              'Amount received' +
              (destinationCurrency ? ' · ' + destinationCurrency : '')
            }
            inputMode="decimal"
            readOnly={sameCurrency}
            value={value.receivedAmount}
            onChange={(e) => {
              setRateDriven(false);
              setValue({ ...value, receivedAmount: e.target.value });
              setRate(rateFromAmounts(value.sentAmount, e.target.value));
            }}
            hint="Before any separate fee recorded below."
          />
        </div>
        {sourceCurrency && destinationCurrency && (
          <TextField
            id="transfer-rate"
            label={`Exchange rate · 1 ${sourceCurrency} in ${destinationCurrency}`}
            inputMode="decimal"
            readOnly={sameCurrency}
            value={sameCurrency ? '1' : rate}
            onChange={(e) => {
              setRateDriven(true);
              setRate(e.target.value);
              const received = receivedFromRate(
                value.sentAmount,
                e.target.value,
                options.currencyDigits[destinationCurrency] ?? 2,
              );
              setValue({ ...value, receivedAmount: received ?? '' });
            }}
            hint="Enter a rate to calculate the received amount, or enter both amounts. The saved rate reflects the actual amounts after currency rounding."
          />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="transfer-date"
            label="Date"
            type="date"
            max={options.today}
            value={value.date}
            onChange={(e) => setValue({ ...value, date: e.target.value })}
          />
          <TextField
            id="transfer-fee"
            label="Transfer fee"
            inputMode="decimal"
            value={value.feeAmount}
            onChange={(e) => {
              const amount = e.target.value;
              const units = moneyUnits(amount);
              setValue({
                ...value,
                feeAmount: amount,
                feeAccountId:
                  units !== null && units > 0n
                    ? (value.feeAccountId ?? value.sourceAccountId) || null
                    : null,
                feeCategoryId:
                  units !== null && units > 0n ? value.feeCategoryId : null,
              });
            }}
            hint="Enter 0 when there is no separate fee."
          />
        </div>
        {hasFee && (
          <div className="space-y-3">
            <div className="grid gap-5 sm:grid-cols-2">
              {select(
                'transfer-fee-account',
                'Fee charged to',
                value.feeAccountId ?? '',
                (id) => setValue({ ...value, feeAccountId: id || null }),
                initial?.feeAccountId
                  ? {
                      id: initial.feeAccountId,
                      name: initial.feeAccountName!,
                      currency: initial.feeCurrency!,
                    }
                  : null,
              )}
              <div>
                <label
                  htmlFor="transfer-fee-category"
                  className="account-field-label"
                >
                  Fee expense category (optional)
                </label>
                <select
                  id="transfer-fee-category"
                  className="account-select"
                  value={value.feeCategoryId ?? ''}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      feeCategoryId: e.target.value || null,
                    })
                  }
                >
                  <option value="">Uncategorized</option>
                  {categories
                    .filter(
                      (c) =>
                        c.kind === 'expense' &&
                        (!c.archivedAt || c.id === initial?.feeCategoryId),
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parentId
                          ? (categories.find((p) => p.id === c.parentId)
                              ?.name ?? '') + ' / '
                          : ''}
                        {c.name}
                        {c.archivedAt ? ' (archived)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-text-sub-600">
              The fee is an additional expense in the charged account’s
              currency. A destination fee reduces the received amount. Record
              each fee only once.
            </p>
          </div>
        )}
        {sourceCurrency &&
          destinationCurrency &&
          sentUnits !== null &&
          receivedUnits !== null && (
            <div
              className="space-y-2 rounded-xl bg-bg-weak-50 p-4 text-sm [overflow-wrap:anywhere]"
              aria-label="Transfer preview"
            >
              <p>
                Source charged:{' '}
                {money(
                  sentUnits +
                    (value.feeAccountId === value.sourceAccountId
                      ? (feeUnits ?? 0n)
                      : 0n),
                  sourceCurrency,
                )}
              </p>
              <p>
                Destination credited:{' '}
                {money(
                  receivedUnits -
                    (value.feeAccountId === value.destinationAccountId
                      ? (feeUnits ?? 0n)
                      : 0n),
                  destinationCurrency,
                )}
              </p>
              {hasFee && charged && (
                <p>
                  Separate fee: {money(feeUnits!, charged.currency)} ·{' '}
                  {charged.name}
                </p>
              )}
              <p className="text-xs text-text-sub-600">
                Transfer principal is excluded from income and expenses. Only
                the separate fee counts as spending.
              </p>
            </div>
          )}
        <div>
          <label htmlFor="transfer-notes" className="account-field-label">
            Notes (optional)
          </label>
          <textarea
            id="transfer-notes"
            maxLength={2000}
            className="account-select min-h-24 resize-y"
            value={value.notes}
            onChange={(e) => setValue({ ...value, notes: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button.Root
            type="submit"
            className="finance-primary"
            disabled={needsAccounts}
            aria-describedby={
              needsAccounts ? 'transfer-account-requirement' : undefined
            }
          >
            {busy && (
              <RiLoader4Line
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Add transfer'}
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
          Loading accounts…
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
export default TransferForm;

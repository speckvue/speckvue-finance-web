'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import { RiLoader4Line } from '@remixicon/react';
import { useState } from 'react';
import {
  accountTypes,
  createAccountInputSchema,
  type AccountInput,
} from '../contracts';

const AccountForm = ({
  initial,
  editing,
  busy,
  today,
  currencies,
  onSave,
  onCancel,
}: {
  initial: AccountInput;
  editing: boolean;
  busy: boolean;
  today: string;
  currencies: string[];
  onSave: (value: AccountInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  return (
    <form
      className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6"
      noValidate
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        const parsed = createAccountInputSchema(currencies).safeParse(value);
        if (!parsed.success) {
          const messages: Record<string, string[]> = {};
          for (const issue of parsed.error.issues)
            (messages[String(issue.path[0])] ??= []).push(issue.message);
          setErrors(messages);
          return;
        }
        setErrors({});
        void onSave(parsed.data);
      }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-6">
        <legend className="mb-6 text-xl font-medium">
          {editing ? 'Edit account' : 'Add an account'}
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="account-name"
            label="Account name"
            autoComplete="off"
            maxLength={80}
            value={value.name}
            onChange={(event) =>
              setValue({ ...value, name: event.target.value })
            }
            errors={errors.name}
          />
          <div>
            <label className="account-field-label" htmlFor="account-type">
              Account type
            </label>
            <select
              id="account-type"
              className="account-select"
              value={value.type}
              onChange={(event) =>
                setValue({
                  ...value,
                  type: event.target.value as AccountInput['type'],
                })
              }
            >
              {Object.entries(accountTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="account-field-label" htmlFor="account-currency">
              Currency
            </label>
            <select
              id="account-currency"
              className="account-select"
              value={value.currency}
              onChange={(event) =>
                setValue({ ...value, currency: event.target.value })
              }
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <TextField
            id="account-balance"
            label="Opening balance"
            inputMode="decimal"
            value={value.openingBalance}
            onChange={(event) =>
              setValue({ ...value, openingBalance: event.target.value })
            }
            errors={errors.openingBalance}
            hint="Use a minus sign for money you owe, including credit card and loan balances."
          />
          <TextField
            id="account-date"
            label="Opening balance date"
            type="date"
            max={today}
            value={value.openingBalanceDate}
            onChange={(event) =>
              setValue({ ...value, openingBalanceDate: event.target.value })
            }
            errors={errors.openingBalanceDate}
            hint="The date this starting balance applies to."
          />
        </div>
        <p className="text-xs leading-relaxed text-text-sub-600">
          Accounts are tracked manually. Adding an account does not connect to
          your bank.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button.Root type="submit" className="finance-primary">
            {busy && (
              <RiLoader4Line
                className="animate-spin"
                size={18}
                aria-hidden="true"
              />
            )}
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add account'}
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
    </form>
  );
};
export default AccountForm;

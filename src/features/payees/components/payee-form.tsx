'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import { RiLoader4Line } from '@remixicon/react';
import { useState } from 'react';
import { payeeInputSchema, payeeKinds, type PayeeInput } from '../contracts';

const PayeeForm = ({
  initial,
  editing,
  busy,
  onSave,
  onCancel,
}: {
  initial: PayeeInput;
  editing: boolean;
  busy: boolean;
  onSave: (value: PayeeInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  return (
    <form
      noValidate
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        const result = payeeInputSchema.safeParse(value);
        if (!result.success) {
          const next: Record<string, string[]> = {};
          for (const issue of result.error.issues)
            (next[String(issue.path[0])] ??= []).push(issue.message);
          setErrors(next);
          return;
        }
        setErrors({});
        void onSave(result.data);
      }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-5">
        <legend className="sr-only">Payee details</legend>
        <TextField
          id="payee-name"
          label="Payee name"
          maxLength={100}
          autoComplete="off"
          value={value.name}
          errors={errors.name}
          onChange={(event) => setValue({ ...value, name: event.target.value })}
        />
        <div>
          <label htmlFor="payee-kind" className="account-field-label">
            Type
          </label>
          <select
            id="payee-kind"
            className="account-select"
            value={value.kind}
            onChange={(event) =>
              setValue({
                ...value,
                kind: event.target.value as PayeeInput['kind'],
              })
            }
          >
            {Object.entries(payeeKinds).map(([kind, label]) => (
              <option key={kind} value={kind}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="payee-notes" className="account-field-label">
            Notes (optional)
          </label>
          <textarea
            id="payee-notes"
            className="account-select min-h-24 resize-y"
            maxLength={500}
            value={value.notes ?? ''}
            onChange={(event) =>
              setValue({ ...value, notes: event.target.value })
            }
            aria-invalid={!!errors.notes?.length}
            aria-describedby={
              errors.notes?.length ? 'payee-notes-error' : 'payee-notes-hint'
            }
          />
          {errors.notes?.length ? (
            <p id="payee-notes-error" className="mt-2 text-xs text-error-base">
              {errors.notes.join(' ')}
            </p>
          ) : (
            <p id="payee-notes-hint" className="mt-2 text-xs text-text-sub-600">
              Add a useful detail to distinguish similar names. Avoid sensitive
              account or payment information.
            </p>
          )}
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
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add payee'}
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
export default PayeeForm;

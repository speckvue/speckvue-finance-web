'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { RiCloseLine } from '@remixicon/react';
import type { RefObject } from 'react';
import type { Account, AccountInput } from '../contracts';
import AccountForm from './account-form';

/** Edits an account without leaving its list or detail page; saving locks dismissal. */
const AccountEditor = ({
  editor,
  currency,
  currencies,
  currencyDigits,
  today,
  busy,
  error,
  opener,
  onSave,
  onClose,
}: {
  editor: Account | 'new' | null;
  currency: string;
  currencies: string[];
  currencyDigits?: Record<string, number>;
  today: string;
  busy: boolean;
  error: string;
  opener: RefObject<HTMLButtonElement | null>;
  onSave: (value: AccountInput) => Promise<void>;
  onClose: () => void;
}) => (
  <Dialog.Root
    open={editor !== null}
    onOpenChange={(open) => {
      if (!open && !busy) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="account-dialog-overlay" />
      <Dialog.Content
        className="account-dialog"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('account-name')?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Dialog.Title className="text-xl font-medium">
              {editor === 'new' ? 'Add an account' : 'Edit account'}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-text-sub-600">
              Set the account details and its opening balance.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              disabled={busy}
              aria-label="Close account form"
              className="shrink-0 rounded-lg p-2 disabled:opacity-50"
            >
              <RiCloseLine size={20} aria-hidden="true" />
            </button>
          </Dialog.Close>
        </div>
        {editor && (
          <AccountForm
            key={editor === 'new' ? 'new' : editor.id}
            currencies={currencies}
            currencyDigits={currencyDigits}
            today={today}
            editing={editor !== 'new'}
            openingLocked={editor !== 'new' && editor.hasTransactions}
            busy={busy}
            onSave={onSave}
            onCancel={onClose}
            initial={
              editor === 'new'
                ? {
                    name: '',
                    type: 'bank',
                    currency,
                    openingBalance: '0',
                    openingBalanceDate: today,
                    institution: '',
                    notes: '',
                  }
                : {
                    name: editor.name,
                    type: editor.type,
                    currency: editor.currency,
                    openingBalance: editor.openingBalance.replace(/\.?0+$/, ''),
                    openingBalanceDate: editor.openingBalanceDate,
                    institution: editor.institution ?? '',
                    notes: editor.notes ?? '',
                  }
            }
          />
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-error-base p-4 text-sm text-error-base"
          >
            {error}
          </p>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default AccountEditor;

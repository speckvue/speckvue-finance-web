'use client';

import FormDialog from '@/components/shared/form-dialog';
import type { RefObject } from 'react';
import type { Payee, PayeeInput } from '../contracts';
import PayeeForm from './payee-form';

const PayeeEditor = ({
  editor,
  defaultKind,
  busy,
  error,
  opener,
  onSave,
  onClose,
}: {
  editor: Payee | 'new' | null;
  defaultKind: PayeeInput['kind'];
  busy: boolean;
  error: string;
  opener: RefObject<HTMLButtonElement | null>;
  onSave: (value: PayeeInput) => Promise<void>;
  onClose: () => void;
}) => (
  <FormDialog
    open={editor !== null}
    title={editor === 'new' ? 'Add a payee' : 'Edit payee'}
    description="Save the person, merchant or organization behind a payment."
    busy={busy}
    error={error}
    initialFocusId="payee-name"
    opener={opener}
    onClose={onClose}
  >
    {editor && (
      <PayeeForm
        key={editor === 'new' ? 'new' : editor.id}
        editing={editor !== 'new'}
        busy={busy}
        onSave={onSave}
        onCancel={onClose}
        initial={
          editor === 'new'
            ? { name: '', kind: defaultKind, notes: '' }
            : {
                name: editor.name,
                kind: editor.kind,
                notes: editor.notes ?? '',
              }
        }
      />
    )}
  </FormDialog>
);
export default PayeeEditor;

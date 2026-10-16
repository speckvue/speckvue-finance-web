'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { RiCloseLine } from '@remixicon/react';
import { useRef, type ReactNode, type RefObject } from 'react';

/** Traps focus and prevents dismissal while a form or its required choices are loading. */
const FormDialog = ({
  open,
  title,
  description,
  busy,
  error,
  initialFocusId,
  fallbackFocusId = 'payee-add',
  opener,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  busy: boolean;
  error: string;
  initialFocusId: string;
  fallbackFocusId?: string;
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
}) => {
  const content = useRef<HTMLDivElement>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="account-dialog-overlay" />
        <Dialog.Content
          ref={content}
          className="account-dialog [&_button]:transition-none [&_input]:transition-none [&_select]:transition-none [&_textarea]:transition-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const field = document.getElementById(initialFocusId);
            if (field && !field.matches(':disabled')) field.focus();
            else content.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            (opener.current?.isConnected
              ? opener.current
              : document.getElementById(fallbackFocusId)
            )?.focus();
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
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-text-sub-600">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={busy}
                aria-label={'Close ' + title.toLowerCase()}
                className="shrink-0 rounded-lg p-2 disabled:opacity-50"
              >
                <RiCloseLine size={20} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          {children}
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
};
export default FormDialog;

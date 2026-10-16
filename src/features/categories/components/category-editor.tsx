'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { RiCloseLine } from '@remixicon/react';
import type { RefObject } from 'react';
import type {
  Category,
  CategoryEditorState,
  CategoryInput,
} from '../contracts';
import CategoryForm from './category-form';

const CategoryEditor = ({
  editor,
  items,
  busy,
  error,
  opener,
  onSave,
  onClose,
}: {
  editor: CategoryEditorState | null;
  items: Category[];
  busy: boolean;
  error: string;
  opener: RefObject<HTMLButtonElement | null>;
  onSave: (value: CategoryInput) => Promise<void>;
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
          document.getElementById('category-name')?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (opener.current?.isConnected
            ? opener.current
            : document.getElementById('add-category')
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
              {editor?.category ? 'Edit category' : 'Add a category'}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-text-sub-600">
              Choose a name, type and appearance for this category.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close category form"
              disabled={busy}
              className="shrink-0 rounded-lg p-2 disabled:opacity-50"
            >
              <RiCloseLine size={20} aria-hidden="true" />
            </button>
          </Dialog.Close>
        </div>
        {editor && (
          <CategoryForm
            key={editor.category?.id ?? 'new'}
            initial={
              editor.category
                ? {
                    name: editor.category.name,
                    kind: editor.category.kind,
                    color: editor.category.color,
                    icon: editor.category.icon,
                    parentId: editor.category.parentId,
                    description: editor.category.description ?? '',
                  }
                : {
                    name: '',
                    kind: editor.kind,
                    parentId: editor.parentId,
                    color: 'slate',
                    icon: 'tag',
                    description: '',
                  }
            }
            editingId={editor.category?.id ?? null}
            items={items}
            busy={busy}
            onSave={onSave}
            onCancel={onClose}
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
export default CategoryEditor;

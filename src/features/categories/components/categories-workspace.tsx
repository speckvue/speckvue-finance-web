'use client';

import * as Button from '@/components/ui/button';
import authenticatedRequest from '@/features/auth/client';
import ApiError from '@/lib/api/api-error';
import apiRequest from '@/lib/api/client';
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiLoader4Line,
  RiPriceTag3Line,
} from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  categoriesSchema,
  type Category,
  type CategoryEditorState,
  type CategoryInput,
  type CategoryKind,
} from '../contracts';
import orderCategories from '../order-categories';
import CategoryEditor from './category-editor';
import CategoryMark from './category-mark';

/** Manages personal category groups without deleting identities needed by financial history. */
const CategoriesWorkspace = ({
  initial,
}: {
  initial: { items: Category[] };
}) => {
  const router = useRouter();
  const [items, setItems] = useState(initial.items);
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [archived, setArchived] = useState(false);
  const [editor, setEditor] = useState<CategoryEditorState | null>(null);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const inFlight = useRef(false);
  const rows = orderCategories(items, kind, archived);
  const fail = (reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 401) {
      router.replace('/signin');
      return;
    }
    setError(
      reason instanceof ApiError && reason.status === 409
        ? 'A category with this name may already exist here, including in Archived, or its parent or status has changed. Check the details and reload categories if needed.'
        : reason instanceof ApiError && reason.status === 404
          ? 'This category or its parent is unavailable. Reload categories to see the latest details.'
          : reason instanceof ApiError && reason.status === 400
            ? 'Check the category details and try again.'
            : 'Unable to complete this request. Your changes have not been confirmed. Please try again.',
    );
  };
  const request = async (
    path: string,
    message: string,
    method?: 'POST' | 'PATCH',
    body?: unknown,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(
      method
        ? path === '/categories' || method === 'PATCH'
          ? 'save'
          : path
        : 'load',
    );
    setError('');
    setNotice('');
    try {
      const result = method
        ? await authenticatedRequest(path, {
            method,
            body,
            schema: categoriesSchema,
          })
        : await apiRequest(path, { schema: categoriesSchema });
      setItems(result.items);
      setConfirm(null);
      if (method === 'PATCH' || (path === '/categories' && method === 'POST'))
        setEditor(null);
      setNotice(message);
      return true;
    } catch (reason) {
      fail(reason);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  };
  const save = async (value: CategoryInput) => {
    const saved = await request(
      '/categories' + (editor?.category ? '/' + editor.category.id : ''),
      editor?.category ? 'Category updated.' : 'Category added.',
      editor?.category ? 'PATCH' : 'POST',
      value,
    );
    if (saved) setKind(value.kind);
  };
  const open = (
    button: HTMLButtonElement,
    category: Category | null,
    parentId: string | null = null,
  ) => {
    opener.current = button;
    setError('');
    setNotice('');
    setEditor({ category, parentId, kind });
  };
  return (
    <section aria-busy={busy !== null}>
      <fieldset disabled={busy !== null} className="min-w-0">
        <legend className="sr-only">Manage categories</legend>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Categories</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-sub-600">
              Organize income and spending with categories that fit your life.
            </p>
          </div>
          {!archived && (
            <Button.Root
              id="add-category"
              disabled={items.length >= 500}
              className="finance-primary"
              onClick={(event) => open(event.currentTarget, null)}
            >
              <RiAddLine size={18} aria-hidden="true" />
              Add category
            </Button.Root>
          )}
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stroke-soft-200 pb-4">
          <div role="group" aria-label="Category type" className="flex gap-2">
            {(['expense', 'income'] as const).map((value) => (
              <Button.Root
                key={value}
                className="transition-none"
                size="small"
                variant="neutral"
                mode={kind === value ? 'filled' : 'ghost'}
                aria-pressed={kind === value}
                onClick={() => {
                  setKind(value);
                  setConfirm(null);
                  setError('');
                  setNotice('');
                }}
              >
                {value === 'expense' ? 'Expenses' : 'Income'}
              </Button.Root>
            ))}
          </div>
          <div role="group" aria-label="Category status" className="flex gap-2">
            {[false, true].map((value) => (
              <Button.Root
                key={String(value)}
                className="transition-none"
                size="small"
                variant="neutral"
                mode={archived === value ? 'filled' : 'ghost'}
                aria-pressed={archived === value}
                onClick={() => {
                  setArchived(value);
                  setConfirm(null);
                  setError('');
                  setNotice('');
                }}
              >
                {value ? 'Archived' : 'Active'}
              </Button.Root>
            ))}
          </div>
          <button
            type="button"
            className="text-xs text-text-sub-600 underline underline-offset-4 disabled:opacity-50"
            onClick={() => void request('/categories', 'Categories reloaded.')}
          >
            Reload categories
          </button>
        </div>
        {busy && busy !== 'save' && (
          <p
            role="status"
            className="mb-5 flex items-center gap-2 text-sm text-text-sub-600"
          >
            <RiLoader4Line
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
            {busy === 'load' ? 'Loading categories…' : 'Updating categories…'}
          </p>
        )}
        {confirm && (
          <div className="mb-6 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5">
            <h2 className="text-base font-medium break-words">
              Archive {confirm.name}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-sub-600">
              {items.some(
                (item) => item.parentId === confirm.id && !item.archivedAt,
              )
                ? 'Its active subcategories will also be archived. '
                : ''}
              Saved history is kept. Archived categories cannot be selected for
              new activity.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button.Root
                variant="neutral"
                mode="stroke"
                onClick={() =>
                  void request(
                    '/categories/' + confirm.id + '/archive',
                    'Category archived.',
                    'POST',
                    {},
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
        {rows.length ? (
          <ul className="divide-y divide-stroke-soft-200 rounded-2xl bg-bg-white-0">
            {rows.map((category) => {
              const parent = items.find(
                (item) => item.id === category.parentId,
              );
              const siblings = rows.filter(
                (item) => item.parentId === category.parentId,
              );
              const index = siblings.findIndex(
                (item) => item.id === category.id,
              );
              const parentArchived = Boolean(parent?.archivedAt);
              return (
                <li
                  key={category.id}
                  className={
                    'flex flex-col items-stretch gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between ' +
                    (category.parentId ? 'pl-7 sm:pl-12' : '')
                  }
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CategoryMark icon={category.icon} color={category.color} />
                    <div className="min-w-0">
                      <h2 className="font-sans text-base font-medium break-words">
                        {category.name}
                      </h2>
                      {parent && (
                        <p className="mt-1 text-xs break-words text-text-sub-600">
                          Subcategory of {parent.name}
                        </p>
                      )}
                      {category.description && (
                        <p className="mt-1 text-sm break-words text-text-sub-600">
                          {category.description}
                        </p>
                      )}
                      {archived && parentArchived && (
                        <p className="mt-1 text-xs text-text-sub-600">
                          Restore the parent first.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {archived ? (
                      <Button.Root
                        size="small"
                        variant="neutral"
                        mode="stroke"
                        aria-label={'Restore ' + category.name}
                        disabled={busy !== null || parentArchived}
                        onClick={() =>
                          void request(
                            '/categories/' + category.id + '/restore',
                            'Category restored. Restore subcategories individually if needed.',
                            'POST',
                            {},
                          )
                        }
                      >
                        Restore<span className="sr-only"> {category.name}</span>
                      </Button.Root>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={busy !== null || index === 0}
                          aria-label={'Move ' + category.name + ' up'}
                          className="rounded-lg p-2 disabled:opacity-30"
                          onClick={() =>
                            void request(
                              '/categories/' + category.id + '/move',
                              'Category order saved.',
                              'POST',
                              { direction: 'up' },
                            )
                          }
                        >
                          <RiArrowUpLine size={18} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            busy !== null || index === siblings.length - 1
                          }
                          aria-label={'Move ' + category.name + ' down'}
                          className="rounded-lg p-2 disabled:opacity-30"
                          onClick={() =>
                            void request(
                              '/categories/' + category.id + '/move',
                              'Category order saved.',
                              'POST',
                              { direction: 'down' },
                            )
                          }
                        >
                          <RiArrowDownLine size={18} aria-hidden="true" />
                        </button>
                        {!category.parentId && (
                          <Button.Root
                            disabled={items.length >= 500}
                            aria-label={'Add subcategory to ' + category.name}
                            size="small"
                            variant="neutral"
                            mode="ghost"
                            onClick={(event) =>
                              open(event.currentTarget, null, category.id)
                            }
                          >
                            Add subcategory
                            <span className="sr-only"> to {category.name}</span>
                          </Button.Root>
                        )}
                        <Button.Root
                          aria-label={'Edit ' + category.name}
                          size="small"
                          variant="neutral"
                          mode="ghost"
                          onClick={(event) =>
                            open(event.currentTarget, category)
                          }
                        >
                          Edit<span className="sr-only"> {category.name}</span>
                        </Button.Root>
                        <Button.Root
                          aria-label={'Archive ' + category.name}
                          size="small"
                          variant="neutral"
                          mode="ghost"
                          onClick={() => {
                            setError('');
                            setNotice('');
                            setConfirm(category);
                          }}
                        >
                          Archive
                          <span className="sr-only"> {category.name}</span>
                        </Button.Root>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl bg-bg-white-0 px-6 py-14 text-center">
            <RiPriceTag3Line
              size={32}
              className="mx-auto mb-4 text-text-sub-600"
              aria-hidden="true"
            />
            <h2 className="text-xl font-medium">
              {archived
                ? 'No archived categories'
                : kind === 'expense'
                  ? 'Organize your spending'
                  : 'Organize your income'}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-sub-600">
              {archived
                ? 'Archived categories stay available here with their saved details.'
                : 'Add a category, then use subcategories when you need a little more detail.'}
            </p>
          </div>
        )}
        <p className="mt-6 text-xs leading-relaxed text-text-sub-600">
          {items.length} of 500 categories · Names stay reserved within their
          group, including archived categories.
          {items.length >= 500 &&
            ' Limit reached. Edit or reuse an existing category.'}
        </p>
      </fieldset>
      <CategoryEditor
        editor={editor}
        items={items}
        busy={busy === 'save'}
        error={error}
        opener={opener}
        onSave={save}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
      />
      {!editor && error && (
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
export default CategoriesWorkspace;

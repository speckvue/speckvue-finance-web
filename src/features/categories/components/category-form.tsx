'use client';

import TextField from '@/components/shared/text-field';
import * as Button from '@/components/ui/button';
import { RiLoader4Line } from '@remixicon/react';
import { useState } from 'react';
import {
  categoryColors,
  categoryIcons,
  categoryInputSchema,
  type Category,
  type CategoryInput,
} from '../contracts';
import CategoryMark from './category-mark';

/** Preserves failed drafts and prevents type changes or invalid hierarchy choices. */
const CategoryForm = ({
  initial,
  editingId,
  items,
  busy,
  onSave,
  onCancel,
}: {
  initial: CategoryInput;
  editingId: string | null;
  items: Category[];
  busy: boolean;
  onSave: (value: CategoryInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const hasChildren = items.some(
    (item) => item.parentId === editingId && editingId !== null,
  );
  const parents = items.filter(
    (item) =>
      !item.parentId &&
      !item.archivedAt &&
      item.kind === value.kind &&
      item.id !== editingId,
  );
  return (
    <form
      noValidate
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        const result = categoryInputSchema.safeParse(value);
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
        <legend className="sr-only">Category details</legend>
        <TextField
          id="category-name"
          label="Category name"
          maxLength={60}
          autoComplete="off"
          value={value.name}
          onChange={(event) => setValue({ ...value, name: event.target.value })}
          errors={errors.name}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category-kind" className="account-field-label">
              Type
            </label>
            <select
              id="category-kind"
              className="account-select"
              disabled={editingId !== null}
              aria-describedby="category-kind-hint"
              value={value.kind}
              onChange={(event) =>
                setValue({
                  ...value,
                  kind: event.target.value as CategoryInput['kind'],
                  parentId: null,
                })
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <p
              id="category-kind-hint"
              className="mt-2 text-xs text-text-sub-600"
            >
              Type stays fixed after creation.
            </p>
          </div>
          <div>
            <label htmlFor="category-parent" className="account-field-label">
              Parent category
            </label>
            <select
              id="category-parent"
              className="account-select"
              disabled={hasChildren}
              aria-describedby="category-parent-hint"
              value={value.parentId ?? ''}
              onChange={(event) =>
                setValue({ ...value, parentId: event.target.value || null })
              }
            >
              <option value="">None · Top-level category</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
            <p
              id="category-parent-hint"
              className="mt-2 text-xs text-text-sub-600"
            >
              {hasChildren
                ? 'Move existing subcategories before nesting this category.'
                : 'Choose an active category of the same type. One level of subcategories is supported.'}
            </p>
          </div>
          <div>
            <label htmlFor="category-color" className="account-field-label">
              Color
            </label>
            <select
              id="category-color"
              className="account-select"
              value={value.color}
              onChange={(event) =>
                setValue({
                  ...value,
                  color: event.target.value as CategoryInput['color'],
                })
              }
            >
              {categoryColors.map((color) => (
                <option key={color} value={color}>
                  {color[0]!.toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category-icon" className="account-field-label">
              Icon
            </label>
            <select
              id="category-icon"
              className="account-select"
              value={value.icon}
              onChange={(event) =>
                setValue({
                  ...value,
                  icon: event.target.value as CategoryInput['icon'],
                })
              }
            >
              {categoryIcons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon[0]!.toUpperCase() + icon.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TextField
          id="category-description"
          label="Description (optional)"
          maxLength={240}
          value={value.description ?? ''}
          onChange={(event) =>
            setValue({ ...value, description: event.target.value })
          }
          errors={errors.description}
        />
        <div
          className="flex items-center gap-3 rounded-xl bg-bg-weak-50 p-3"
          role="group"
          aria-label="Category preview"
        >
          <CategoryMark icon={value.icon} color={value.color} />
          <span className="min-w-0 text-sm break-words">
            {value.name.trim() || 'Category preview'}
          </span>
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
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
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
export default CategoryForm;

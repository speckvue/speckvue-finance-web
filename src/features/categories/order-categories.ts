import type { Category, CategoryKind } from './contracts';

/** Keeps roots and children together while preserving each sibling group's saved order. */
const orderCategories = (
  items: Category[],
  kind: CategoryKind,
  archived: boolean,
) => {
  const sorted = items
    .filter((item) => item.kind === kind)
    .toSorted((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const matches = (item: Category) => Boolean(item.archivedAt) === archived;
  return sorted
    .filter((item) => !item.parentId)
    .flatMap((root) => [
      ...(matches(root) ? [root] : []),
      ...sorted.filter((item) => item.parentId === root.id && matches(item)),
    ]);
};
export default orderCategories;

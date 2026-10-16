import { expect, test } from 'vitest';
import { categoryInputSchema, type Category } from './contracts';
import orderCategories from './order-categories';

const input = {
  name: 'Food',
  kind: 'expense',
  parentId: null,
  color: 'orange',
  icon: 'food',
  description: '',
};
test('normalizes labels and validates customization without accepting control characters', () => {
  expect(
    categoryInputSchema.parse({
      ...input,
      name: ' Ｆｏｏｄ ',
      description: ' Regular spending ',
    }),
  ).toMatchObject({ name: 'Food', description: 'Regular spending' });
});
test.each([
  { name: '' },
  { name: 'x'.repeat(61) },
  { name: 'Bad\u0000name' },
  { kind: 'transfer' },
  { color: '#fff' },
  { icon: '<script>' },
  { parentId: 'invalid' },
  { description: 'x'.repeat(241) },
  { description: 'Bad\nline' },
])('rejects invalid category details: %j', (invalid) => {
  expect(categoryInputSchema.safeParse({ ...input, ...invalid }).success).toBe(
    false,
  );
});
test('orders each root with its children and keeps archived children visible under their parent context', () => {
  const fixture = (
    id: string,
    parentId: string | null,
    position: number,
    archivedAt: string | null = null,
  ) => ({ id, parentId, position, kind: 'expense', archivedAt }) as Category;
  const items = [
    fixture('root2', null, 1),
    fixture('child', 'root1', 0),
    fixture('root1', null, 0),
    fixture('old', 'root1', 1, '2026-01-01T00:00:00Z'),
  ];
  expect(
    orderCategories(items, 'expense', false).map((item) => item.id),
  ).toEqual(['root1', 'child', 'root2']);
  expect(
    orderCategories(items, 'expense', true).map((item) => item.id),
  ).toEqual(['old']);
});

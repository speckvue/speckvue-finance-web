import { expect, test } from 'vitest';
import { payeeInputSchema } from './contracts';
import payeesPath from './payees-path';

const input = { name: 'North Market', kind: 'merchant', notes: '' };
test('normalizes payee names while preserving readable multiline notes', () => {
  expect(
    payeeInputSchema.parse({
      ...input,
      name: ' Ｎｏｒｔｈ   Market ',
      notes: ' Line one\nLine two ',
    }),
  ).toEqual({ ...input, notes: 'Line one\nLine two' });
});
test.each([
  { name: '' },
  { name: 'x'.repeat(101) },
  { name: 'bad\u0000name' },
  { kind: 'bank' },
  { notes: 'x'.repeat(501) },
  { notes: 'bad\u0000note' },
])('rejects invalid payee details: %j', (invalid) => {
  expect(payeeInputSchema.safeParse({ ...input, ...invalid }).success).toBe(
    false,
  );
});
test('preserves encoded filters and cursor for search and merge-target pagination', () => {
  const url = new URL(
    payeesPath(
      { status: 'active', kind: 'person', q: ' A&B 50% ' },
      'cursor',
      'source',
    ),
    'http://localhost',
  );
  expect(Object.fromEntries(url.searchParams)).toEqual({
    status: 'active',
    kind: 'person',
    q: 'A&B 50%',
    after: 'cursor',
    excludeId: 'source',
  });
  expect(payeesPath({ status: 'merged', kind: 'all', q: '' })).toBe(
    '/payees?status=merged',
  );
});

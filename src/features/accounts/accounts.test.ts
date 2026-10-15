import { expect, test } from 'vitest';
import { accountInputSchema, createAccountInputSchema } from './contracts';
import formatMoney from './format-money';

const input = {
  name: 'Bank',
  type: 'bank',
  currency: 'USD',
  openingBalance: '0',
  openingBalanceDate: '2026-01-01',
};
test('money formatting preserves large decimals and negative fractions exactly', () => {
  expect(
    formatMoney('999999999999999.9900', 'USD', 'en-US').replace(/\s/g, ''),
  ).toBe('USD999,999,999,999,999.99');
  expect(formatMoney('-0.2500', 'USD', 'en-US').replace(/\s/g, '')).toBe(
    '-USD0.25',
  );
  expect(formatMoney('-12.1230', 'KWD', 'en-US').replace(/\s/g, '')).toBe(
    '-KWD12.123',
  );
  expect(formatMoney('1234.0000', 'JPY', 'en-US').replace(/\s/g, '')).toBe(
    'JPY1,234',
  );
  expect(formatMoney('1.2345', 'CLF', 'en-US').replace(/\s/g, '')).toBe(
    'CLF1.2345',
  );
});
test.each([
  { openingBalance: '1e4' },
  { openingBalance: '1,000' },
  { openingBalance: '1000000000000000' },
  { openingBalance: '0.001' },
  { currency: 'JPY', openingBalance: '0.1' },
  { currency: 'ZZZ' },
  { name: '  ' },
  { name: 'bad\u0000name' },
  { openingBalanceDate: '2026-02-30' },
  { openingBalanceDate: '2999-01-01' },
])('rejects invalid financial input: %j', (invalid) => {
  expect(accountInputSchema.safeParse({ ...input, ...invalid }).success).toBe(
    false,
  );
});
test('accepts valid currency precision and trims account names', () => {
  expect(
    accountInputSchema.parse({
      ...input,
      name: ' Bank ',
      openingBalance: '-0.2500',
    }).name,
  ).toBe('Bank');
  expect(
    accountInputSchema.safeParse({
      ...input,
      currency: 'KWD',
      openingBalance: '-0.123',
    }).success,
  ).toBe(true);
});

test('uses the server currency snapshot rather than a different browser currency registry', () => {
  const schema = createAccountInputSchema(['USD', 'SLE']);
  expect(schema.safeParse({ ...input, currency: 'SLE' }).success).toBe(true);
  expect(schema.safeParse({ ...input, currency: 'EUR' }).success).toBe(false);
});

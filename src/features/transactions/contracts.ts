import { z } from 'zod';

export const transactionKinds = {
  income: 'Income',
  expense: 'Expense',
  refund: 'Refund',
} as const;
export const transactionSchema = z.object({
  id: z.uuid(),
  accountId: z.uuid(),
  accountName: z.string(),
  accountArchived: z.boolean().default(false),
  currency: z.string(),
  payeeId: z.uuid().nullable(),
  payeeName: z.string().nullable(),
  kind: z.enum(['income', 'expense', 'refund']),
  amount: z.string().regex(/^\d+\.\d{4}$/),
  date: z.iso.date(),
  notes: z.string().nullable(),
  revision: z.number().int().positive(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  splits: z
    .array(
      z.object({
        categoryId: z.uuid().nullable(),
        categoryName: z.string().nullable(),
        amount: z.string(),
      }),
    )
    .min(1)
    .max(20),
});
export const transactionsSchema = z.object({
  items: z.array(transactionSchema).max(50),
  nextCursor: z.uuid().nullable(),
});
export const transactionHistorySchema = z.object({
  nextRevision: z.number().int().positive().nullable(),
  items: z.array(
    z.object({
      revision: z.number(),
      action: z.enum(['created', 'updated', 'deleted']),
      createdAt: z.iso.datetime(),
      snapshot: transactionSchema,
    }),
  ),
});
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsPage = z.infer<typeof transactionsSchema>;
export type TransactionInput = {
  accountId: string;
  payeeId: string | null;
  kind: Transaction['kind'];
  amount: string;
  date: string;
  notes: string;
  splits: Array<{ categoryId: string | null; amount: string }>;
};

/** Converts user-entered money to integer ten-thousandths without floating-point arithmetic. */
export const moneyUnits = (value: string) => {
  if (!/^(?:0|[1-9]\d{0,14})(?:\.\d{1,4})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole!) * 10000n + BigInt(fraction.padEnd(4, '0'));
};
export const validateTransaction = (
  value: TransactionInput,
  digits: number,
  openingDate: string,
  today: string,
) => {
  if (!z.uuid().safeParse(value.accountId).success) return 'Select an account.';
  if (
    !z.iso.date().safeParse(value.date).success ||
    value.date < openingDate ||
    value.date > today
  )
    return 'Choose a date between the account opening balance date and today.';
  const validMoney = (amount: string) => {
    const units = moneyUnits(amount);
    return (
      units !== null &&
      units > 0n &&
      (amount.split('.')[1] ?? '').replace(/0+$/, '').length <= digits
    );
  };
  if (!validMoney(value.amount))
    return `Enter a positive amount with up to ${digits} decimal places.`;
  if (
    value.splits.length < 1 ||
    value.splits.length > 20 ||
    value.splits.some((s) => !validMoney(s.amount))
  )
    return 'Enter a positive amount for every category line (maximum 20).';
  if (
    new Set(value.splits.map((s) => s.categoryId)).size !== value.splits.length
  )
    return 'Combine duplicate category lines.';
  if (
    value.splits.reduce((sum, s) => sum + moneyUnits(s.amount)!, 0n) !==
    moneyUnits(value.amount)
  )
    return 'Category amounts must equal the transaction total.';
  if (
    value.notes.length > 2000 ||
    Array.from(value.notes).some(
      (c) => /\p{Cc}/u.test(c) && !'\n\r\t'.includes(c),
    )
  )
    return 'Use plain text notes of up to 2,000 characters.';
  return '';
};
export default transactionSchema;

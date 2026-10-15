import { z } from 'zod';

export const accountTypes = {
  bank: 'Bank',
  cash: 'Cash',
  credit_card: 'Credit card',
  investment: 'Investment',
  loan: 'Loan',
  other: 'Other',
} as const;
export const accountTypeSchema = z.enum([
  'bank',
  'cash',
  'credit_card',
  'investment',
  'loan',
  'other',
]);
export const createAccountInputSchema = (currencies: readonly string[]) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Enter an account name.')
        .max(80)
        .refine(
          (value) => !/\p{Cc}/u.test(value),
          'Enter a name without control characters.',
        ),
      type: accountTypeSchema,
      currency: z.string().regex(/^[A-Z]{3}$/),
      openingBalance: z
        .string()
        .regex(
          /^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,4})?$/,
          'Enter a decimal amount with up to 15 whole digits. Do not use commas.',
        ),
      openingBalanceDate: z.iso.date(),
    })
    .superRefine((value, ctx) => {
      if (!currencies.includes(value.currency)) {
        ctx.addIssue({
          code: 'custom',
          path: ['currency'],
          message: 'Select a supported currency.',
        });
        return;
      }
      const digits = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: value.currency,
      }).resolvedOptions().maximumFractionDigits!;
      if (
        (value.openingBalance.split('.')[1] ?? '').replace(/0+$/, '').length >
        digits
      )
        ctx.addIssue({
          code: 'custom',
          path: ['openingBalance'],
          message: `Use up to ${digits} decimal places for ${value.currency}.`,
        });
      if (value.openingBalanceDate > new Date().toISOString().slice(0, 10))
        ctx.addIssue({
          code: 'custom',
          path: ['openingBalanceDate'],
          message: 'Choose today or an earlier date.',
        });
    });
export const accountInputSchema = createAccountInputSchema(
  Intl.supportedValuesOf('currency'),
);
export const accountSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: accountTypeSchema,
  currency: z.string().regex(/^[A-Z]{3}$/),
  openingBalance: z.string().regex(/^-?\d+\.\d{4}$/),
  openingBalanceDate: z.iso.date(),
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const accountsSchema = z.object({
  items: z.array(accountSchema),
  nextCursor: z.uuid().nullable(),
});
export type Account = z.infer<typeof accountSchema>;
export type AccountInput = z.infer<typeof accountInputSchema>;
export type AccountsPage = z.infer<typeof accountsSchema>;
export default accountSchema;

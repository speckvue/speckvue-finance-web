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
export const createAccountInputSchema = (
  currencies: readonly string[],
  options?: { today?: string; currencyDigits?: Record<string, number> },
) =>
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
      institution: z
        .string()
        .trim()
        .max(120)
        .refine(
          (value) => !/\p{Cc}/u.test(value),
          'Use plain text without control characters.',
        )
        .optional(),
      notes: z
        .string()
        .trim()
        .max(1000)
        .refine(
          (value) =>
            !Array.from(value).some(
              (character) =>
                /\p{Cc}/u.test(character) && !'\n\r\t'.includes(character),
            ),
          'Use plain text without control characters.',
        )
        .optional(),
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
      const digits =
        options?.currencyDigits?.[value.currency] ??
        new Intl.NumberFormat('en', {
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
      if (
        value.openingBalanceDate >
        (options?.today ?? new Date().toISOString().slice(0, 10))
      )
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
  institution: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  openingBalance: z.string().regex(/^-?\d+\.\d{4}$/),
  openingBalanceDate: z.iso.date(),
  currentBalance: z
    .string()
    .regex(/^-?\d+\.\d{4}$/)
    .optional(),
  hasTransactions: z.boolean().optional(),
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const accountsSchema = z.object({
  items: z.array(accountSchema),
  nextCursor: z.uuid().nullable(),
});
export const accountOptionsSchema = z.object({
  currencies: z.array(z.string().regex(/^[A-Z]{3}$/)),
  currencyDigits: z.record(z.string(), z.number().int().min(0).max(4)),
  today: z.iso.date(),
});
export type AccountOptions = z.infer<typeof accountOptionsSchema>;
export type Account = z.infer<typeof accountSchema>;
export type AccountInput = z.infer<typeof accountInputSchema>;
export type AccountsPage = z.infer<typeof accountsSchema>;
export default accountSchema;

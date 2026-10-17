import { moneyUnits } from '@/features/transactions/contracts';
import { z } from 'zod';

const amountSchema = z.string().regex(/^\d+\.\d{4}$/);
export const transferSchema = z.object({
  id: z.uuid(),
  sourceAccountId: z.uuid(),
  sourceAccountName: z.string(),
  sourceCurrency: z.string(),
  destinationAccountId: z.uuid(),
  destinationAccountName: z.string(),
  destinationCurrency: z.string(),
  sentAmount: amountSchema,
  receivedAmount: amountSchema,
  exchangeRate: z.string().regex(/^\d+\.\d{30}$/),
  feeAmount: amountSchema,
  feeAccountId: z.uuid().nullable(),
  feeAccountName: z.string().nullable(),
  feeCurrency: z.string().nullable(),
  feeCategoryId: z.uuid().nullable(),
  feeCategoryName: z.string().nullable(),
  date: z.iso.date(),
  notes: z.string().nullable(),
  revision: z.number().int().positive(),
  accountsArchived: z.boolean(),
  deletedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  movements: z
    .array(
      z.object({
        accountId: z.uuid(),
        accountName: z.string(),
        currency: z.string(),
        role: z.enum(['outgoing', 'incoming', 'fee']),
        classification: z.enum(['transfer', 'expense']),
        amount: z.string().regex(/^-?\d+\.\d{4}$/),
      }),
    )
    .min(2)
    .max(3),
});
export const transfersSchema = z.object({
  items: z.array(transferSchema).max(50),
  nextCursor: z.uuid().nullable(),
});
export const transferHistorySchema = z.object({
  items: z
    .array(
      z.object({
        revision: z.number().int().positive(),
        action: z.enum(['created', 'updated', 'deleted']),
        createdAt: z.iso.datetime(),
        snapshot: transferSchema,
      }),
    )
    .max(50),
  nextRevision: z.number().int().positive().nullable(),
});
export type Transfer = z.infer<typeof transferSchema>;
export type TransfersPage = z.infer<typeof transfersSchema>;
export type TransferInput = {
  sourceAccountId: string;
  destinationAccountId: string;
  sentAmount: string;
  receivedAmount: string;
  feeAmount: string;
  feeAccountId: string | null;
  feeCategoryId: string | null;
  date: string;
  notes: string;
};
const rateScale = 10n ** 30n;
export const formatUnits = (value: bigint, digits = 4) => {
  const negative = value < 0n;
  const units = negative ? -value : value;
  const scale = 10n ** BigInt(digits);
  return (
    (negative ? '-' : '') +
    (units / scale).toString() +
    (digits ? '.' + (units % scale).toString().padStart(digits, '0') : '')
  );
};
/** Keeps rate calculations and half-up currency rounding exact, including very small FX ratios. */
export const rateFromAmounts = (sent: string, received: string) => {
  const from = moneyUnits(sent),
    to = moneyUnits(received);
  if (from === null || to === null || from <= 0n || to <= 0n) return '';
  return formatUnits((to * rateScale + from / 2n) / from, 30).replace(
    /\.?0+$/,
    '',
  );
};
export const receivedFromRate = (
  sent: string,
  rate: string,
  digits: number,
) => {
  const from = moneyUnits(sent);
  if (
    from === null ||
    from <= 0n ||
    !/^(?:0|[1-9]\d{0,18})(?:\.\d{0,30})?$/.test(rate)
  )
    return null;
  const [whole, fraction = ''] = rate.split('.');
  const scaled = BigInt(whole!) * rateScale + BigInt(fraction.padEnd(30, '0'));
  if (scaled <= 0n) return null;
  const denominator = 10000n * rateScale;
  const units =
    (from * scaled * 10n ** BigInt(digits) + denominator / 2n) / denominator;
  const result = formatUnits(units, digits);
  return moneyUnits(result) !== null && units > 0n ? result : null;
};
export default transferSchema;

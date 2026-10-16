import { z } from 'zod';

export const payeeKinds = {
  person: 'Person',
  merchant: 'Merchant',
  organization: 'Organization',
} as const;
export const payeeKindSchema = z.enum(['person', 'merchant', 'organization']);
export const payeeInputSchema = z.object({
  name: z
    .string()
    .transform((value) => value.normalize('NFKC').trim())
    .pipe(
      z
        .string()
        .min(1, 'Enter a payee name.')
        .max(100)
        .refine(
          (value) => !/\p{Cc}/u.test(value),
          'Use plain text without control characters.',
        ),
    )
    .transform((value) => value.replace(/\s+/gu, ' ')),
  kind: payeeKindSchema,
  notes: z
    .string()
    .transform((value) => value.normalize('NFKC').trim())
    .pipe(
      z
        .string()
        .max(500)
        .refine(
          (value) =>
            !Array.from(value).some(
              (character) =>
                /\p{Cc}/u.test(character) && !'\n\r\t'.includes(character),
            ),
          'Use plain text without control characters.',
        ),
    )
    .optional(),
});
export const payeeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  kind: payeeKindSchema,
  notes: z.string().nullable(),
  archivedAt: z.iso.datetime().nullable(),
  mergedIntoId: z.uuid().nullable(),
  mergedIntoName: z.string().nullable(),
  mergedAt: z.iso.datetime().nullable(),
  mergedNameCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const payeesSchema = z.object({
  items: z.array(payeeSchema).max(50),
  nextCursor: z.uuid().nullable(),
});
export type Payee = z.infer<typeof payeeSchema>;
export type PayeeInput = z.infer<typeof payeeInputSchema>;
export type PayeesPage = z.infer<typeof payeesSchema>;
export type PayeeFilters = {
  status: 'active' | 'archived' | 'merged';
  kind: Payee['kind'] | 'all';
  q: string;
};
export default payeeSchema;

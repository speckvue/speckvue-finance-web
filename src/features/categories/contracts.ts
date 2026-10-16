import { z } from 'zod';

export const categoryKinds = ['income', 'expense'] as const;
export const categoryColors = [
  'slate',
  'lime',
  'blue',
  'purple',
  'orange',
  'rose',
] as const;
export const categoryIcons = [
  'tag',
  'home',
  'food',
  'transport',
  'shopping',
  'income',
  'health',
  'education',
  'travel',
  'gift',
  'leisure',
  'work',
] as const;
export const categoryInputSchema = z.object({
  name: z
    .string()
    .transform((value) => value.normalize('NFKC').trim())
    .pipe(
      z
        .string()
        .min(1, 'Enter a category name.')
        .max(60, 'Use up to 60 characters.')
        .refine(
          (value) => !/\p{Cc}/u.test(value),
          'Use plain text without control characters.',
        ),
    ),
  kind: z.enum(categoryKinds),
  description: z
    .string()
    .trim()
    .max(240)
    .refine(
      (value) => !/\p{Cc}/u.test(value),
      'Use a single line without control characters.',
    )
    .optional(),
  color: z.enum(categoryColors),
  icon: z.enum(categoryIcons),
  parentId: z.uuid().nullable(),
});
export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  kind: z.enum(categoryKinds),
  description: z.string().nullable(),
  color: z.enum(categoryColors),
  icon: z.enum(categoryIcons),
  parentId: z.uuid().nullable(),
  position: z.number().int().nonnegative(),
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const categoriesSchema = z.object({
  items: z.array(categorySchema).max(500),
});
export type Category = z.infer<typeof categorySchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryKind = Category['kind'];
export type CategoryEditorState = {
  category: Category | null;
  kind: CategoryKind;
  parentId: string | null;
};
export default categorySchema;

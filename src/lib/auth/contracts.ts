import { z } from 'zod';

export const preferencesSchema = z.object({
  displayName: z.string().trim().min(1, 'Enter your name.').max(80),
  baseCurrency: z.string().regex(/^[A-Z]{3}$/, 'Choose a currency.'),
  locale: z.string().min(2).max(40),
  timezone: z.string().min(1).max(100),
  theme: z.enum(['system', 'light', 'dark']),
  weekStartsOn: z.number().int().min(0).max(6),
});
export const userSchema = preferencesSchema.partial().extend({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  displayName: z.string().nullable(),
  baseCurrency: z.string().nullable(),
  locale: z.string().nullable(),
  timezone: z.string().nullable(),
  theme: z.enum(['system', 'light', 'dark']),
  weekStartsOn: z.number().int(),
  onboardedAt: z.iso.datetime().nullable(),
});
export const csrfSchema = z.object({ csrfToken: z.string().min(1) });
export const sessionsSchema = z.array(
  z.object({
    id: z.uuid(),
    createdAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    current: z.boolean(),
  }),
);
export type User = z.infer<typeof userSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

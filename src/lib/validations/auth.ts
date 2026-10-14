import { z } from 'zod';

export const emailSchema = z.email('Enter a valid email address.').max(254);

export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Use no more than 128 characters.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default signUpSchema;

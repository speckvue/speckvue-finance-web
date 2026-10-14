import signUpSchema from '@/lib/validations/auth';
import { expect, it } from 'vitest';

it('rejects malformed emails and weak registration passwords', () => {
  expect(
    signUpSchema.safeParse({ email: 'invalid', password: 'short' }).success,
  ).toBe(false);
  expect(
    signUpSchema.safeParse({
      email: 'person@example.com',
      password: 'a-long-unique-password',
    }).success,
  ).toBe(true);
});

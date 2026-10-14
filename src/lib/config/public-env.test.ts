import { expect, it } from 'vitest';
import { publicEnvSchema } from './public-env';

it('fails on missing or non-HTTP public configuration', () => {
  expect(publicEnvSchema.safeParse({}).success).toBe(false);
  expect(
    publicEnvSchema.safeParse({
      NEXT_PUBLIC_APP_NAME: 'Finance',
      NEXT_PUBLIC_APP_URL: 'javascript:alert(1)',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
    }).success,
  ).toBe(false);
});

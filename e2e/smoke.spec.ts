import { expect, test } from '@playwright/test';

test('Redis readiness', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: 'ok' });
});

test('starter page and security headers', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await request.get('/');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()['content-security-policy']).not.toContain(
    'unsafe-eval',
  );
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Speckvue Finance' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('removed demo routes return 404', async ({ request }) => {
  for (const route of [
    '/dashboard',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/api/backend-status',
  ]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});

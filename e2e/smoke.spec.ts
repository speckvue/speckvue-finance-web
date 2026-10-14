import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const protectedURL = `http://${process.env.APP_HOST}:${process.env.APP_PROTECTION_PORT}`;

test('Redis readiness and container probe', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: 'ok' });
  const probe = spawnSync(process.execPath, ['scripts/healthcheck.ts'], {
    env: { ...process.env, PORT: process.env.APP_PORT },
    encoding: 'utf8',
  });
  expect(probe.status, probe.stderr).toBe(0);
});

test('production protection and security headers fail closed', async ({
  request,
  page,
}) => {
  const response = await request.get(protectedURL + '/dashboard', {
    maxRedirects: 0,
  });
  // A streamed App Router layout redirect may send HTTP 200 first.
  expect(await response.text()).not.toContain('Financial overview');
  await page.goto(protectedURL + '/dashboard');
  await expect(page).toHaveURL(protectedURL + '/sign-in');
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()['content-security-policy']).not.toContain(
    'unsafe-eval',
  );
});

test('sample dashboard, table, navigation and theme work', async ({
  page,
}, testInfo) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.goto('/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Financial overview' }),
  ).toBeVisible();
  await expect(page.getByText('Monthly salary')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('dashboard.png'),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await page
    .getByRole('textbox', { name: 'Search transactions' })
    .fill('missing');
  await expect(page.getByText('No transactions found')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByText('Monthly salary')).toBeVisible();
  await page.getByRole('button', { name: /Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({
    path: testInfo.outputPath('dashboard-dark.png'),
    fullPage: true,
  });
  await page.getByRole('link', { name: /^Sign in/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible();
  expect(failures).toEqual([]);
});

test('auth validation and legal placeholders are explicit', async ({
  page,
}) => {
  await page.goto('/sign-up');
  await page
    .getByRole('button', { name: 'Validate registration form' })
    .click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.goto('/privacy-policy');
  await expect(
    page.getByText('Draft placeholder · Not an approved policy'),
  ).toBeVisible();
});

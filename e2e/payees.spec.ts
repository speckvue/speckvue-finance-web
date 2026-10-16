import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('payees retain merged identities, search old names and archive safely', async ({
  page,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Run with the isolated API browser test runner.',
  );
  const origin = new URL(baseURL!).origin;
  const email = 'payees-' + randomUUID() + '@test.invalid';
  const password = 'Payee browser verification passphrase!';
  expect(
    (
      await page.request.post('/api/backend/auth/signup', {
        headers: { Origin: origin },
        data: { email, password },
      })
    ).status(),
  ).toBe(201);
  const signin = await page.request.post('/api/backend/auth/signin', {
    headers: { Origin: origin },
    data: { email, password },
  });
  expect(signin.status()).toBe(200);
  const { csrfToken } = await signin.json();
  expect(
    (
      await page.request.post('/api/backend/users/me/onboarding', {
        headers: { Origin: origin, 'X-CSRF-Token': csrfToken },
        data: {
          displayName: 'Payee reviewer',
          baseCurrency: 'USD',
          locale: 'en-US',
          timezone: 'UTC',
          theme: 'light',
          weekStartsOn: 1,
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/payees');
  await expect(page.locator('#workspace-content')).toHaveCSS(
    'overflow-y',
    'scroll',
  );
  const add = async (name: string, notes: string) => {
    await page.getByRole('button', { name: 'Add payee', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Add a payee' });
    await dialog.getByLabel('Payee name').fill(name);
    await dialog.getByLabel('Notes (optional)').fill(notes);
    await dialog
      .getByRole('button', { name: 'Add payee', exact: true })
      .click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  };
  await add('North Market', 'Surviving notes');
  await add('Market North', 'Retained source notes');
  await page
    .getByRole('button', { name: 'Merge Market North', exact: true })
    .click();
  const merge = page.getByRole('dialog', { name: 'Merge payees' });
  const target = merge.getByRole('radio');
  await expect(target).toBeEnabled();
  await target.check();
  await expect(
    merge.getByRole('button', { name: 'Confirm merge' }),
  ).toBeDisabled();
  await merge
    .getByRole('checkbox', {
      name: 'I understand this merge cannot be undone.',
    })
    .check();
  await merge.getByRole('button', { name: 'Confirm merge' }).click();
  await expect(merge).toBeHidden();
  await page.getByLabel('Search payees', { exact: true }).fill('Market North');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'North Market', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Market North', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('button', { name: 'Merged', exact: true }).click();
  await expect(
    page.getByText('Retained source notes', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Restore Market North', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Active', exact: true }).click();
  await page
    .getByRole('button', { name: 'Archive North Market', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirm archive' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Payee archived.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Archived', exact: true }).click();
  await page
    .getByRole('button', { name: 'Restore North Market', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'No archived payees' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Active', exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

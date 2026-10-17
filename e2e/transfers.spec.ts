import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('linked transfers, FX and fees update all balances and retain both sides in history', async ({
  page,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Run with the isolated API browser test runner.',
  );
  const origin = new URL(baseURL!).origin;
  const headers: Record<string, string> = { Origin: origin };
  const post = async (path: string, data: object) => {
    const result = await page.request.post('/api/backend' + path, {
      headers,
      data,
    });
    expect(result.ok()).toBe(true);
    return result.json();
  };
  const email = 'transfers-' + randomUUID() + '@test.invalid',
    password = 'Linked transfer browser verification passphrase!';
  await post('/auth/signup', { email, password });
  headers['X-CSRF-Token'] = (
    await post('/auth/signin', { email, password })
  ).csrfToken;
  await post('/users/me/onboarding', {
    displayName: 'Transfer reviewer',
    baseCurrency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    theme: 'light',
    weekStartsOn: 1,
  });
  const account = async (
    name: string,
    currency: string,
    openingBalance: string,
  ) =>
    (
      await post('/accounts', {
        name,
        type: 'bank',
        currency,
        openingBalance,
        openingBalanceDate: '2020-01-01',
      })
    ).id as string;
  const source = await account('Bank', 'USD', '1000'),
    destination = await account('Wallet', 'USD', '0'),
    foreign = await account('Euro', 'EUR', '0');
  const balance = async (id: string) => {
    const result = await page.request.get('/api/backend/accounts/' + id);
    expect(result.ok()).toBe(true);
    return (await result.json()).currentBalance;
  };
  await page.goto('/transfers');
  await expect(page.locator('#workspace-content')).toHaveCSS(
    'overflow-y',
    'scroll',
  );
  await page.getByRole('button', { name: 'Add transfer', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Add transfer' });
  await dialog.getByLabel('From account').selectOption(source);
  await dialog.getByLabel('To account').selectOption(destination);
  await dialog.getByLabel('Amount sent · USD', { exact: true }).fill('100');
  await expect(
    dialog.getByLabel('Amount received · USD', { exact: true }),
  ).toHaveValue('100');
  await dialog.getByLabel('Transfer fee', { exact: true }).fill('2');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog
    .getByRole('button', { name: 'Add transfer', exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(await balance(source)).toBe('898.0000');
  expect(await balance(destination)).toBe('100.0000');
  const row = page.locator('[data-transfer-id]');
  await row.getByRole('button', { name: 'Edit transfer' }).click();
  dialog = page.getByRole('dialog', { name: 'Edit transfer' });
  await dialog.getByLabel('To account').selectOption(foreign);
  await dialog.getByLabel('Amount received · EUR', { exact: true }).fill('90');
  await expect(
    dialog.getByLabel('Exchange rate · 1 USD in EUR', { exact: true }),
  ).toHaveValue('0.9');
  await dialog.getByLabel('Transfer fee', { exact: true }).fill('1');
  await dialog.getByLabel('Fee charged to').selectOption(foreign);
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toBeHidden();
  expect(await balance(source)).toBe('900.0000');
  expect(await balance(destination)).toBe('0.0000');
  expect(await balance(foreign)).toBe('89.0000');
  await row.getByRole('button', { name: 'View transfer history' }).click();
  let history = page.getByRole('dialog', { name: 'Transfer history' });
  await expect(history.getByText(/created.*Revision 1/i)).toBeVisible();
  await expect(history.getByText(/updated.*Revision 2/i)).toBeVisible();
  await history.getByRole('button', { name: 'Close history' }).click();
  await row.getByRole('button', { name: 'Delete transfer' }).click();
  await page
    .getByRole('dialog', { name: 'Delete transfer' })
    .getByRole('button', { name: 'Confirm deletion' })
    .click();
  await expect(row).toHaveCount(0);
  expect(await balance(source)).toBe('1000.0000');
  expect(await balance(destination)).toBe('0.0000');
  expect(await balance(foreign)).toBe('0.0000');
  await page.getByLabel('Show', { exact: true }).selectOption('deleted');
  await page.getByLabel('Account', { exact: true }).selectOption(foreign);
  await expect(row).toBeVisible();
  await expect(row.getByRole('button', { name: 'Edit transfer' })).toHaveCount(
    0,
  );
  await row.getByRole('button', { name: 'View transfer history' }).click();
  history = page.getByRole('dialog', { name: 'Transfer history' });
  await expect(history.getByText(/deleted.*Revision 3/i)).toBeVisible();
});

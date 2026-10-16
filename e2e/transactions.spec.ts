import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('manual postings, refunds and deletion update balances and preserve history', async ({
  page,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Run with the isolated API browser test runner.',
  );
  const origin = new URL(baseURL!).origin;
  const email = 'transactions-' + randomUUID() + '@test.invalid';
  const password = 'Manual transaction browser test passphrase!';
  const headers: Record<string, string> = { Origin: origin };
  const post = async (path: string, body: object) => {
    const result = await page.request.post('/api/backend' + path, {
      headers,
      data: body,
    });
    expect(result.ok()).toBe(true);
    return result.json();
  };
  await post('/auth/signup', { email, password });
  headers['X-CSRF-Token'] = (
    await post('/auth/signin', { email, password })
  ).csrfToken;
  await post('/users/me/onboarding', {
    displayName: 'Transaction reviewer',
    baseCurrency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    theme: 'light',
    weekStartsOn: 1,
  });
  const account = await post('/accounts', {
    name: 'Bank',
    type: 'bank',
    currency: 'USD',
    openingBalance: '100',
    openingBalanceDate: '2020-01-01',
  });
  const categories = await post('/categories', {
    name: 'Groceries',
    kind: 'expense',
    color: 'lime',
    icon: 'tag',
    parentId: null,
  });
  const category = categories.items[0].id;
  const balance = async () => {
    const result = await page.request.get(
      '/api/backend/accounts/' + account.id,
    );
    expect(result.ok()).toBe(true);
    return (await result.json()).currentBalance;
  };
  await page.goto('/transactions');
  await expect(page.locator('#workspace-content')).toHaveCSS(
    'overflow-y',
    'scroll',
  );
  await page
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  let dialog = page.getByRole('dialog', { name: 'Add transaction' });
  await dialog.getByLabel('Account', { exact: true }).selectOption(account.id);
  await dialog.getByLabel('Amount · USD', { exact: true }).fill('30.10');
  await dialog.getByLabel('Category', { exact: true }).selectOption(category);
  await dialog.getByLabel('Notes (optional)').fill('Weekly groceries');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog
    .getByRole('button', { name: 'Add transaction', exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Weekly groceries', { exact: true }),
  ).toBeVisible();
  expect(await balance()).toBe('69.9000');
  const row = page.locator('[data-transaction-id]');
  await row.getByRole('button', { name: 'Edit transaction' }).click();
  dialog = page.getByRole('dialog', { name: 'Edit transaction' });
  await dialog.getByLabel('Transaction type').selectOption('refund');
  await dialog.getByLabel('Amount · USD', { exact: true }).fill('5.20');
  await dialog.getByLabel('Category', { exact: true }).selectOption(category);
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toBeHidden();
  expect(await balance()).toBe('105.2000');
  await row.getByRole('button', { name: 'View transaction history' }).click();
  const history = page.getByRole('dialog', { name: 'Transaction history' });
  await expect(history.getByText('Created · Revision 1')).toBeVisible();
  await expect(history.getByText('Updated · Revision 2')).toBeVisible();
  await history.getByRole('button', { name: 'Close history' }).click();
  await row.getByRole('button', { name: 'Delete transaction' }).click();
  await page
    .getByRole('dialog', { name: 'Delete transaction' })
    .getByRole('button', { name: 'Confirm deletion' })
    .click();
  await expect(row).toHaveCount(0);
  expect(await balance()).toBe('100.0000');
  await page.getByLabel('Show', { exact: true }).selectOption('deleted');
  await expect(row).toBeVisible();
  await expect(
    row.getByRole('button', { name: 'Edit transaction' }),
  ).toHaveCount(0);
  await row.getByRole('button', { name: 'View transaction history' }).click();
  await expect(
    page.getByRole('dialog').getByText('Deleted · Revision 3'),
  ).toBeVisible();
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('categories preserve hierarchy, ordering, customization and archived identities', async ({
  page,
  baseURL,
}) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Run with the isolated API browser test runner.',
  );
  const origin = new URL(baseURL!).origin;
  const email = 'categories-' + randomUUID() + '@test.invalid';
  const password = 'Unique category browser test passphrase!';
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
          displayName: 'Category reviewer',
          baseCurrency: 'USD',
          locale: 'en-US',
          timezone: 'UTC',
          theme: 'light',
          weekStartsOn: 1,
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/categories');
  await expect(page.locator('#workspace-content')).toHaveCSS(
    'overflow-y',
    'scroll',
  );
  const add = async (name: string, parent?: string) => {
    await page
      .getByRole('button', {
        name: parent ? 'Add subcategory to ' + parent : 'Add category',
        exact: true,
      })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Add a category' });
    await expect(dialog.getByLabel('Category name')).toBeFocused();
    await dialog.getByLabel('Category name').fill(name);
    await dialog.getByLabel('Color', { exact: true }).selectOption('purple');
    await dialog.getByLabel('Icon', { exact: true }).selectOption('home');
    await dialog
      .getByRole('button', { name: 'Add category', exact: true })
      .click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
  };
  await add('Home');
  await add('Travel');
  await add('Rent', 'Home');
  await page
    .getByRole('button', { name: 'Move Travel up', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Category order saved.' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('#workspace-content')).toHaveCSS(
    'overflow-y',
    'scroll',
  );
  expect(await page.locator('.finance-content h2').allTextContents()).toEqual([
    'Travel',
    'Home',
    'Rent',
  ]);
  await page.getByRole('button', { name: 'Edit Rent', exact: true }).click();
  const editor = page.getByRole('dialog');
  await expect(editor.getByLabel('Type', { exact: true })).toBeDisabled();
  await editor.getByLabel('Category name').fill('Monthly rent');
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(editor).toBeHidden();
  await page.getByRole('button', { name: 'Archive Home', exact: true }).click();
  await expect(
    page.getByText(/Its active subcategories will also be archived/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm archive' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Category archived.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Archived', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Restore Monthly rent', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Restore Home', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Restore Monthly rent', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Restore Monthly rent', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'No archived categories' }),
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

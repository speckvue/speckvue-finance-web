import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('financial accounts persist, archive, restore, and use responsive navigation', async ({
  page,
  baseURL,
}, testInfo) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Run with the isolated API browser test runner.',
  );
  const origin = new URL(baseURL!).origin;
  const email = 'accounts-' + randomUUID() + '@test.invalid';
  const password = 'A unique account test passphrase!';
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
          displayName: 'Account reviewer',
          baseCurrency: 'USD',
          locale: 'en-US',
          timezone: 'UTC',
          weekStartsOn: 1,
          theme: 'light',
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto('/workspace');
  const mobile = (page.viewportSize()?.width ?? 1440) < 768;
  await expect(
    page
      .locator('.finance-header')
      .getByRole('button', { name: 'Signout', exact: true }),
  ).toHaveCount(0);
  if (!mobile) {
    const profile = page.locator('.finance-sidebar .finance-profile');
    const bounds = await profile.boundingBox();
    expect(bounds!.y + bounds!.height).toBeGreaterThan(
      page.viewportSize()!.height - 32,
    );
    await profile.click();
    await expect(
      page.getByRole('menuitem', { name: 'Signout', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(profile).toBeFocused();
  }
  if (mobile) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Accounts', exact: true }).click();
    await expect(drawer).toBeHidden();
  } else
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Accounts', exact: true })
      .click();
  await expect(page).toHaveURL(/\/accounts$/);
  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  await page.getByLabel('Account name').fill('Everyday bank');
  await page.getByLabel('Institution (optional)').fill('Example institution');
  await page.getByLabel('Notes (optional)').fill('Primary account');
  await page
    .getByLabel('Opening balance', { exact: true })
    .fill('999999999999999.99');
  await page.getByRole('button', { name: 'Add account', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Everyday bank', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/999,999,999,999,999\.99/)).toBeVisible();
  await page.reload();
  await page
    .getByRole('link', { name: 'Details Everyday bank', exact: true })
    .click();
  await expect(
    page.getByText('Example institution', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Primary account', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Edit account', exact: true }).click();
  await expect(page.getByLabel('Currency', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page
    .getByRole('link', { name: 'Back to accounts', exact: true })
    .click();
  await page.getByRole('button', { name: /Edit.*Everyday bank/ }).click();
  await page.getByLabel('Account name').fill('Everyday savings');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Everyday savings' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Archive.*Everyday savings/ }).click();
  await page
    .getByRole('button', { name: 'Archive account', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Start with your first account' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Archived', exact: true }).click();
  await page.getByRole('button', { name: /Restore.*Everyday savings/ }).click();
  await expect(
    page.getByRole('heading', { name: 'No archived accounts' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Active', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Everyday savings' }),
  ).toBeVisible();
  for (const theme of ['Dark', 'Light']) {
    await page.goto('/settings');
    await page
      .getByLabel('Appearance', { exact: true })
      .selectOption(theme.toLowerCase());
    await page
      .getByRole('button', { name: 'Save preferences', exact: true })
      .click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Preferences saved.' }),
    ).toBeVisible();
    await page.goto('/accounts');
    await expect(page.locator('html')).toHaveClass(
      new RegExp(theme.toLowerCase()),
    );
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
    await page.screenshot({
      path: testInfo.outputPath('accounts-' + theme.toLowerCase() + '.png'),
      fullPage: true,
    });
  }
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('anonymous users cannot render protected account pages', async ({
  page,
}) => {
  for (const route of ['/workspace', '/settings', '/onboarding']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/signin$/);
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();
  }
});

test('signup, onboarding, saved settings and signout work against the API', async ({
  page,
}, testInfo) => {
  test.skip(
    process.env.E2E_AUTH_ENABLED !== 'true',
    'Enable connected account tests with a running API.',
  );
  const email = 'browser-' + randomUUID() + '@test.invalid';
  const password = 'A unique browser passphrase!';
  await page.goto('/signup');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('heading', { name: 'Signup request accepted' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Continue to signin' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Signin', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel('Your name').fill('Alex');
  await page.getByLabel('Base currency').selectOption('INR');
  await page.getByLabel('Language and number format').selectOption('en-IN');
  await page.getByLabel('Timezone', { exact: true }).selectOption('UTC');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Finish setup' }).click();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome, Alex' }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Welcome, Alex' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Base currency')).toHaveValue('INR');
  await page.getByLabel('Your name').fill('Alex Updated');
  await page.getByLabel('Base currency').selectOption('EUR');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Preferences saved.' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your name')).toHaveValue('Alex Updated');
  await expect(page.getByLabel('Base currency')).toHaveValue('EUR');
  await expect(page.getByText('This session', { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('settings.png'),
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByLabel('Current password').fill(password);
  await page
    .getByLabel('New password', { exact: true })
    .fill(password + 'updated');
  await page.getByLabel('Confirm new password').fill(password + 'updated');
  await page
    .getByRole('button', { name: 'Change password', exact: true })
    .click();
  await expect(page).toHaveURL(/\/signin$/);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password + 'updated');
  await page.getByRole('button', { name: 'Signin', exact: true }).click();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(
    page.getByRole('heading', { name: 'Welcome, Alex Updated' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Signout', exact: true }).click();
  await expect(page).toHaveURL(/\/signin$/);
  await page.goto('/settings');
  await expect(page).toHaveURL(/\/signin$/);
});

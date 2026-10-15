import { expect, test } from '@playwright/test';

test('supplied logo follows the selected theme', async ({
  page,
  request,
}, testInfo) => {
  await page.goto('/');
  const light = page.locator('img[src="/brand/logo-light.svg"]');
  const dark = page.locator('img[src="/brand/logo-dark.svg"]');
  for (const theme of ['Light', 'Dark'] as const) {
    await page.getByRole('button', { name: /Theme:/ }).click();
    await page.getByRole('menuitemradio', { name: theme, exact: true }).click();
    await expect(theme === 'Light' ? light : dark).toBeVisible();
    await expect(theme === 'Light' ? dark : light).toBeHidden();
    await page.screenshot({
      path: testInfo.outputPath('logo-' + theme.toLowerCase() + '.png'),
      fullPage: true,
    });
  }
  expect((await request.get('/brand/logo-light.svg')).status()).toBe(200);
  expect((await request.get('/brand/logo-dark.svg')).status()).toBe(200);
});

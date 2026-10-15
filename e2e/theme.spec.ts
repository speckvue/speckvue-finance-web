import { expect, test } from '@playwright/test';

for (const system of ['light', 'dark'] as const) {
  test(`system appearance follows ${system} without a header theme selector`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: system });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(new RegExp(system));
    await expect(page.getByRole('button', { name: /Theme:/ })).toHaveCount(0);
    await page.emulateMedia({
      colorScheme: system === 'light' ? 'dark' : 'light',
    });
    await expect(page.locator('html')).toHaveClass(
      new RegExp(system === 'light' ? 'dark' : 'light'),
    );
    await page.reload();
    await expect(page.locator('html')).toHaveClass(
      new RegExp(system === 'light' ? 'dark' : 'light'),
    );
  });
}

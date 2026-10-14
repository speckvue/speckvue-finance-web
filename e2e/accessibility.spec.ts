import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['Light', 'Dark'] as const) {
  test('starter page is accessible in ' + theme + ' mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Theme:/ }).click();
    await page.getByRole('menuitemradio', { name: theme, exact: true }).click();
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
  });
}

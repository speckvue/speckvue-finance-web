import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['Light', 'Dark'] as const) {
  test('starter page is accessible in ' + theme + ' mode', async ({ page }) => {
    await page.emulateMedia({
      colorScheme: theme === 'Dark' ? 'dark' : 'light',
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(
      new RegExp(theme.toLowerCase()),
    );
    for (const route of ['/', '/signin', '/signup']) {
      await page.goto(route);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
        route,
      ).toEqual([]);
    }
  });
}

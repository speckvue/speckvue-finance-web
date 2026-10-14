import { expect, test } from '@playwright/test';

for (const system of ['light', 'dark'] as const) {
  test(`appearance selection works with a ${system} system theme`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: system });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /Theme:/ });
    await expect(trigger).toBeEnabled();
    await expect(page.locator('html')).toHaveClass(new RegExp(system));
    const colors: string[] = [];
    for (const choice of ['Dark', 'Light'] as const) {
      await trigger.click();
      await page
        .getByRole('menuitemradio', { name: choice, exact: true })
        .click();
      await expect(page.locator('html')).toHaveClass(
        new RegExp(choice.toLowerCase()),
      );
      await expect(trigger).toBeFocused();
      colors.push(
        await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor,
        ),
      );
      await page.reload();
      await expect(page.locator('html')).toHaveClass(
        new RegExp(choice.toLowerCase()),
      );
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
        choice.toLowerCase(),
      );
    }
    expect(colors[0]).not.toBe(colors[1]);
    await trigger.click();
    await page
      .getByRole('menuitemradio', { name: 'System', exact: true })
      .click();
    await expect(page.locator('html')).toHaveClass(new RegExp(system));
    await page.emulateMedia({
      colorScheme: system === 'light' ? 'dark' : 'light',
    });
    await expect(page.locator('html')).toHaveClass(
      new RegExp(system === 'light' ? 'dark' : 'light'),
    );
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
      'system',
    );
  });
}

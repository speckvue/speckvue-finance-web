/**
 * @fileoverview Checks rendered routes for detectable accessibility violations.
 *
 * Covers desktop and mobile layouts, form errors, and both appearance modes.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

test('routes and validation feedback meet automated accessibility checks', async ({
  page,
}) => {
  for (const route of [
    '/dashboard',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
  ]) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations,
      `${route}: ${JSON.stringify(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })))}`,
    ).toEqual([]);
  }
  await page.goto('/sign-up');
  await page
    .getByRole('button', { name: 'Validate registration form' })
    .click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('dark dashboard and mobile navigation meet automated accessibility checks', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /Theme:/ }).click();
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Open navigation' }),
    ).toBeFocused();
  }
});

// ---------------------------------------------------------------------------

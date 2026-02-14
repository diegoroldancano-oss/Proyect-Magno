import { test, expect } from '@playwright/test';

test('smoke', async ({ page }) => {
  await page.goto('data:text/html,<html><body><button id="x">ok</button></body></html>');
  await expect(page.locator('#x')).toBeVisible();
});

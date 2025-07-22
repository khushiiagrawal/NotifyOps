import { test, expect } from '@playwright/test';

test('homepage has NotifyOps in title and displays hero section', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/NotifyOps/i);
  await expect(page.locator('h1, h2')).toContainText([/AI-Powered|NotifyOps/i]);
});

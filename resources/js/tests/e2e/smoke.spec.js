import { test, expect } from '@playwright/test';

test('basic smoke test', async ({ page }) => {
    // Navigate to the login page (which should be accessible without auth)
    await page.goto('/login');

    // Check if the login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify page title or heading
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
}); 
import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify that we're on the homepage
    expect(page.url()).toContain('localhost:8000');

    // Check if some basic elements are visible
    await expect(page.locator('body')).toBeVisible();
}); 
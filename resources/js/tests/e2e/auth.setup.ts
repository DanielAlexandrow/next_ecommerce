import { test as setup, expect, chromium } from '@playwright/test';

async function globalSetup() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to login page
    await page.goto('http://localhost:8000/adminlogin');

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation and verify login
    await page.waitForURL('http://localhost:8000/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Save signed-in state to 'playwright/.auth/admin.json'
    await page.context().storageState({ path: 'playwright/.auth/admin.json' });

    await browser.close();
}

export default globalSetup; 
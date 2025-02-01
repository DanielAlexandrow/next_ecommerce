import { chromium } from '@playwright/test';

async function globalSetup() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to login page
    await page.goto('http://localhost:8000/login');

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('http://localhost:8000/dashboard');
    await page.waitForSelector('.dashboard-content', { timeout: 10000 });

    // Save signed-in state to 'playwright/.auth/admin.json'
    await page.context().storageState({
        path: 'playwright/.auth/admin.json'
    });

    await browser.close();
}

export default globalSetup; 
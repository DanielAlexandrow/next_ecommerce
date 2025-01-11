import { test, expect } from '@playwright/test';

test.describe('AdminSidebar', () => {
    test.beforeEach(async ({ page }) => {
        // First login to get access to admin pages
        await page.goto('/login');
        await page.getByLabel('Email').fill('admin@example.com');
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: 'Log in' }).click();

        // Wait for login to complete and redirect
        await page.waitForURL('/admin');
    });

    test('renders desktop sidebar with all navigation items', async ({ page }) => {
        // Wait for the sidebar to be visible
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Check if all navigation items are present
        await expect(page.getByText('Dashboard')).toBeVisible();
        await expect(page.getByText('Products')).toBeVisible();
        await expect(page.getByText('Orders')).toBeVisible();
        await expect(page.getByText('Customers')).toBeVisible();
        await expect(page.getByText('Categories')).toBeVisible();
        await expect(page.getByText('Analytics')).toBeVisible();
        await expect(page.getByText('Delivery')).toBeVisible();
        await expect(page.getByText('Settings')).toBeVisible();

        // Check if icons are present
        const icons = await page.locator('svg').count();
        expect(icons).toBeGreaterThan(0);
    });

    test('shows mobile menu button on small screens', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });

        // Wait for the mobile menu button to be visible
        const menuButton = page.getByRole('button', { name: /menu/i });
        await expect(menuButton).toBeVisible();

        // Click the menu button and verify the sidebar opens
        await menuButton.click();
        await expect(page.getByText('Admin Panel')).toBeVisible();
    });

    test('navigation links work correctly', async ({ page }) => {
        // Wait for the sidebar to be visible
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Click on Products link and verify navigation
        await page.getByText('Products').click();
        await expect(page).toHaveURL('/admin/products');

        // Click on Orders link and verify navigation
        await page.getByText('Orders').click();
        await expect(page).toHaveURL('/admin/orders');

        // Click on Customers link and verify navigation
        await page.getByText('Customers').click();
        await expect(page).toHaveURL('/admin/customers');
    });

    test('sidebar can be collapsed and expanded', async ({ page }) => {
        // Wait for the sidebar to be visible
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Find and click the sidebar trigger button
        const triggerButton = page.getByRole('button', { name: /toggle sidebar/i });
        await expect(triggerButton).toBeVisible();

        // Collapse the sidebar
        await triggerButton.click();
        await expect(page.locator('[data-state="collapsed"]')).toBeVisible();

        // Expand the sidebar
        await triggerButton.click();
        await expect(page.locator('[data-state="expanded"]')).toBeVisible();
    });

    test('keyboard shortcut toggles sidebar', async ({ page }) => {
        // Wait for the sidebar to be visible
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Test Ctrl+B shortcut (or Cmd+B on macOS)
        await page.keyboard.press('Control+B');
        await expect(page.locator('[data-state="collapsed"]')).toBeVisible();

        await page.keyboard.press('Control+B');
        await expect(page.locator('[data-state="expanded"]')).toBeVisible();
    });

    test('sidebar state persists after page reload', async ({ page }) => {
        // Wait for the sidebar to be visible
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Collapse the sidebar
        const triggerButton = page.getByRole('button', { name: /toggle sidebar/i });
        await triggerButton.click();
        await expect(page.locator('[data-state="collapsed"]')).toBeVisible();

        // Reload the page and wait for the sidebar
        await page.reload();
        await page.waitForSelector('[data-sidebar="sidebar"]');

        // Verify sidebar remains collapsed
        await expect(page.locator('[data-state="collapsed"]')).toBeVisible();
    });
}); 
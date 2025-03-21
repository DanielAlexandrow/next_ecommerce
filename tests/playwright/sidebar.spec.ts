import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

test.describe('Admin Sidebar Navigation', () => {
    // Use stored auth state for all tests
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        // Start from products page where sidebar is visible
        await page.goto(`${BASE_URL}/shop-settings`);
    });

    // Test all sidebar items are visible
    test('displays all sidebar navigation items', async ({ page }) => {
        const expectedItems = [
            { text: 'New Product', href: '/products/create' },
            { text: 'Product List', href: '/products' },
            { text: 'Images', href: '/images' },
            { text: 'Navigation Maker', href: '/navigation' },
            { text: 'Orders', href: '/orders' },
            { text: 'Brands', href: '/brands' },
            { text: 'Store', href: '/productsearch' },
            { text: 'Driver Location', href: '/driver/coordinates' },
            { text: 'Settings', href: '/shop-settings' },
            { text: 'Users', href: '/users' },
            { text: 'Categories', href: '/admin/categories' }
        ];

        // Wait for sidebar to be visible
        await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();

        // Check each navigation item
        for (const item of expectedItems) {
            const testId = `sidebar-nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}`;
            const linkElement = page.locator(`[data-testid="${testId}"]`);
            await expect(linkElement).toBeVisible();
            expect(await linkElement.textContent()).toContain(item.text);
        }
    });

    // Test sidebar minimize functionality
    test('can be minimized and maximized', async ({ page }) => {
        // Find the minimize button
        const minimizeButton = page.locator('[data-testid="sidebar-minimize-button"]');
        await expect(minimizeButton).toBeVisible();

        // Get initial sidebar state
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        const initialClass = await sidebar.getAttribute('class');

        // Click minimize button
        await minimizeButton.click();

        // Verify sidebar is minimized
        await expect(sidebar).toHaveClass(expect.stringContaining('minimized'));

        // Click again to maximize
        await minimizeButton.click();

        // Verify sidebar returned to original state
        await expect(sidebar).toHaveAttribute('class', initialClass || '');
    });

    // Test all navigation destinations
    test('correctly navigates to all sidebar destinations', async ({ page }) => {
        const navigationTests = [
            {
                text: 'New Product',
                href: '/products/create',
                expectedContent: 'Create Product'
            },
            {
                text: 'Product List',
                href: '/products',
                expectedContent: 'Products'
            },
            {
                text: 'Images',
                href: '/images',
                expectedContent: 'Images'
            },
            {
                text: 'Navigation Maker',
                href: '/navigation',
                expectedContent: 'Navigation'
            },
            {
                text: 'Orders',
                href: '/orders',
                expectedContent: 'Orders'
            },
            {
                text: 'Brands',
                href: '/brands',
                expectedContent: 'Brands'
            },
            {
                text: 'Store',
                href: '/productsearch',
                expectedContent: 'Filters'
            },
            {
                text: 'Settings',
                href: '/shop-settings',
                expectedContent: 'Settings'
            },
            {
                text: 'Categories',
                href: '/admin/categories',
                expectedContent: 'Categories'
            }
        ];

        for (const navItem of navigationTests) {
            // Click the navigation item
            console.log(`Testing navigation to ${navItem.text}`);
            
            await page.goto(`${BASE_URL}/products`); // Reset to known state
            const testId = `sidebar-nav-item-${navItem.text.toLowerCase().replace(/\s+/g, '-')}`;
            const link = page.locator(`[data-testid="${testId}"]`);
            await link.click();

            // Verify URL changed correctly
            await expect(page).toHaveURL(new RegExp(navItem.href + '$'));

            // Verify expected content is visible
            await expect(
                page.locator(`text=${navItem.expectedContent}`, { exact: false })
            ).toBeVisible();
        }
    });

    // Test profile dropdown functionality
    test('profile dropdown functions correctly', async ({ page }) => {
        // Find and click the profile dropdown trigger
        const dropdownTrigger = page.locator('[data-testid="profile-dropdown-trigger"]');
        await expect(dropdownTrigger).toBeVisible();
        await dropdownTrigger.click();

        // Verify logout option is present
        const logoutButton = page.locator('[data-testid="logout-button"]');
        await expect(logoutButton).toBeVisible();

        // Click logout (this will trigger navigation)
        await logoutButton.click();

        // Verify we're redirected to login page
        await expect(page).toHaveURL(/.*\/login$/);
    });

    // Test responsive behavior
    test('sidebar responds to viewport changes', async ({ page }) => {
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(sidebar).toBeVisible();
        await expect(page.locator('[data-testid="sidebar-nav-container"]')).toBeVisible();

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(sidebar).toBeVisible();
        await expect(page.locator('[data-testid="sidebar-nav-container"]')).toBeVisible();

        // Test desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });
        await expect(sidebar).toBeVisible();
        await expect(page.locator('[data-testid="sidebar-nav-container"]')).toBeVisible();
    });
});

test.describe('Admin Sidebar', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/shop-settings`);
        // Wait for sidebar to be visible
        await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
    });

    test('displays all navigation items correctly', async ({ page }) => {
        // Define all expected navigation items
        const navItems = [
            { text: 'New Product', href: '/products/create' },
            { text: 'Product List', href: '/products' },
            { text: 'Images', href: '/images' },
            { text: 'Navigation Maker', href: '/navigation' },
            { text: 'Orders', href: '/orders' },
            { text: 'Brands', href: '/brands' },
            { text: 'Store', href: '/productsearch' },
            { text: 'Driver Location', href: '/driver/coordinates' },
            { text: 'Settings', href: '/shop-settings' },
            { text: 'Users', href: '/users' },
            { text: 'Categories', href: '/admin/categories' }
        ];

        // Check each navigation item is visible and has correct link
        for (const item of navItems) {
            const selector = `[data-testid="sidebar-nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}"]`;
            const navItem = page.locator(selector);
            
            await expect(navItem).toBeVisible();
            await expect(navItem).toHaveAttribute('href', item.href);
            await expect(navItem).toContainText(item.text);
        }
    });

    test('minimize button toggles sidebar state', async ({ page }) => {
        // Get initial state
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        const minimizeButton = page.locator('[data-testid="sidebar-minimize-button"]');
        
        // Click minimize button
        await minimizeButton.click();
        await expect(sidebar).toHaveClass(/minimized/);
        
        // Verify text content is hidden in minimized state
        for (const itemText of ['New Product', 'Product List', 'Images']) {
            await expect(page.getByText(itemText, { exact: true })).toBeHidden();
        }
        
        // Click again to maximize
        await minimizeButton.click();
        await expect(sidebar).not.toHaveClass(/minimized/);
        
        // Verify text content is visible again
        for (const itemText of ['New Product', 'Product List', 'Images']) {
            await expect(page.getByText(itemText, { exact: true })).toBeVisible();
        }
    });

    test('navigation items redirect to correct pages', async ({ page }) => {
        // Test a few key navigation items
        const testItems = [
            { 
                text: 'Product List', 
                href: '/products',
                expectedContent: 'Products'
            },
            { 
                text: 'Images', 
                href: '/images',
                expectedContent: 'Images'
            },
            { 
                text: 'Orders', 
                href: '/orders',
                expectedContent: 'Orders'
            }
        ];

        for (const item of testItems) {
            // Click the navigation item
            const selector = `[data-testid="sidebar-nav-item-${item.text.toLowerCase().replace(/\s+/g, '-')}"]`;
            await page.click(selector);
            
            // Wait for navigation
            await expect(page).toHaveURL(new RegExp(item.href + '$'));
            
            // Verify expected content is visible on the page
            await expect(page.getByText(item.expectedContent, { exact: false })).toBeVisible();
            
            // Go back to products page for next test
            await page.goto(`${BASE_URL}/productsearch`);
        }
    });

    test('profile dropdown functions correctly', async ({ page }) => {
        // Open profile dropdown
        await page.locator('[data-testid="profile-dropdown-trigger"]').click();
        
        // Verify logout button is visible
        const logoutButton = page.locator('[data-testid="logout-button"]');
        await expect(logoutButton).toBeVisible();
        
        // Click logout button
        await logoutButton.click();
        
        // Verify redirect to login page
        await expect(page).toHaveURL(/.*\/login$/);
    });

    test('sidebar remains visible at different viewport sizes', async ({ page }) => {
        const sidebar = page.locator('[data-testid="admin-sidebar"]');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(sidebar).toBeVisible();
        
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(sidebar).toBeVisible();
        
        // Test desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });
        await expect(sidebar).toBeVisible();
    });
});
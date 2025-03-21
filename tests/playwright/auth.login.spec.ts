import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/adminlogin');
    });

    test('should show admin login page', async ({ page }) => {
        await expect(page.locator('text=Admin Login')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
    });

    test('should login with correct admin credentials', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Log in' }).click();
        
        // Should redirect to admin dashboard after login
        await expect(page).toHaveURL('/shop-settings');
    });

    test('should show error with incorrect credentials', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Email' }).fill('wrong@example.com');
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Log in' }).click();
        
        await expect(page.getByText('These credentials do not match our records.')).toBeVisible();
    });

    test('should require email', async ({ page }) => {
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Log in' }).click();
        
        await expect(page.getByText('The email field is required.')).toBeVisible();
    });

    test('should require password', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
        await page.getByRole('button', { name: 'Log in' }).click();
        
        await expect(page.getByText('The password field is required.')).toBeVisible();
    });
});
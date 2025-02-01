import { test, expect } from '@playwright/test';

test.describe('Cart functionality', () => {
    test('should show empty cart message', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.getByText('Your cart is empty')).toBeVisible();
        await expect(page.getByText('Continue Shopping')).toBeVisible();
    });
}); 
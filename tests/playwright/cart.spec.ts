import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

test.describe("Cart", () => {
    // Use stored auth state for all tests in this file
    test.use({ storageState: 'playwright/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
        try {
            console.log(`Navigating to ${BASE_URL}/productsearch`);
            await page.goto(`${BASE_URL}/productsearch`, {
                waitUntil: 'networkidle',
                timeout: 30000
            });
        } catch (error) {
            console.error('Navigation failed:', error);
            throw error;
        }
    });

    test('Add product to Cart From ProductSearch', async ({ page }) => {
        // Wait for the page to be ready
        await expect(page).toHaveURL(`${BASE_URL}/productsearch`);
        
        try {
            // Wait for products grid container
            await expect(
                page.locator('[data-testid="products-grid-container"]')
            ).toBeVisible({ timeout: 10000 });

            // Wait for either products to load or empty state
            await Promise.race([
                page.waitForSelector('[data-testid="product-skeleton"]'),
                page.waitForSelector('[data-testid="product-card"]'),
                page.waitForSelector('[data-testid="no-products-message"]')
            ]);

            // Give a moment for loading to complete if skeletons are showing
            if (await page.locator('[data-testid="product-skeleton"]').count() > 0) {
                await page.waitForTimeout(2000);
            }

            // Check if we have actual products
            const productCount = await page.locator('[data-testid="product-card"]').count();
            console.log(`Found ${productCount} product cards`);
            
            if (productCount === 0) {
                // Check for empty state message
                if (await page.locator('[data-testid="no-products-message"]').isVisible()) {
                    test.skip('No products available to test add to cart functionality');
                    return;
                }
                throw new Error('No products found and no empty state message visible');
            }

            // Find first enabled Add to Cart button
            const addToCartButtons = page.locator('[data-testid="add-to-cart-button"]:not([disabled])');
            const buttonCount = await addToCartButtons.count();
            
            if (buttonCount === 0) {
                test.skip('No enabled add to cart buttons found');
                return;
            }

            // Click the first enabled button
            await addToCartButtons.first().click();
            console.log('Clicked add to cart button');

            // Wait for cart button to be visible
            await expect(page.locator('[data-testid="cart-btn"]')).toBeVisible();

            // Navigate to cart
            await page.locator('[data-testid="cart-btn"]').click();
            await expect(page).toHaveURL(`${BASE_URL}/cart`);

            // Check for empty cart message
            const emptyCartMessage = page.locator('text="Your cart is empty"');
            const hasEmptyCart = await emptyCartMessage.isVisible();
            
            if (hasEmptyCart) {
                throw new Error('Cart is empty after adding product');
            }

            // Verify cart has items
            await expect(
                page.locator('h2:has-text("Shopping Cart")')
            ).toBeVisible({ timeout: 5000 });

        } catch (error) {
            console.error('Test error:', error);
            await page.screenshot({ 
                path: 'cart-test-failure.png',
                fullPage: true 
            });
            throw error;
        }
    });
});





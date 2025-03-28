import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

test.describe("Cart Functionality", () => {
    test.beforeEach(async ({ page }) => {
        // Go to product search page where we can add items
        await page.goto(`${BASE_URL}/productsearch`);
    });

    test('Can add item to cart', async ({ page }) => {
        await test.step('Add product to cart', async () => {
            // Wait for product grid
            await expect(page.locator('[data-testid="products-grid"]')).toBeVisible();

            // Find first available product
            const addToCartButton = page.locator('[data-testid="add-to-cart-button"]:not([disabled])').first();
            await addToCartButton.click();

            // Verify success notification
            await expect(page.getByRole('alert')).toContainText('Added to cart');
        });

        await test.step('View cart', async () => {
            // Go to cart page
            await page.goto(`${BASE_URL}/cart`);

            // Verify cart is not empty
            await expect(page.locator('h2')).toContainText('Shopping Cart');
            await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
        });
    });

    test('Can update cart quantities', async ({ page }) => {
        // First add an item
        const addToCartButton = page.locator('[data-testid="add-to-cart-button"]:not([disabled])').first();
        await addToCartButton.click();

        // Go to cart
        await page.goto(`${BASE_URL}/cart`);

        // Get initial quantity
        const quantityText = await page.locator('[data-testid="item-quantity"]').textContent();
        const initialQuantity = parseInt(quantityText || '0', 10);

        // Click increment button
        await page.locator('[aria-label="Increment quantity"]').click();

        // Verify quantity increased
        await expect(page.locator('[data-testid="item-quantity"]'))
            .toHaveText((initialQuantity + 1).toString());

        // Click decrement button
        await page.locator('[aria-label="Decrement quantity"]').click();

        // Verify quantity decreased
        await expect(page.locator('[data-testid="item-quantity"]'))
            .toHaveText(initialQuantity.toString());
    });

    test('Cart persists after login', async ({ page }) => {
        // Add item as guest
        const addToCartButton = page.locator('[data-testid="add-to-cart-button"]:not([disabled])').first();
        await addToCartButton.click();

        // Login
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');

        // Check cart still has items
        await page.goto(`${BASE_URL}/cart`);
        await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
    });

    test('Can proceed to checkout', async ({ page }) => {
        // First add an item
        const addToCartButton = page.locator('[data-testid="add-to-cart-button"]:not([disabled])').first();
        await addToCartButton.click();

        // Go to cart
        await page.goto(`${BASE_URL}/cart`);

        // Click checkout button
        await page.click('text=Checkout');

        // Should be on checkout page
        await expect(page).toHaveURL(/.*\/checkout/);

        // Fill checkout form
        await page.fill('[name="name"]', 'Test User');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="street"]', '123 Test St');
        await page.fill('[name="city"]', 'Test City');
        await page.fill('[name="postcode"]', '12345');
        await page.fill('[name="country"]', 'Test Country');

        // Submit order
        await page.click('text=Place Order');

        // Verify success
        await expect(page.getByRole('alert')).toContainText('Order placed successfully');
    });

    test('Shows empty cart message', async ({ page }) => {
        await page.goto(`${BASE_URL}/cart`);
        await expect(page.getByText('Your cart is empty')).toBeVisible();
    });

    test('Out of stock items cannot be added', async ({ page }) => {
        // Try to add an out of stock item
        const outOfStockButton = page.locator('[data-testid="add-to-cart-button"][disabled]').first();
        
        // Verify button is disabled
        await expect(outOfStockButton).toBeDisabled();
    });
});





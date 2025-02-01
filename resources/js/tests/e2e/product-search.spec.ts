import { test, expect } from '@playwright/test';

test.describe('Product Search functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Create test data
        await page.goto('/api/test/seed-products');
    });

    test('should show loading state while fetching products', async ({ page }) => {
        // Navigate to trigger loading state
        await page.goto('/productsearch');

        // Verify loading skeletons are shown
        const skeletons = await page.getByTestId('product-skeleton').all();
        expect(skeletons.length).toBeGreaterThan(0);
    });

    test('should display products', async ({ page }) => {
        await page.goto('/productsearch');

        // Enable console logging
        page.on('console', msg => console.log('Browser console:', msg.text()));

        // Wait for products to load with a longer timeout
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Verify multiple products are displayed
        const products = await page.getByTestId('product-card').all();
        expect(products.length).toBeGreaterThan(0);

        // Verify product details are displayed
        const firstProduct = products[0];
        await expect(firstProduct.getByRole('heading')).toBeVisible();
        await expect(firstProduct.locator('.aspect-square img')).toBeVisible();
        await expect(firstProduct.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    });

    test('should show empty state when no products match filters', async ({ page }) => {
        await page.goto('/productsearch');

        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Set a price filter that no products will match
        await page.fill('input[name="minPrice"]', '1000000');

        // Wait for the filter to be applied
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/products/search')),
            page.waitForSelector('.nprogress-busy'),
            page.click('button[type="submit"]')
        ]);

        // Wait for loading state to finish
        await page.waitForSelector('.nprogress-busy', { state: 'detached', timeout: 10000 });

        // Wait for empty state to appear
        await expect(page.locator('h3', { hasText: 'No products found' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('p', { hasText: 'Try adjusting your search or filter criteria' })).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to product details when clicking a product', async ({ page }) => {
        await page.goto('/productsearch');

        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Click the first product
        const firstProduct = await page.getByTestId('product-card').first();
        const productName = await firstProduct.getByRole('heading').textContent();

        // Click and wait for navigation
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/product/')),
            page.waitForSelector('.nprogress-busy'),
            firstProduct.click()
        ]);

        // Wait for navigation to complete
        await page.waitForSelector('.nprogress-busy', { state: 'detached', timeout: 10000 });

        // Wait for the heading to be visible
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(productName || '', { timeout: 10000 });
        await expect(page).toHaveURL(/\/product\/\d+/);
    });

    test('should filter products by price range', async ({ page }) => {
        await page.goto('/productsearch');

        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Set price range filter
        await page.fill('input[name="minPrice"]', '20');
        await page.fill('input[name="maxPrice"]', '30');

        // Wait for the filter to be applied
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/products/search')),
            page.waitForSelector('.nprogress-busy'),
            page.click('button[type="submit"]')
        ]);

        // Wait for loading state to finish
        await page.waitForSelector('.nprogress-busy', { state: 'detached', timeout: 10000 });

        // Wait for filtered products
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Verify all displayed products are within price range
        const products = await page.getByTestId('product-card').all();
        for (const product of products) {
            const priceText = await product.locator('.text-lg.font-bold').textContent();
            const price = parseFloat(priceText?.replace('$', '') || '0');
            expect(price).toBeGreaterThanOrEqual(20);
            expect(price).toBeLessThanOrEqual(30);
        }
    });

    test('should sort products by price', async ({ page }) => {
        await page.goto('/productsearch');

        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

        // Select price ascending sort
        await page.click('button[aria-expanded="false"]');
        await page.click('div[data-radix-select-item][data-value="price_asc"]');

        // Wait for sorted products
        await Promise.all([
            page.waitForResponse(response => response.url().includes('/api/products/search')),
            page.waitForSelector('.nprogress-busy')
        ]);

        // Wait for loading state to finish
        await page.waitForSelector('.nprogress-busy', { state: 'detached', timeout: 10000 });

        // Get all product prices
        const products = await page.getByTestId('product-card').all();
        const prices = await Promise.all(
            products.map(async product => {
                const priceText = await product.locator('.text-lg.font-bold').textContent();
                return parseFloat(priceText?.replace('$', '') || '0');
            })
        );

        // Verify prices are in ascending order
        for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
    });
}); 
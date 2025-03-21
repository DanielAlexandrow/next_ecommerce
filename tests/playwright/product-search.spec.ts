import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

test.describe('Product Search functionality', () => {
  test('Can access product search page and verify basic structure', async ({ page }) => {
    // Go directly to product search page
    await page.goto(`${BASE_URL}/productsearch`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Check if the product search page has loaded
    await expect(page.locator('[data-testid="product-search-page"]')).toBeVisible();
    
    // Check for the presence of the filters section
    await expect(page.locator('[data-testid="filters-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-filters"]')).toBeVisible();
    
    // Wait for either products, skeletons, or empty state
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]'),
      page.waitForSelector('[data-testid="product-skeleton"]'),
      page.waitForSelector('[data-testid="no-products-message"]')
    ]);

    // If we see skeletons, wait a bit for them to potentially resolve
    if (await page.locator('[data-testid="product-skeleton"]').isVisible()) {
      await page.waitForTimeout(2000);
    }
    
    // Verify we have either products, loading state, or empty state message
    const productCardCount = await page.locator('[data-testid="product-card"]').count();
    const skeletonCount = await page.locator('[data-testid="product-skeleton"]').count();
    const hasEmptyMessage = await page.locator('[data-testid="no-products-message"]').isVisible();
    
    expect(productCardCount > 0 || skeletonCount > 0 || hasEmptyMessage).toBeTruthy(
      'Expected to find either product cards, loading skeletons, or empty state message'
    );
    
    // Take a screenshot for reference
    await page.screenshot({ 
      path: 'product-search-page.png',
      fullPage: true
    });
  });

  test('Product filter components function correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/productsearch`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Verify price filter section is present
    const priceFilterSection = page.locator('[data-testid="price-filter-section"]');
    await expect(priceFilterSection).toBeVisible();
    
    // Check min and max price inputs
    const minPriceInput = page.locator('[data-testid="min-price-input"]');
    const maxPriceInput = page.locator('[data-testid="max-price-input"]');
    await expect(minPriceInput).toBeVisible();
    await expect(maxPriceInput).toBeVisible();
    
    // Verify sort filter section
    const sortFilterSection = page.locator('[data-testid="sort-filter-section"]');
    await expect(sortFilterSection).toBeVisible();
    
    // Interact with sort dropdown
    await page.locator('[data-testid="sort-trigger"]').click();
    
    // Check if sort options are visible
    await expect(page.locator('[data-testid="sort-option-price-asc"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-option-price-desc"]')).toBeVisible();
    
    // Select a sort option
    await page.locator('[data-testid="sort-option-price-desc"]').click();
    
    // Wait for loading state after sort change
    await Promise.race([
      page.waitForSelector('[data-testid="product-skeleton"]'),
      page.waitForSelector('[data-testid="no-products-message"]'),
      page.waitForTimeout(2000)
    ]);
  });

  test('Product cards display correctly and can be clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/productsearch`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for products grid container
    await expect(page.locator('[data-testid="products-grid-container"]')).toBeVisible();

    // Wait for initial load to complete
    await Promise.race([
      page.waitForSelector('[data-testid="product-card"]'),
      page.waitForSelector('[data-testid="no-products-message"]'),
      page.waitForTimeout(5000)
    ]);

    // If we have products, test their functionality
    const hasProducts = await page.locator('[data-testid="product-card"]').count() > 0;
    
    if (hasProducts) {
      // Verify first product card structure
      const firstCard = page.locator('[data-testid="product-card"]').first();
      
      // Check product card elements
      await expect(firstCard.locator('[data-testid="product-image"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="product-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="product-price"]')).toBeVisible();
      
      // Store the product name and id before clicking
      const productName = await firstCard.locator('[data-testid="product-name"]').textContent();
      const productId = await firstCard.getAttribute('data-product-id');
      
      console.log(`Clicking on product card for: ${productName} (ID: ${productId})`);
      
      // Click the product card (should navigate to product detail)
      await firstCard.click();
      
      // Verify navigation
      await expect(page).not.toHaveURL(/.*\/productsearch/);
      if (productId) {
        await expect(page).toHaveURL(new RegExp(`/product/${productId}`));
      }
    } else {
      // Verify empty state is shown
      await expect(page.locator('[data-testid="no-products-message"]')).toBeVisible();
      test.skip('No products available to test card functionality');
    }
  });

  test('Add to cart functionality works', async ({ page }) => {
    await page.goto(`${BASE_URL}/productsearch`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for product grid to load
    await page.waitForSelector('[data-testid="products-grid-container"]');
    
    // Check if there are any products
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = await productCards.count();
    
    if (productCount > 0) {
      // Find first product with an enabled add to cart button
      for (let i = 0; i < productCount; i++) {
        const card = productCards.nth(i);
        const addToCartButton = card.locator('[data-testid="add-to-cart-button"]');
        
        // Check if button exists and is enabled
        if (await addToCartButton.count() > 0 && !(await addToCartButton.isDisabled())) {
          // Click the add to cart button
          await addToCartButton.click();
          
          // Wait for toast notification or other confirmation
          // This could be a data-testid for success toast in the future
          await page.waitForTimeout(1000);
          
          // Check if cart button in navbar is visible/updated
          await expect(page.locator('[data-testid="cart-btn"]')).toBeVisible();
          
          break;
        }
      }
    } else {
      test.skip('No products found for add to cart test');
    }
  });
  
  test('Empty search results display correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/productsearch`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for page to be ready
    await expect(page.locator('[data-testid="product-filters"]')).toBeVisible();
    
    // Set an impossibly high minimum price to force empty results
    const minPriceInput = page.locator('[data-testid="min-price-input"]');
    await minPriceInput.fill('999999');
    
    // Wait for loading state after filter change
    await Promise.race([
      page.waitForSelector('[data-testid="product-skeleton"]'),
      page.waitForSelector('[data-testid="no-products-message"]')
    ]);

    // If we see skeletons, wait for them to resolve
    if (await page.locator('[data-testid="product-skeleton"]').isVisible()) {
      await page.waitForTimeout(2000);
    }
    
    // Verify empty state message is shown
    await expect(page.locator('[data-testid="no-products-message"]')).toBeVisible();
  });
});

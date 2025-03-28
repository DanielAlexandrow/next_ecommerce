import { test, expect } from '@playwright/test';

test.describe('Cart API Tests', () => {
    test.beforeAll(async () => {
        console.log('🛒 Starting Cart API test suite');
        console.log('💫 Environment:', process.env.NODE_ENV);
    });

    test.afterAll(async () => {
        console.log('🏁 Completed Cart API test suite');
    });

    test.beforeEach(async ({ request }) => {
        console.log('\n📝 Starting new cart test case');
        console.log('🧹 Clearing test cart');
        await request.post('/api/cart/clear');
    });

    test('should add items to cart', async ({ request }) => {
        console.log('🎯 Testing POST /api/cart/add endpoint');
        const item = {
            subproduct_id: 1,
            quantity: 2
        };
        console.log('📦 Adding item to cart:', item);

        const response = await request.post('/api/cart/add', {
            data: item
        });
        console.log('📊 Response status:', response.status());
        
        const data = await response.json();
        console.log('🛍️ Cart contents:', data);
        
        expect(response.ok()).toBeTruthy();
        console.log('✅ Item successfully added to cart');
    });

    test('should validate cart quantities', async ({ request }) => {
        console.log('🎯 Testing cart quantity validation');
        const invalidItem = {
            subproduct_id: 1,
            quantity: -1
        };
        console.log('⚠️ Testing with invalid quantity:', invalidItem);

        const response = await request.post('/api/cart/add', {
            data: invalidItem
        });
        console.log('📊 Response status:', response.status());
        console.log('❌ Error response:', await response.text());
        
        expect(response.status()).toBe(422);
        console.log('✅ Validation working as expected');
    });

    // ...existing code...
});
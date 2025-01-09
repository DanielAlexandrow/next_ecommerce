import { test, expect } from '@playwright/test';
import { ApiLogger } from '../helpers/apiLogger';

test.describe('Product Data Verification', () => {
    const baseUrl = 'http://localhost:8000/api';

    test.beforeAll(async () => {
        ApiLogger.clearLogs();
    });

    test('verify seeded products exist', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products/search`);
        const body = await response.json();

        await ApiLogger.logApiCall(
            '/products/search',
            'GET',
            { params: {} },
            body,
            response.status()
        );

        expect(response.status()).toBe(200);
        expect(body.products.length).toBeGreaterThanOrEqual(5);

        // Verify test products exist
        const testProducts = body.products.filter(p => p.name.startsWith('Test Product'));
        expect(testProducts.length).toBeGreaterThanOrEqual(5);

        // Verify product structure
        const firstProduct = testProducts[0];
        expect(firstProduct).toHaveProperty('id');
        expect(firstProduct).toHaveProperty('name');
        expect(firstProduct).toHaveProperty('price');
        expect(firstProduct).toHaveProperty('brand_id');
        expect(firstProduct.name).toMatch(/Test Product \d/);
    });

    test('verify product details with brand and category', async ({ request }) => {
        // Get first product ID
        const searchResponse = await request.get(`${baseUrl}/products/search`);
        const searchBody = await searchResponse.json();
        const productId = searchBody.products[0].id;

        // Get product details
        const response = await request.get(`${baseUrl}/products/${productId}`);
        const body = await response.json();

        await ApiLogger.logApiCall(
            `/products/${productId}`,
            'GET',
            {},
            body,
            response.status()
        );

        expect(response.status()).toBe(200);
        expect(body.product).toHaveProperty('brand');
        expect(body.product.brand.name).toBe('Test Brand');
        expect(body.product.categories).toContainEqual(
            expect.objectContaining({
                name: 'Test Category'
            })
        );
    });

    test('verify orders for test products', async ({ request }) => {
        // Login first
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'test@example.com',
                password: 'password123'
            }
        });
        const { token } = await loginResponse.json();

        // Get orders
        const response = await request.get(`${baseUrl}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const body = await response.json();

        await ApiLogger.logApiCall(
            '/orders',
            'GET',
            { headers: { Authorization: 'Bearer [TOKEN]' } },
            body,
            response.status()
        );

        expect(response.status()).toBe(200);
        expect(body.orders.length).toBeGreaterThanOrEqual(5);

        // Verify order structure
        const firstOrder = body.orders[0];
        expect(firstOrder).toHaveProperty('id');
        expect(firstOrder).toHaveProperty('user_id');
        expect(firstOrder).toHaveProperty('total');
        expect(firstOrder).toHaveProperty('status');
        expect(firstOrder.status).toBe('completed');
    });
}); 
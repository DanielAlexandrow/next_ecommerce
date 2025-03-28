import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
    test.beforeAll(async () => {
        console.log('🚀 Starting API test suite');
        console.log('💫 Environment:', process.env.NODE_ENV);
    });

    test.afterAll(async () => {
        console.log('🏁 Completed API test suite');
    });

    test.beforeEach(async ({ request }) => {
        console.log('\n📝 Starting new API test case');
        console.log('🔄 Setting up test environment');
    });

    test.afterEach(async () => {
        console.log('✅ Test case completed');
    });

    test('should fetch products successfully', async ({ request }) => {
        console.log('🎯 Testing GET /api/products endpoint');
        const response = await request.get('/api/products');
        console.log('📊 Response status:', response.status());
        console.log('📦 Response headers:', response.headers());
        
        const data = await response.json();
        console.log('🔍 Retrieved products count:', data.data.length);
        
        expect(response.ok()).toBeTruthy();
        expect(data.data).toBeDefined();
    });

    test('getUserOrders returns correct order structure', async ({ request }) => {
        const response = await request.get('/api/user/orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.ok()).toBeTruthy();
        const orders = await response.json();
        expect(Array.isArray(orders)).toBeTruthy();

        if (orders.length > 0) {
            const order = orders[0];
            expect(order).toHaveProperty('id');
            expect(order).toHaveProperty('items');
            expect(Array.isArray(order.items)).toBeTruthy();
            expect(typeof order.total).toBe('number');
            expect(order).toHaveProperty('status');
            expect(order).toHaveProperty('payment_status');
            expect(order).toHaveProperty('shipping_status');
        }
    });

    test('unauthorized access to orders is blocked', async ({ request }) => {
        const response = await request.get('/api/user/orders');
        expect(response.status()).toBe(401);
    });

    test('admin can update order status', async ({ request }) => {
        // First create a test order
        const createOrderResponse = await request.post('/api/orders', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                items: [{ id: 1, quantity: 1 }],
                shipping_address: {
                    street: '123 Test St',
                    city: 'Test City',
                    country: 'Test Country'
                }
            }
        });
        expect(createOrderResponse.ok()).toBeTruthy();
        const order = await createOrderResponse.json();

        // Now update the order status
        const updateResponse = await request.put(`/api/admin/orders/${order.id}/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                status: 'processing',
                payment_status: 'paid',
                shipping_status: 'shipped'
            }
        });
        expect(updateResponse.ok()).toBeTruthy();
        const updatedOrder = await updateResponse.json();
        expect(updatedOrder.order.status).toBe('processing');
        expect(updatedOrder.order.payment_status).toBe('paid');
        expect(updatedOrder.order.shipping_status).toBe('shipped');
    });

    test('cart operations work correctly', async ({ request }) => {
        // Add item to cart
        const addToCartResponse = await request.post('/api/cart/add', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                product_id: 1,
                quantity: 2
            }
        });
        expect(addToCartResponse.ok()).toBeTruthy();

        // Get cart contents
        const getCartResponse = await request.get('/api/cart', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(getCartResponse.ok()).toBeTruthy();
        const cart = await getCartResponse.json();
        expect(Array.isArray(cart.items)).toBeTruthy();

        // Clear cart
        const clearCartResponse = await request.post('/api/cart/clear', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(clearCartResponse.ok()).toBeTruthy();
    });
});
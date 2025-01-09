import { test, expect } from '@playwright/test';

test.describe('Admin API Tests', () => {
    const baseUrl = 'http://localhost:8000/api';
    let authToken: string;

    test.beforeAll(async ({ request }) => {
        // Login as admin
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'admin@example.com',
                password: 'password'
            }
        });
        const body = await loginResponse.json();
        authToken = body.token;
    });

    // Product Management Tests
    test('admin can create product', async ({ request }) => {
        const response = await request.post(`${baseUrl}/admin/products`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                stock: 10,
                available: true
            }
        });
        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
    });

    test('admin can update product', async ({ request }) => {
        const productId = 1;
        const response = await request.put(`${baseUrl}/admin/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                name: 'Updated Product',
                price: 149.99
            }
        });
        expect(response.status()).toBe(200);
    });

    test('admin can delete product', async ({ request }) => {
        const productId = 1;
        const response = await request.delete(`${baseUrl}/admin/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
    });

    // Category Management Tests
    test('admin can create category', async ({ request }) => {
        const response = await request.post(`${baseUrl}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                name: 'Test Category',
                description: 'Test Category Description'
            }
        });
        expect(response.status()).toBe(201);
    });

    test('admin can update category', async ({ request }) => {
        const categoryId = 1;
        const response = await request.put(`${baseUrl}/admin/categories/${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                name: 'Updated Category'
            }
        });
        expect(response.status()).toBe(200);
    });

    test('admin can delete category', async ({ request }) => {
        const categoryId = 1;
        const response = await request.delete(`${baseUrl}/admin/categories/${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
    });

    // Order Management Tests
    test('admin can view all orders', async ({ request }) => {
        const response = await request.get(`${baseUrl}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    test('admin can update order status', async ({ request }) => {
        const orderId = 1;
        const response = await request.put(`${baseUrl}/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                status: 'processing'
            }
        });
        expect(response.status()).toBe(200);
    });

    // User Management Tests
    test('admin can view all users', async ({ request }) => {
        const response = await request.get(`${baseUrl}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    test('admin can update user role', async ({ request }) => {
        const userId = 2;
        const response = await request.put(`${baseUrl}/admin/users/${userId}/role`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                role: 'moderator'
            }
        });
        expect(response.status()).toBe(200);
    });
}); 
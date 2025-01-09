import { test, expect } from '@playwright/test';
import { ApiLogger } from '../helpers/apiLogger';

test.describe('Admin Panel API Tests', () => {
    const baseUrl = 'http://localhost:8000/api';
    let adminToken: string;

    test.beforeAll(async ({ request }) => {
        ApiLogger.clearLogs();

        // Login as admin
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'admin@example.com',
                password: 'password123'
            }
        });
        const body = await loginResponse.json();
        adminToken = body.token;
    });

    // Product Management Tests
    test('admin can create new product', async ({ request }) => {
        const productData = {
            name: 'Admin Created Product',
            description: 'Product created via admin API',
            price: 29.99,
            brand_id: 1,
            stock: 50,
            available: true,
            categories: [1]
        };

        const response = await request.post(`${baseUrl}/products`, {
            data: productData,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        await ApiLogger.logApiCall(
            '/products',
            'POST',
            { data: productData },
            await response.json(),
            response.status()
        );

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.product).toHaveProperty('id');
        expect(body.product.name).toBe(productData.name);
    });

    test('admin can update product', async ({ request }) => {
        const productId = 1;
        const updateData = {
            name: 'Updated Product Name',
            price: 39.99
        };

        const response = await request.put(`${baseUrl}/products/${productId}`, {
            data: updateData,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        await ApiLogger.logApiCall(
            `/products/${productId}`,
            'PUT',
            { data: updateData },
            await response.json(),
            response.status()
        );

        expect(response.status()).toBe(200);
    });

    // Order Management Tests
    test('admin can view all orders', async ({ request }) => {
        const response = await request.get(`${baseUrl}/orders`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        await ApiLogger.logApiCall(
            '/orders',
            'GET',
            {},
            await response.json(),
            response.status()
        );

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.orders)).toBeTruthy();
    });

    test('admin can update order status', async ({ request }) => {
        const orderId = 1;
        const updateData = {
            status: 'shipped'
        };

        const response = await request.put(`${baseUrl}/orders/${orderId}`, {
            data: updateData,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        await ApiLogger.logApiCall(
            `/orders/${orderId}`,
            'PUT',
            { data: updateData },
            await response.json(),
            response.status()
        );

        expect(response.status()).toBe(200);
    });

    // Category Management Tests
    test('admin can manage categories', async ({ request }) => {
        // Create category
        const createResponse = await request.post(`${baseUrl}/categories`, {
            data: {
                name: 'New Category',
                description: 'Test category description'
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(createResponse.status()).toBe(201);
        const newCategory = await createResponse.json();

        // Update category
        const updateResponse = await request.put(`${baseUrl}/categories/${newCategory.id}`, {
            data: {
                name: 'Updated Category Name'
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(updateResponse.status()).toBe(200);

        // Delete category
        const deleteResponse = await request.delete(`${baseUrl}/categories/${newCategory.id}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(deleteResponse.status()).toBe(200);
    });

    // Brand Management Tests
    test('admin can manage brands', async ({ request }) => {
        // Create brand
        const createResponse = await request.post(`${baseUrl}/brands`, {
            data: {
                name: 'New Brand',
                description: 'Test brand description'
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(createResponse.status()).toBe(201);
        const newBrand = await createResponse.json();

        // Update brand
        const updateResponse = await request.put(`${baseUrl}/brands/${newBrand.id}`, {
            data: {
                name: 'Updated Brand Name'
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(updateResponse.status()).toBe(200);
    });

    // User Management Tests
    test('admin can view and manage users', async ({ request }) => {
        // Get users list
        const listResponse = await request.get(`${baseUrl}/users`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(listResponse.status()).toBe(200);
        const users = await listResponse.json();
        expect(Array.isArray(users)).toBeTruthy();

        // Update user role
        if (users.length > 0) {
            const updateResponse = await request.put(`${baseUrl}/users/${users[0].id}/role`, {
                data: {
                    role: 'customer'
                },
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            expect(updateResponse.status()).toBe(200);
        }
    });

    // Error Handling Tests
    test('admin operations with invalid data return appropriate errors', async ({ request }) => {
        // Try to create product with invalid data
        const invalidProductResponse = await request.post(`${baseUrl}/products`, {
            data: {
                name: '', // Invalid: empty name
                price: -10 // Invalid: negative price
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(invalidProductResponse.status()).toBe(422);
        const errors = await invalidProductResponse.json();
        expect(errors).toHaveProperty('errors');

        // Try to update non-existent product
        const nonExistentResponse = await request.put(`${baseUrl}/products/99999`, {
            data: { name: 'Test' },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(nonExistentResponse.status()).toBe(404);
    });

    // Bulk Operations Tests
    test('admin can perform bulk operations', async ({ request }) => {
        // Bulk delete products
        const bulkDeleteResponse = await request.post(`${baseUrl}/products/bulk-delete`, {
            data: {
                ids: [1, 2, 3]
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(bulkDeleteResponse.status()).toBe(200);

        // Bulk update product status
        const bulkUpdateResponse = await request.post(`${baseUrl}/products/bulk-update`, {
            data: {
                ids: [4, 5],
                available: false
            },
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        expect(bulkUpdateResponse.status()).toBe(200);
    });
}); 
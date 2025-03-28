import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import type { CartItem } from '../../../resources/js/types/index.d';
import axios, { AxiosError } from 'axios';

// Base URL for API requests - make configurable via environment variables
const BASE_URL = process.env.API_URL || 'http://localhost:8000';

// Helper function to check if server is running
const checkServer = async () => {
    try {
        await axios.get(`${BASE_URL}/api/ping`);
        return true;
    } catch (error) {
        console.error('Server check failed:', error.message);
        console.log('Please ensure Laravel server is running:');
        console.log('php artisan serve --host=0.0.0.0 --port=8000');
        return false;
    }
};

// Setup axios interceptor for error handling
beforeAll(async () => {
    // Check if server is running before proceeding 
    const isServerRunning = await checkServer();
    if (!isServerRunning) {
        throw new Error('Laravel server must be running to execute these tests');
    }

    axios.defaults.baseURL = BASE_URL;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.validateStatus = (status) => status < 500;

    axios.interceptors.response.use(
        response => response,
        error => {
            // Return error response for validation/expected errors
            if (error.response) {
                return error.response;
            }
            // Add more detail to network errors
            if (error.code === 'ECONNREFUSED') {
                console.error(`Could not connect to server at ${BASE_URL}`);
                console.error('Please ensure Laravel server is running');
            }
            throw error;
        }
    );
});

// Helper function to make API calls with error handling
const makeRequest = async (config: any) => {
    try {
        return await axios(config);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response;
        }
        throw error;
    }
};

describe('Cart API Tests', () => {
    // Generate a unique session ID for this test run
    const sessionId = `test-session-${Date.now()}`;
    let subproductId = 1; // Default fallback ID

    // Before all tests, setup and find a valid subproduct to use
    beforeAll(async () => {
        console.log(`=== CART API TEST SETUP ===`);
        console.log(`Using API base URL: ${BASE_URL}`);
        console.log(`Using session ID: ${sessionId}`);

        try {
            // First find a valid subproduct we can use for testing
            console.log(`Finding valid products for testing...`);
            const productsResponse = await axios.get(`${BASE_URL}/api/products/search`, {
                params: { limit: 5 },
                headers: { 
                    'Accept': 'application/json',
                    'X-Session-Id': sessionId
                }
            }).catch(handleAxiosError);

            if (productsResponse?.data?.products?.length > 0) {
                console.log(`Products search response status: ${productsResponse.status}`);
                console.log(`Found ${productsResponse.data.products.length} products`);

                // Find a product with available subproducts
                for (const product of productsResponse.data.products) {
                    if (product.subproducts?.length > 0) {
                        subproductId = product.subproducts[0].id;
                        console.log(`Found valid subproduct ID: ${subproductId} from product: "${product.name}"`);
                        break;
                    }
                }
            } else {
                console.warn('No products found, using default subproduct ID');
            }
        } catch (error) {
            console.error('Error in test setup:', error);
            console.log('Using default subproduct ID:', subproductId);
        }
    });

    // Clear cart before each test
    beforeEach(async () => {
        console.log(`\n--- Starting new test ---`);
        try {
            // Get current cart items
            const cartResponse = await axios.get(`${BASE_URL}/getcartitems`, {
                headers: { 
                    'Accept': 'application/json',
                    'X-Session-Id': sessionId
                }
            }).catch(handleAxiosError);

            // If there are items in cart, remove them one by one
            if (cartResponse?.data && Array.isArray(cartResponse.data) && cartResponse.data.length > 0) {
                console.log(`Clearing ${cartResponse.data.length} items from cart...`);
                
                for (const item of cartResponse.data) {
                    await axios.post(`${BASE_URL}/cart/remove`, 
                        { subproduct_id: item.subproduct_id },
                        { 
                            headers: { 
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-Session-Id': sessionId
                            }
                        }
                    ).catch(handleAxiosError);
                }
            }
            
            // Verify cart is empty
            const verifyResponse = await axios.get(`${BASE_URL}/getcartitems`, {
                headers: { 
                    'Accept': 'application/json',
                    'X-Session-Id': sessionId
                }
            }).catch(handleAxiosError);
            
            if (!verifyResponse?.data || !Array.isArray(verifyResponse.data) || verifyResponse.data.length > 0) {
                console.warn(`Warning: Could not clear cart completely`);
            } else {
                console.log(`Cart cleared successfully`);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    });

    describe('GET /getcartitems', () => {
        it('returns empty cart initially', async () => {
            console.log(`Testing GET /getcartitems endpoint...`);
            
            const response = await makeRequest({
                method: 'get',
                url: `${BASE_URL}/getcartitems`,
                headers: { 
                    'Accept': 'application/json',
                    'X-Session-Id': sessionId
                }
            });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBe(0);
        });
    });

    describe('POST /cart/add', () => {
        it('adds an item to cart', async () => {
            const response = await makeRequest({
                method: 'post',
                url: `${BASE_URL}/cart/add`,
                data: { 
                    subproduct_id: subproductId,
                    quantity: 1 
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId
                }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data).toBeDefined();

            // Verify cart contents
            const cartResponse = await makeRequest({
                method: 'get',
                url: `${BASE_URL}/getcartitems`,
                headers: { 
                    'Accept': 'application/json',
                    'X-Session-Id': sessionId
                }
            });

            const addedItem = cartResponse.data.find(item => 
                item.subproduct_id === subproductId);
            expect(addedItem).toBeTruthy();
            expect(addedItem.quantity).toBe(1);
        });
    });

    describe('Error handling', () => {
        it('handles invalid subproduct IDs gracefully', async () => {
            const invalidId = 999999;
            
            const response = await makeRequest({
                method: 'post',
                url: `${BASE_URL}/cart/add`,
                data: { 
                    subproduct_id: invalidId,
                    quantity: 1 
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId
                },
                validateStatus: () => true // Don't throw on error status
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });
    });
});
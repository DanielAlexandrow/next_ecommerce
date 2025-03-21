import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

/**
 * Setup mocks for cart API tests
 */
export function setupCartApiMocks() {
  // Create spy functions
  const addItemSpy = vi.fn().mockResolvedValue({ 
    result: { data: { success: true } },
    data: { success: true }
  });
  const removeItemSpy = vi.fn().mockResolvedValue({ success: true });
  const checkoutSpy = vi.fn().mockResolvedValue({ success: true, orderId: 123 });
  const getItemsSpy = vi.fn().mockResolvedValue([
    {
      id: 1,
      subproduct: {
        id: 1,
        name: 'Test Product',
        price: 19.99,
        product: {
          name: 'Test Product',
          description: 'Test Description',
          images: [{ full_path: '/storage/test-image.jpg' }]
        }
      },
      quantity: 2
    }
  ]);

  // Mock the cart API module
  vi.mock('@/api/cartApi', () => ({
    cartApi: {
      addItem: addItemSpy,
      removeItem: removeItemSpy,
      checkout: checkoutSpy,
      getItems: getItemsSpy
    }
  }));

  // Return the spies for direct access in tests
  return {
    addItemSpy,
    removeItemSpy,
    checkoutSpy,
    getItemsSpy
  };
}

/**
 * Wait for all pending async operations to complete
 * This helps with React concurrent mode issues in tests
 */
export async function waitForAsyncOperations() {
  // Use a small delay to ensure all promises in the event loop are processed
  await new Promise(resolve => setTimeout(resolve, 0));
  // Then use testing library's waitFor to ensure UI has updated
  await waitFor(() => {
    // Empty waitFor to flush promises and let React finish rendering
  });
}

/**
 * Reset cart API mocks between tests
 */
export function resetCartApiMocks() {
  if (vi.isMockFunction(cartApi.addItem)) {
    vi.mocked(cartApi.addItem).mockReset();
    vi.mocked(cartApi.addItem).mockResolvedValue({ 
      data: { success: true },
      result: { data: { success: true } }
    });
  }
  
  if (vi.isMockFunction(cartApi.removeItem)) {
    vi.mocked(cartApi.removeItem).mockReset();
    vi.mocked(cartApi.removeItem).mockResolvedValue({ success: true });
  }
  
  if (vi.isMockFunction(cartApi.checkout)) {
    vi.mocked(cartApi.checkout).mockReset();
    vi.mocked(cartApi.checkout).mockResolvedValue({ success: true, orderId: 123 });
  }
  
  if (vi.isMockFunction(cartApi.getItems)) {
    vi.mocked(cartApi.getItems).mockReset();
    vi.mocked(cartApi.getItems).mockResolvedValue([
      {
        id: 1,
        subproduct: {
          id: 1,
          name: 'Test Product',
          price: 19.99,
          product: {
            name: 'Test Product',
            description: 'Test Description',
            images: [{ full_path: '/storage/test-image.jpg' }]
          }
        },
        quantity: 2
      }
    ]);
  }
}

/**
 * Configure mock to throw an error for specific cart API calls
 */
export function mockCartApiError(method: 'addItem' | 'removeItem' | 'checkout' | 'getItems') {
  if (vi.isMockFunction(cartApi[method])) {
    vi.mocked(cartApi[method]).mockRejectedValueOnce(new Error('API error'));
  }
}
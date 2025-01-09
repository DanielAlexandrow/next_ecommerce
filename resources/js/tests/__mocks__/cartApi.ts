import { vi } from 'vitest';
import { CartItem, StoreProduct, StoreSubproduct } from '@/types';

// Mock product data
const mockProduct: StoreProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    available: true,
    images: [{
        id: 1,
        name: 'test.jpg',
        path: '/storage/images/test.jpg',
        pivot: { image_id: 1 }
    }],
    categories: [{
        id: 1,
        name: 'Test Category',
        pivot: { category_id: 1 }
    }],
    brand: {
        id: 1,
        name: 'Test Brand'
    },
    subproducts: [{
        id: 1,
        name: 'Test Subproduct',
        product_id: 1,
        price: 100,
        available: true
    }],
    reviews: [],
    average_rating: 0
};

// Mock subproduct with product
const mockStoreSubproduct: StoreSubproduct = {
    id: 1,
    name: 'Test Subproduct',
    product_id: 1,
    price: 100,
    available: true,
    product: mockProduct
};

// Mock cart data
const mockCartItems: CartItem[] = [
    {
        id: 1,
        cart_id: 1,
        subproduct_id: 1,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subproduct: mockStoreSubproduct
    }
];

// Mock cart API
export const cartApi = {
    addItem: vi.fn().mockImplementation((subproductId: number) => {
        return Promise.resolve({
            success: true,
            message: 'Item added to cart',
            cart: {
                items: mockCartItems,
                total: mockCartItems.reduce((sum, item) => sum + item.subproduct.price * item.quantity, 0),
            },
        });
    }),

    removeItem: vi.fn().mockImplementation((subproductId: number) => {
        return Promise.resolve({
            success: true,
            message: 'Item removed from cart',
            cart: {
                items: [],
                total: 0,
            },
        });
    }),

    updateQuantity: vi.fn().mockImplementation((subproductId: number, quantity: number) => {
        return Promise.resolve({
            success: true,
            message: 'Quantity updated',
            cart: {
                items: mockCartItems.map(item => ({
                    ...item,
                    quantity: item.subproduct_id === subproductId ? quantity : item.quantity,
                })),
                total: mockCartItems.reduce((sum, item) => {
                    const itemQuantity = item.subproduct_id === subproductId ? quantity : item.quantity;
                    return sum + item.subproduct.price * itemQuantity;
                }, 0),
            },
        });
    }),

    getCart: vi.fn().mockImplementation(() => {
        return Promise.resolve({
            items: mockCartItems,
            total: mockCartItems.reduce((sum, item) => sum + item.subproduct.price * item.quantity, 0),
        });
    }),

    checkout: vi.fn().mockImplementation((cartId: number, customerInfo: any) => {
        return Promise.resolve({
            success: true,
            message: 'Checkout successful',
            order: {
                id: 1,
                total: mockCartItems.reduce((sum, item) => sum + item.subproduct.price * item.quantity, 0),
                items: mockCartItems,
                customer: customerInfo,
            },
        });
    }),

    clear: vi.fn().mockImplementation(() => {
        return Promise.resolve({
            success: true,
            message: 'Cart cleared',
            cart: {
                items: [],
                total: 0,
            },
        });
    }),
};
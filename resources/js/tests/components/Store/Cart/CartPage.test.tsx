import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartPage from '@/pages/store/CartPage';
import { setupCartApiMocks, waitForAsyncOperations, resetCartApiMocks, mockCartApiError } from './cart-test-helpers';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn()
    }
}));

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            auth: { user: null },
            cartitems: [{
                id: 1,
                cart_id: 1,
                subproduct_id: 1,
                quantity: 1,
                subproduct: {
                    id: 1,
                    price: 100,
                    name: 'Variant 1',
                    product: {
                        id: 1,
                        name: 'Test Product',
                        images: [{ path: 'test.jpg', full_path: 'storage/test.jpg' }]
                    }
                }
            }]
        }
    })
}));

describe('CartPage', () => {
    let cartApiSpies;

    beforeEach(() => {
        vi.clearAllMocks();
        resetCartApiMocks();
        cartApiSpies = setupCartApiMocks();
    });

    it('displays cart items and total correctly', async () => {
        render(<CartPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
            expect(screen.getByText('Variant 1')).toBeInTheDocument();
            expect(screen.getByText('$ 100')).toBeInTheDocument();
        });
    });

    it('handles increment quantity', async () => {
        render(<CartPage />);
        
        const incrementButton = screen.getByLabelText('Increment quantity');
        fireEvent.click(incrementButton);
        
        await waitFor(() => {
            expect(cartApiSpies.addItemSpy).toHaveBeenCalledWith(1);
        });
    });

    it('handles decrement quantity', async () => {
        render(<CartPage />);
        
        const decrementButton = screen.getByLabelText('Decrement quantity');
        fireEvent.click(decrementButton);
        
        await waitFor(() => {
            expect(cartApiSpies.removeItemSpy).toHaveBeenCalledWith(1);
        });
    });

    it('shows empty cart message when no items', async () => {
        vi.mock('@inertiajs/react', () => ({
            usePage: () => ({
                props: {
                    auth: { user: null },
                    cartitems: []
                }
            })
        }));

        render(<CartPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
            expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
        });
    });

    it('handles increment error', async () => {
        mockCartApiError('addItem');
        
        render(<CartPage />);
        
        const incrementButton = screen.getByLabelText('Increment quantity');
        fireEvent.click(incrementButton);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to add item to cart.');
        });
    });

    it('handles decrement error', async () => {
        mockCartApiError('removeItem');
        
        render(<CartPage />);
        
        const decrementButton = screen.getByLabelText('Decrement quantity');
        fireEvent.click(decrementButton);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to remove item from cart.');
        });
    });

    it('handles checkout for guest user', async () => {
        // Mock form validation to fail
        vi.mock('react-hook-form', () => ({
            useForm: () => ({
                trigger: vi.fn().mockResolvedValue(false)
            })
        }));
        
        render(<CartPage />);
        
        const checkoutButton = screen.getByText('Checkout');
        fireEvent.click(checkoutButton);
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Missing customer adress information'));
        });
    });

    it('shows correct number of items', async () => {
        render(<CartPage />);
        
        await waitFor(() => {
            expect(screen.getByText('1 items')).toBeInTheDocument();
        });
    });

    it('displays product image correctly', async () => {
        render(<CartPage />);
        
        await waitFor(() => {
            const image = screen.getByRole('img', { name: 'Product Image' });
            expect(image).toHaveAttribute('src', expect.stringContaining('test.jpg'));
        });
    });

    it('handles successful checkout', async () => {
        render(<CartPage />);
        
        const checkoutButton = screen.getByText('Checkout');
        fireEvent.click(checkoutButton);
        
        await waitFor(() => {
            expect(cartApiSpies.checkoutSpy).toHaveBeenCalledWith(1, expect.any(Object));
            expect(toast.success).toHaveBeenCalledWith('Checkout successful!');
        });
    });
});
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartPage from '@/pages/store/CartPage';
import { cartApi } from '@/api/cartApi';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

// Mock modules
vi.mock('@/api/cartApi', () => ({
    cartApi: {
        removeItem: vi.fn().mockResolvedValue([]),
        addItem: vi.fn().mockResolvedValue({ data: [] }),
        checkout: vi.fn().mockResolvedValue({ success: true })
    }
}));

vi.mock('react-hook-form', () => {
    const mockUseForm = vi.fn(() => ({
        trigger: vi.fn().mockResolvedValue(true),
        getValues: vi.fn().mockReturnValue({
            name: 'John Doe',
            email: 'john@example.com',
            postcode: '12345',
            city: 'Test City',
            country: 'Test Country',
            street: 'Test Street'
        }),
        handleSubmit: vi.fn((fn) => (e) => {
            e?.preventDefault();
            return fn({
                name: 'John Doe',
                email: 'john@example.com',
                postcode: '12345',
                city: 'Test City',
                country: 'Test Country',
                street: 'Test Street'
            });
        }),
        control: {
            register: vi.fn(),
            unregister: vi.fn(),
            getFieldState: vi.fn(),
            _formState: {},
            _options: {
                mode: 'onSubmit',
                reValidateMode: 'onChange',
                shouldFocusError: true
            }
        },
        formState: {
            errors: {},
            isSubmitting: false,
            isDirty: false,
            isValid: true,
            dirtyFields: {},
            touchedFields: {},
            isSubmitted: false,
            isSubmitSuccessful: false
        }
    }));

    return {
        useForm: mockUseForm,
        useFormContext: () => ({
            getFieldState: vi.fn(),
            formState: {
                errors: {},
                isSubmitting: false,
                isDirty: false,
                isValid: true,
                dirtyFields: {},
                touchedFields: {},
                isSubmitted: false,
                isSubmitSuccessful: false
            }
        }),
        FormProvider: ({ children }) => <>{children}</>,
        Controller: ({ render }) => render({
            field: {
                onChange: vi.fn(),
                onBlur: vi.fn(),
                value: '',
                name: '',
                ref: vi.fn()
            },
            fieldState: {
                invalid: false,
                isTouched: false,
                isDirty: false,
                error: undefined
            },
            formState: {
                errors: {},
                isSubmitting: false,
                isDirty: false,
                isValid: true,
                dirtyFields: {},
                touchedFields: {},
                isSubmitted: false,
                isSubmitSuccessful: false
            }
        })
    };
});

const mockCartItems = [
    {
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
    }
];

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            auth: { user: null },
            cartitems: mockCartItems
        }
    })
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn()
    }
}));

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mockCartItems to default state
        mockCartItems.length = 1;
        mockCartItems[0] = {
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
        };
    });

    it('displays cart items and total correctly', () => {
        render(<CartPage />);

        // Check if product name is displayed
        expect(screen.getByText('Test Product')).toBeInTheDocument();

        // Check if variant name is displayed
        expect(screen.getByText('Variant 1')).toBeInTheDocument();

        // Check if quantity controls are present
        expect(screen.getByLabelText('Increment quantity')).toBeInTheDocument();
        expect(screen.getByLabelText('Decrement quantity')).toBeInTheDocument();

        // Check if total is displayed correctly
        expect(screen.getByText('$ 100')).toBeInTheDocument();
    });

    it('handles increment quantity', async () => {
        render(<CartPage />);

        const incrementButton = screen.getByLabelText('Increment quantity');
        await act(async () => {
            await fireEvent.click(incrementButton);
        });

        expect(cartApi.addItem).toHaveBeenCalledWith(1);
    });

    it('handles decrement quantity', async () => {
        render(<CartPage />);

        const decrementButton = screen.getByLabelText('Decrement quantity');
        await act(async () => {
            await fireEvent.click(decrementButton);
        });

        expect(cartApi.removeItem).toHaveBeenCalledWith(1);
    });

    it('shows empty cart message when no items', () => {
        // Clear the cart items
        mockCartItems.length = 0;

        render(<CartPage />);

        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
        expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    });

    it('handles increment error', async () => {
        vi.mocked(cartApi.addItem).mockRejectedValueOnce(new Error('Failed to add'));
        render(<CartPage />);

        const incrementButton = screen.getByLabelText('Increment quantity');
        await act(async () => {
            await fireEvent.click(incrementButton);
        });

        expect(toast.error).toHaveBeenCalledWith('Failed to add item to cart.');
    });

    it('handles decrement error', async () => {
        vi.mocked(cartApi.removeItem).mockRejectedValueOnce(new Error('Failed to remove'));
        render(<CartPage />);

        const decrementButton = screen.getByLabelText('Decrement quantity');
        await act(async () => {
            await fireEvent.click(decrementButton);
        });

        expect(toast.error).toHaveBeenCalledWith('Failed to remove item from cart.');
    });

    it('handles checkout for guest user', async () => {
        // Mock trigger to return false to simulate validation failure
        vi.mocked(useForm).mockReturnValueOnce({
            ...vi.mocked(useForm)(),
            trigger: vi.fn().mockResolvedValue(false)
        });

        render(<CartPage />);

        const checkoutButton = screen.getByText('Checkout');
        await act(async () => {
            await fireEvent.click(checkoutButton);
        });

        // Should show error for missing address info
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Missing customer adress information'));
    });

    it('shows correct number of items', () => {
        render(<CartPage />);

        expect(screen.getByText('1 items')).toBeInTheDocument();
    });

    it('displays product image correctly', () => {
        render(<CartPage />);

        const image = screen.getByRole('img', { name: 'Product Image' });
        expect(image).toHaveAttribute('src', expect.stringContaining('test.jpg'));
    });

    it('handles successful checkout', async () => {
        render(<CartPage />);

        const checkoutButton = screen.getByText('Checkout');
        await act(async () => {
            await fireEvent.click(checkoutButton);
        });

        expect(cartApi.checkout).toHaveBeenCalledWith(1, expect.any(Object));
        expect(toast.success).toHaveBeenCalledWith('Checkout successful!');
    });
});
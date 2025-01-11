import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cart from '@/components/Store/Cart/Cart';
import AddressForm from '@/components/Store/Checkout/AddressForm';
import PaymentForm from '@/components/Store/Checkout/PaymentForm';
import { useCartStore } from '@/stores/cartStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import type { Product, CartItem, Address, PaymentDetails } from '@/types/stores';

// Mock the stores
vi.mock('@/stores/cartStore');
vi.mock('@/stores/checkoutStore');

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);

const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
    images: [],
    categories: [],
    available: true,
    brand: { id: 1, name: 'Test Brand' },
    subproducts: []
};

describe('Checkout Flow Integration', () => {
    beforeEach(() => {
        // Reset store states
        useCartStore.setState({
            items: [],
            total: 0,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn()
        });

        useCheckoutStore.setState({
            address: null,
            paymentMethod: null,
            setAddress: vi.fn(),
            setPaymentMethod: vi.fn(),
            processCheckout: vi.fn()
        });
    });

    it('should complete checkout flow with address and payment', async () => {
        const mockCartItems: CartItem[] = [
            { ...mockProduct, quantity: 2 }
        ];

        const mockAddress: Address = {
            street: '123 Test St',
            city: 'Test City',
            postal_code: '12345',
            country: 'Test Country'
        };

        const setAddress = vi.fn();
        const setPaymentMethod = vi.fn();
        const processCheckout = vi.fn().mockResolvedValue({ success: true });

        useCartStore.setState({
            items: mockCartItems,
            total: 200
        });

        useCheckoutStore.setState({
            setAddress,
            setPaymentMethod,
            processCheckout
        });

        render(
            <>
                <Cart showTotal />
                <AddressForm onSubmit={setAddress} />
                <PaymentForm amount={200} />
            </>
        );

        // Verify cart items
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();

        // Fill address form
        fireEvent.change(screen.getByLabelText(/street/i), {
            target: { value: mockAddress.street }
        });
        fireEvent.change(screen.getByLabelText(/city/i), {
            target: { value: mockAddress.city }
        });
        fireEvent.change(screen.getByLabelText(/postal code/i), {
            target: { value: mockAddress.postal_code }
        });
        fireEvent.change(screen.getByLabelText(/country/i), {
            target: { value: mockAddress.country }
        });

        // Submit address form
        const continueButton = screen.getByRole('button', { name: /continue/i });
        fireEvent.click(continueButton);

        // Verify address submission
        await waitFor(() => {
            expect(setAddress).toHaveBeenCalledWith(mockAddress);
        });

        // Select payment method
        const creditCardOption = screen.getByLabelText(/credit card/i);
        fireEvent.click(creditCardOption);

        // Fill payment details
        const mockPayment: PaymentDetails = {
            method: 'credit_card',
            cardNumber: '4242424242424242',
            expiry: '12/25',
            cvc: '123'
        };

        fireEvent.change(screen.getByLabelText(/card number/i), {
            target: { value: mockPayment.cardNumber }
        });
        fireEvent.change(screen.getByLabelText(/expiry/i), {
            target: { value: mockPayment.expiry }
        });
        fireEvent.change(screen.getByLabelText(/cvc/i), {
            target: { value: mockPayment.cvc }
        });

        // Submit payment
        const payButton = screen.getByRole('button', { name: /pay/i });
        fireEvent.click(payButton);

        // Verify checkout process
        await waitFor(() => {
            expect(processCheckout).toHaveBeenCalledWith({
                items: mockCartItems,
                address: mockAddress,
                payment: mockPayment
            });
        });
    });

    it('should show validation errors in address form', async () => {
        render(<AddressForm />);

        // Submit empty form
        const continueButton = screen.getByRole('button', { name: /continue/i });
        fireEvent.click(continueButton);

        // Verify validation errors
        await waitFor(() => {
            expect(screen.getByText(/street is required/i)).toBeInTheDocument();
            expect(screen.getByText(/city is required/i)).toBeInTheDocument();
            expect(screen.getByText(/postal code is required/i)).toBeInTheDocument();
            expect(screen.getByText(/country is required/i)).toBeInTheDocument();
        });
    });

    it('should show payment validation errors', async () => {
        render(<PaymentForm amount={100} />);

        // Submit empty form
        const payButton = screen.getByRole('button', { name: /pay/i });
        fireEvent.click(payButton);

        // Verify validation errors
        await waitFor(() => {
            expect(screen.getByText(/card number is required/i)).toBeInTheDocument();
            expect(screen.getByText(/expiry date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/cvc is required/i)).toBeInTheDocument();
        });
    });

    it('should handle payment processing error', async () => {
        const processCheckout = vi.fn().mockRejectedValue(new Error('Payment failed'));

        useCheckoutStore.setState({
            address: {
                street: '123 Test St',
                city: 'Test City',
                postal_code: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'credit_card',
            processCheckout
        });

        render(<PaymentForm amount={100} />);

        // Submit payment
        const payButton = screen.getByRole('button', { name: /pay/i });
        fireEvent.click(payButton);

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
        });
    });
}); 
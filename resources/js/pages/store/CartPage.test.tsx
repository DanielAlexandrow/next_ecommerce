import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CartPage from './CartPage';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('CartPage', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false }
            }
        });
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <CartPage />
            </QueryClientProvider>
        );
    };

    it('renders cart items correctly', async () => {
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByTestId('cart-items')).toBeInTheDocument();
        });

        // Verify cart contents
        expect(screen.getByTestId('shopping-cart-title')).toHaveTextContent('Shopping Cart');
        const items = screen.getAllByTestId('cart-item');
        expect(items.length).toBeGreaterThan(0);
    });

    it('handles quantity updates correctly', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByTestId('cart-items')).toBeInTheDocument();
        });

        const incrementButton = screen.getByTestId('increment-quantity-button');
        await user.click(incrementButton);

        await waitFor(() => {
            const quantity = screen.getByTestId('item-quantity');
            expect(parseInt(quantity.textContent || '0')).toBeGreaterThan(0);
        });
    });

    it('calculates total price correctly', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByTestId('cart-total')).toBeInTheDocument();
        });

        const total = screen.getByTestId('cart-total');
        expect(total.textContent).toMatch(/\$\d+\.\d{2}/);
    });

    it('handles checkout process', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByTestId('cart-items')).toBeInTheDocument();
        });

        const checkoutButton = screen.getByRole('button', { name: /checkout/i });
        await user.click(checkoutButton);

        // Verify redirect or success message
        await waitFor(() => {
            expect(screen.getByTestId('checkout-success')).toBeInTheDocument();
        });
    });
});
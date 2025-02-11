import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductList from '@/components/Store/Product/ProductList';
import ProductSearch from '@/components/Store/Search/ProductSearch';
import Cart from '@/components/Store/Cart/Cart';
import { useProductSearchStore } from '@/stores/productSearchStore';
import { useCartStore } from '@/stores/cartStore';
import type { Product, CartItem } from '@/types/stores';

// Mock the stores
vi.mock('@/stores/productSearchStore');
vi.mock('@/stores/cartStore');

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);

const mockProduct: Product = {
    id: 1,
    name: 'Test Product 1',
    price: 100,
    description: 'Test Description',
    images: [],
    categories: [],
    available: true,
    brand: { id: 1, name: 'Test Brand' },
    subproducts: []
};

describe('Product Flow Integration', () => {
    beforeEach(() => {
        // Reset store states
        useProductSearchStore.setState({
            products: [],
            isLoading: false,
            filters: {},
            setProducts: vi.fn(),
            setIsLoading: vi.fn(),
            setFilters: vi.fn()
        });

        useCartStore.setState({
            items: [],
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn()
        });
    });

    it('should search for products and add to cart', async () => {
        const mockProducts = [
            mockProduct,
            { ...mockProduct, id: 2, name: 'Test Product 2', price: 200 }
        ];

        // Mock store functions
        const setProducts = vi.fn();
        const addToCart = vi.fn();

        useProductSearchStore.setState({
            products: mockProducts,
            setProducts,
            isLoading: false
        });

        useCartStore.setState({
            items: [],
            addItem: addToCart
        });

        // Render components
        render(
            <>
                <ProductSearch />
                <ProductList products={mockProducts} />
                <Cart />
            </>
        );

        // Search for products
        const searchInput = screen.getByPlaceholderText(/search/i);
        fireEvent.change(searchInput, { target: { value: 'test' } });

        // Wait for products to load
        await waitFor(() => {
            expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        });

        // Add product to cart
        const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
        fireEvent.click(addButtons[0]);

        // Verify cart update
        await waitFor(() => {
            expect(addToCart).toHaveBeenCalledWith(mockProducts[0]);
        });
    });

    it('should update cart quantities and total', async () => {
        const cartItem: CartItem = { ...mockProduct, quantity: 1 };
        const updateQuantity = vi.fn();

        useCartStore.setState({
            items: [cartItem],
            updateQuantity,
            total: 100
        });

        render(<Cart showTotal />);

        // Find quantity input
        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '2' } });

        // Verify quantity update
        await waitFor(() => {
            expect(updateQuantity).toHaveBeenCalledWith(1, 2);
        });
    });

    it('should filter products by category', async () => {
        const mockCategories = [
            { id: 1, name: 'Category 1' },
            { id: 2, name: 'Category 2' }
        ];

        const setFilters = vi.fn();

        useProductSearchStore.setState({
            categories: mockCategories,
            setFilters
        });

        render(
            <>
                <ProductSearch categories={mockCategories} />
                <ProductList />
            </>
        );

        // Select category
        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        fireEvent.change(categorySelect, { target: { value: '1' } });

        // Verify filter update
        await waitFor(() => {
            expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({
                categoryId: '1'
            }));
        });
    });

    it('should show loading states during search', async () => {
        useProductSearchStore.setState({
            isLoading: true,
            products: []
        });

        render(
            <>
                <ProductSearch />
                <ProductList loading />
            </>
        );

        // Verify loading state
        expect(screen.getAllByTestId('product-skeleton')).toHaveLength(6);

        // Update to loaded state
        useProductSearchStore.setState({
            isLoading: false,
            products: [mockProduct]
        });

        // Verify loaded content
        await waitFor(() => {
            expect(screen.queryByTestId('product-skeleton')).not.toBeInTheDocument();
            expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        });
    });
}); 